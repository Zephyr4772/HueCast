/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAQI_API_TOKEN: string;
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
