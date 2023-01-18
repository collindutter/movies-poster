/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/films",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
