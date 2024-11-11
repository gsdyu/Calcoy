// next.config.js
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const nextConfig = {
  trailingSlash: true,
  output: 'export',
  webpack: (config) => {
    config.plugins.push(new CaseSensitivePathsPlugin());
    return config;
  },
};

module.exports = nextConfig;
