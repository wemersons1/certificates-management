/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_URL: string
    readonly VITE_URL_IMAGE: string;
    readonly VITE_MERCADOPAGO_PUBLIC_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }