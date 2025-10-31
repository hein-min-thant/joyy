/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.convex.cloud',
            },
            {
                protocol: 'https',
                hostname: 'ibb.co',
            },
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
            },
            {
                protocol: 'https',
                hostname: '**.imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'imgur.com',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig;
