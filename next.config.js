/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set output file tracing root to avoid workspace detection issues
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
