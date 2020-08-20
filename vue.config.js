'use strict'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = 'victor-classroom'
const port = 8080

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  transpileDependencies: ['vuex-module-decorators'],
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    disableHostCheck: true,
    proxy: {
      '/api': {
        target: 'http://dev-tutor-admin.victor.vip/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
          '^/courseware/api': ''
        }
      }
    }
  },
  configureWebpack: {
    name: name,
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.vue'],
      alias: {
        '@': resolve('src')
      }
    },
    output: {
      filename: '[name].[hash].js',
      chunkFilename: '[name].[hash].js'
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            }
          ]
        }
      ]
    }
  },
  'css': {
    sourceMap: true
  }
}
