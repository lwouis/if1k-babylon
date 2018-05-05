const path = require('path')
const {DefinePlugin, NamedModulesPlugin, HotModuleReplacementPlugin} = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const src = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')

module.exports = (env, options) => ({
  context: src,
  entry: './ts/main.ts',
  output: {
    filename: 'app.js',
    path: dist,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      }, {
        test: /\.jpg$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    oimo: true,
    cannon: true,
    earcut: true,
  },
  plugins: [
    new HtmlWebpackPlugin({template: 'index.ejs'}), new CopyWebpackPlugin([
      {
        from: path.join(src, 'assets'),
        to: path.join(dist, 'assets'),
      },
    ]), new NamedModulesPlugin(), new HotModuleReplacementPlugin(),
  ],
  devtool: options.mode === 'development' ? 'inline-source-map' : false,
  devServer: {
    host: 'localhost',
    contentBase: path.join(dist, 'assets'),
    hot: true,
  },
})
