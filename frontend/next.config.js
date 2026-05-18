

const nextConfig = {
  reactStrictMode: true,
  // Required for Stellar SDK (uses Node.js built-ins)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
