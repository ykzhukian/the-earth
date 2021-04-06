const path = require('path');
const resolve = (dir) => path.join(__dirname, dir);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jpe?g$|\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[ext]'
            }
          },
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': resolve('src'),
    },
    fallback: {
      fs: false,
      path: false
    },
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      name: 'common',
      minChunks: 2
    }
  },
  output: {
    publicPath: '/',
    path: resolve('./dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./index.html'),
      title: '地球',
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns:['**/*']
    }),
  ],
  devServer: {
    contentBase: resolve('dist'),
    port: 9000,
    hot: true,
  },
};
