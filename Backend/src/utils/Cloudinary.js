import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_NAME, // Note: Typo in env var name is intentional/legacy
    api_key: process.env.CLOUDNARY_KEY,
    api_secret: process.env.CLOUDNARY_SECRET,
    secure: true
})

const uploadOncloudinary = async (fileBuffer, originalname) => {
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDNARY_NAME || !process.env.CLOUDNARY_KEY || !process.env.CLOUDNARY_SECRET) {
            throw new Error("Cloudinary configuration is missing. Please check your environment variables.");
        }

        if (!fileBuffer) {
            throw new Error("File buffer is required for upload");
        }

        // Convert buffer to base64 string for Cloudinary
        const base64String = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(base64String, {
            resource_type: "auto",
            folder: "driveiq-cars"
        });

        console.log("File uploaded successfully:", response.url);
        return response.url;

    } catch (error) {
        console.error("Error in file upload:", error);

        // Provide more specific error messages
        if (error.message.includes("Cloudinary configuration")) {
            throw new Error("Cloudinary is not properly configured. Please check your environment variables.");
        }

        if (error.http_code) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }

        throw new Error(`File upload failed: ${error.message}`);
    }
}

const deleteOnCloudinary = async (filepath) => {
    try {
        if (!process.env.CLOUDNARY_NAME || !process.env.CLOUDNARY_KEY || !process.env.CLOUDNARY_SECRET) {
            throw new Error("Cloudinary configuration is missing");
        }

        const result = await cloudinary.uploader.destroy(filepath);
        console.log("File deleted from Cloudinary:", result);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
    }
}

export { uploadOncloudinary, deleteOnCloudinary }