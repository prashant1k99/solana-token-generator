import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { NetworkProvider, useNetwork } from "./network-context.tsx";

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

const WalletProviderInner: React.FC<SolanaWalletProviderProps> = (
  { children },
) => {
  const { endpoint } = useNetwork();

  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new UnsafeBurnerWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    [],
  );

  console.log(wallets);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const SolanaWalletProvider: React.FC<SolanaWalletProviderProps> = (
  { children },
) => {
  return (
    <NetworkProvider>
      <WalletProviderInner>
        {children}
      </WalletProviderInner>
    </NetworkProvider>
  );
};
