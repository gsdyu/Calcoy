const nextConfig = {
  output: 'export',
  distDir: 'out',
  webpack: (config) => {
    config.plugins.push(new CaseSensitivePathsPlugin());
    return config;
  },
};
