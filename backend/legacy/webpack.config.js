/* eslint-env node */
const path = require('path');

module.exports = {
  entry: {
    'client-auth': './js/client-auth.js',
    'client-dashboard': './js/client-dashboard.js',
    'client-vehicle-details': './js/client-vehicle-details.js',
    'admin-login': './js/admin-login.js',
    'admin-dashboard': './js/admin-dashboard.js',
    'admin-car-brands': './js/admin-car-brands.js',
    'admin-blog': './js/admin-blog.js',
    'admin-bookings': './js/admin-bookings.js',
    'dashboard-components': './js/dashboard-components.js',
    'dashboard-grid-simple': './js/dashboard-grid-simple.js',
    'booking': './js/booking.js',
    'blog': './js/blog.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'js/dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  // Only include source maps in development mode
  // In production mode (--mode production), source maps are disabled
  devtool: 'source-map',
  // Production optimizations are handled by --mode production
  optimization: {
    minimize: true
  }
};

