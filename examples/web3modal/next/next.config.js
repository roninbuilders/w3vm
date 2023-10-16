/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    webpack: (config) => {
    config.externals.push("pino-pretty");
    return config;
  },
}

module.exports = nextConfig
