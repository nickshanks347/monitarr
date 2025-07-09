/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    env: {
        NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || '',
    },
};

export default nextConfig;
