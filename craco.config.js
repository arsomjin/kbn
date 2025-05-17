const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'api': path.resolve(__dirname, 'src/api'),
      'elements': path.resolve(__dirname, 'src/elements'),
      'functions': path.resolve(__dirname, 'src/utils/functions'),
      'data': path.resolve(__dirname, 'src/data'),
      'utils': path.resolve(__dirname, 'src/utils')
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ],
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        net: false,
        tls: false
      };
      
      // Add a rule to handle browser field in package.json
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      });
      
      // Handle imports without ./ prefix
      webpackConfig.resolve.preferRelative = true;
      
      return webpackConfig;
    }
  }
};