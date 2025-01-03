import { PublicKey } from "@solana/web3.js";

export async function uploadToGithub({
  content,
  fileName,
  publicKey,
  mintPublicKey
}: {
  content: Blob,
  fileName: string,
  publicKey: PublicKey,
  mintPublicKey: PublicKey,
}) {
  const fileExt = fileName.split(".")[1];
  if (!["json", "jpeg", "jpg", "png", "gif"].includes(fileExt)) {
    throw new Error(`Invalid file type: ${fileName}`)
  }

  const URL = import.meta.env.VITE_GITHUB_UPLOADER_URL

  const formdata = new FormData();

  if (fileExt == "json") {
    formdata.append("path", `token-metadata/${publicKey.toString()}/${mintPublicKey.toString()}.json`);
  } else {
    formdata.append("path", `token-image/${publicKey.toString()}/${mintPublicKey.toString()}.${fileExt}`);
  }
  formdata.append("message", "Testing content type");
  formdata.append("file", content, fileName);
  formdata.append("contentType", "");

  const requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow" as RequestRedirect,
  };

  const response = await fetch(URL, requestOptions);
  return response.json();
}

export async function deleteFileFromGithub(filePath: string) {
  const url = new URL(
    `${import.meta.env.VITE_GITHUB_UPLOADER_URL}?path=${encodeURIComponent(filePath)}`
  )

  const requestOptions = {
    method: "DELETE",
    redirect: "follow" as RequestRedirect,
  }

  const response = await fetch(url, requestOptions)
  return response.json()
}
