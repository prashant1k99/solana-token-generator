import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { deleteFileFromGithub, uploadToGithub } from "@/helpers/uploadToGithub";
import {
  Connection,
  Keypair,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";


async function Upload({
  content,
  fileName,
  publicKey,
  mintPublicKey,
}: {
  content: Blob,
  fileName: string,
  publicKey: PublicKey,
  mintPublicKey: PublicKey,
}) {
  try {
    const response = await uploadToGithub({
      content,
      fileName,
      publicKey,
      mintPublicKey,
    });
    if (!response.success) {
      return {
        success: false,
      }
    }
    return response
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      }
    }
    return {
      success: false,
    }
  }
}

export async function createToken({
  formData,
  publicKey,
  signTransaction,
  endpoint,
}: {
  formData: {
    name: string,
    description?: string,
    decimals: number,
    image: File,
    symbol: string,
    supply?: number,
    freezeSupply?: boolean,
  },
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  endpoint: string
}) {
  // Generate Mint KeyPair
  const mintKeypair = Keypair.generate();

  const imageResponse = await Upload({
    content: formData.image,
    fileName: formData.image.name,
    publicKey,
    mintPublicKey: mintKeypair.publicKey
  });
  if (!imageResponse.success) {
    const message = imageResponse.message || "Failed to upload image"
    throw new Error(message);
  }
  const image_url = imageResponse.data.content.download_url;
  const imageFilePath = imageResponse.data.content.path;

  // Upload metadata to Github
  const metadataResponse = await Upload({
    content: new Blob([JSON.stringify({
      name: formData.name,
      description: formData.description,
      symbol: formData.symbol,
      image: image_url,
    }, null, 2)], {
      type: "application/json",
    }),
    fileName: "metadata.json",
    publicKey,
    mintPublicKey: mintKeypair.publicKey,
  })
  if (!metadataResponse.success) {
    await deleteFileFromGithub(imageFilePath);
    const message = metadataResponse.message || "Failed to upload metadata"
    throw new Error(message);
  }
  const metadat_url = metadataResponse.data.content.download_url;
  const metadataFilePath = metadataResponse.data.content.path;
  const conn = new Connection(endpoint, "confirmed");

  try {

    // Constants to make life easier
    const mint = mintKeypair.publicKey;
    const mintAuthority = publicKey;
    const updateAuthority = publicKey;
    const freezeAuthority = publicKey;


    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    const metaData: TokenMetadata = {
      updateAuthority,
      mint: mintKeypair.publicKey,
      name: formData.name,
      symbol: formData.symbol || "",
      uri: metadat_url,
      additionalMetadata: [],
    };


    const metadataLen = pack(metaData).length;

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const balance = await conn.getBalance(publicKey);
    // Lamports needed for Creating Token
    const lamports = await conn.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen,
    );
    if (balance < lamports) {
      throw new Error("Insufficient balance, need at least 1 SOL");
    }

    const transaction = new Transaction();

    // Instruction to invoke System Program to create new account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: publicKey, // Account that will transfer lamports to created account
      newAccountPubkey: mint, // Address of the account to create
      space: mintLen, // Amount of bytes to allocate to the created account
      lamports, // Amount of lamports transferred to created account
      programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });

    // Get the associated token account address
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mint, // mint address
      publicKey, // owner
      false, // allow owner off curve
      TOKEN_2022_PROGRAM_ID, // programId
    );

    // Create the associated token account instruction
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey, // payer
      associatedTokenAccount, // ata address
      publicKey, // owner
      mint, // mint
      TOKEN_2022_PROGRAM_ID, // programId
    );

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint, // Mint Account address
        publicKey, // Authority that can set the metadata address
        mintKeypair.publicKey, // Account address that holds the metadata
        TOKEN_2022_PROGRAM_ID,
      );

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mintKeypair.publicKey,
      formData.decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_2022_PROGRAM_ID,
    );

    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: updateAuthority, // Authority that can update the metadata
      mint, // Mint Account address
      mintAuthority: mintAuthority, // Designated Mint Authority
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
    });

    transaction.add(
      createAccountInstruction, // 1. Create the mint account,
      initializeMetadataPointerInstruction, // 2. Setup metadata Pointer
      // note: the above instructions are required before initializing the mint
      initializeMintInstruction, // 3. Initialize Mint
      createATAInstruction, // 4. Create the associated token account,
      initializeMetadataInstruction, // 5. Initialize metadata
    );

    if (formData.supply) {
      transaction.add(createMintToInstruction(
        mint,
        associatedTokenAccount,
        publicKey,
        formData.supply * (10 ** formData.decimals),
        [],
        TOKEN_2022_PROGRAM_ID
      ))

      if (formData.freezeSupply) {
        transaction.add(
          createSetAuthorityInstruction(
            mint,
            publicKey,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_2022_PROGRAM_ID,
          )
        )
      }
    }

    const { blockhash } = await conn.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    // Sign transaction
    transaction.sign(mintKeypair);

    const signedTransaction = await signTransaction(transaction);
    if (!signedTransaction) {
      throw new Error("Transaction not completed");
    }

    const signature = await conn.sendRawTransaction(
      signedTransaction.serialize(),
    );
    const confirmation = await conn.confirmTransaction({
      signature,
      blockhash: transaction.recentBlockhash!,
      lastValidBlockHeight:
        ((await conn.getLatestBlockhash()).lastValidBlockHeight),
    }, "confirmed");
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return {
      signature,
      mintPublicKey: mintKeypair.publicKey,
    }
  } catch (error) {
    await deleteFileFromGithub(imageFilePath)
    await deleteFileFromGithub(metadataFilePath)

    if (error instanceof SendTransactionError) {
      console.log(await error.getLogs(conn));
      throw new Error("Error while processing transaction: " + error.message);
    } else throw error
  }
}
