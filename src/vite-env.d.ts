/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 配置变量 */
  VITE_APP_ENV: 'development' | 'production'
  /** Web 存储命名空间 */
  VITE_APP_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
