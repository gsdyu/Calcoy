const nextConfig = {
  output: 'export',
  webpack: (config) => {
    config.plugins.push(new CaseSensitivePathsPlugin());
    return config;
  },
};
