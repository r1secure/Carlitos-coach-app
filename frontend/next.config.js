/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable Turbopack to use Webpack with Tailwind CSS
    experimental: {
        turbo: undefined,
    },
}

module.exports = nextConfig
