'use strict'
const path = require('path')
const webpack = require('webpack')
const htmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, './'),
  devServer: {
    contentBase: './dist', //服务器所加载文件的目录
    port: '8080',
    inline: true, //文件修改后十实时刷新
    historyApiFallback: true, //使用HTML5 historyAPI时对于任何404响应返回index.html
    hot: true, //热更新
    open: true,
  },
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /(png|jpeg|jpg|svg|gif)$/,
        use:　[
          {
            loader: 'url-loader',
            options: {
              limit : 8192, // 小于8kb的文件则转为dataURL:Base64形式，大于8kb则交由file-loader处理，生成新图片并打包
              name: '[name].[hash:7].[ext]',
              outputPath: 'img'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      //该插件可以自动生成HTML文件。并导入静态资源
      title: 'my-webpack',
      template: './src/index.html',
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin(),// 热更新插件 
    new webpack.NamedModulesPlugin,
    new CleanWebpackPlugin(),
  ]
}