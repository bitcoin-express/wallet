//require our dependencies
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var initFile = './wallet';
var destFile = 'bitcoin-fast-client.js';

module.exports = function (version, destPath) {

  return {
    //the base directory (absolute path) for resolving the entry option
    context: __dirname,
    //the entry point we created earlier. Note that './' means 
    //your current directory. You don't have to specify the extension  now,
    //because you will specify extensions later in the `resolve` section
    entry: initFile, 

    output: {
      //where you want your compiled bundle to be stored
      path: path.resolve(destPath), 
      //naming convention webpack should use for your files
      filename: destFile, 
    },
    
    plugins: [
      //makes jQuery available in every module
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery' 
      }),
      //simplifies creation of HTML files to serve your webpack bundles
      new HtmlWebpackPlugin({
        title: 'Bitcoin-e',
        template: 'wallet.ejs',
        version: version,
        filename: '../wallet.html'
      }),
      //copies individual files or entire directories to the build directory
      new CopyWebpackPlugin([
        { from: 'js', to: 'vendor' },
        { from: 'css', to: '../css' },
        { from: 'imgs', to: '../css/img' },
        { from: 'test/demo.html', to: '../test/demo.html' },
        { from: 'probe.html', to: '../probe.html' }
      ]),
      new ExtractTextPlugin('../css/styles.css'),
    ],

    module: {
      rules: [
        //a regexp that tells webpack use the following loaders on all 
        //.js and .jsx files
        {
          test: /\.jsx?$/, 
          //we definitely don't want babel to transpile all the files in 
          //node_modules. That would take a long time.
          exclude: /node_modules/, 
          //use the babel loader 
          loader: 'babel-loader', 
          query: {
            //specify that we will be dealing with React code
            presets: ['react', 'es2015'] 
          }
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: 'css-loader'
          }),
        },
        {
          test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '../css/fonts/', // where the fonts will go
              publicPath: './' // override the default path
            }
          }]
        },
      ]
    },

    resolve: {
      //tells webpack where to look for modules
      //modulesDirectories: ['node_modules'],
      //extensions that should be used to resolve modules
      extensions: ['.js', '.jsx'] 
    }   
  };
}
