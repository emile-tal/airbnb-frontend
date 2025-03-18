/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'images.unsplash.com', // Allow Unsplash images
            'res.cloudinary.com'   // Allow Cloudinary images (for your uploads)
        ],
    },
}

module.exports = nextConfig 