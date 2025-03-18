import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary result type
interface CloudinaryResult {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert buffer to base64
        const base64 = buffer.toString('base64');
        const fileUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await new Promise<CloudinaryResult>((resolve, reject) => {
            cloudinary.uploader.upload(
                fileUri,
                {
                    folder: 'vibe-rentals',
                },
                function (err, result) {
                    if (err || !result) {
                        return reject(err || new Error('No result from Cloudinary'));
                    }
                    resolve(result as CloudinaryResult);
                }
            );
        });

        // Return the Cloudinary URL
        return NextResponse.json({
            url: result.secure_url
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
} 