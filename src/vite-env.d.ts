/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GITHUB_UPLOADER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
