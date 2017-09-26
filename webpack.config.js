const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    regulator: './app/javascripts/regulator.js',
    tollbooth: './app/javascripts/tollbooth.js',
    vehicle: './app/javascripts/vehicle.js',
    tollbooth_booth: './app/javascripts/tollbooth_booth.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js' 
  },
  watch: true,
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
      { from: './app/regulator.html', to: "regulator.html" },
      { from: './app/tollbooth.html', to: "tollbooth.html" },
      { from: './app/vehicle.html', to: "vehicle.html" },
      { from: './app/tollbooth_booth.html', to: "tollbooth_booth.html" },
    ])
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  devServer: {
    host: '0.0.0.0'
  }
}
 