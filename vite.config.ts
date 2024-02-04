/**
 * @description vite 配置文件
 * @extends https://cn.vitejs.dev/config
 */
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl'
import { compression } from 'vite-plugin-compression2'

/**
 * vite坑点总结：
 * 1.环境变量文件 .env 不允许配置 NODE_ENV
 * 2.环境变量加载特殊字符串时会有问题，例如 secret.ts 中的密钥
 * 3.对于部分库必须允许 ts 合成 import，否则打包后运行会报错，例如 day.js
 * 4.导入方式 import.meta.glob 在打包后运作机制和 webpack 的 require.context 不一致，需要额外处理
 */

process.env.VITE_APP_BUILDTIME = `${new Date()}`

export default defineConfig({
  // 1.静态资源路径
  base: './',
  // 2.开发服务器
  server: {
    open: true
  },
  // 3.引用
  resolve: {
    // 路径别名：js -> '@/'、css -> '@/'
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 4.忽略解析的静态资源格式：https://cn.vitejs.dev/config/shared-options.html#assetsinclude
  assetsInclude: [
    '**/*.hdr',
    '**/*.gltf',
    '**/*.glb',
    '**/*.fbx',
    '**/*.JPEG',
    '**/*.PNG',
    '**/*.GIF'
  ],
  // 5.插件
  plugins: [
    /**
     * @vitejs/plugin-vue
     * 作用：vue3 SFC 组件编译
     */
    vue(),
    /**
     * vite-plugin-glsl
     * 作用：支持解析 .glsl 文件
     * 仓库：https://github.com/UstymUkhman/vite-plugin-glsl
     */
    glsl(),
    /**
     * vite-plugin-compression2
     * 作用：压缩构建产物
     * 仓库：https://github.com/nonzzz/vite-plugin-compression
     */
    compression()
  ]
})
