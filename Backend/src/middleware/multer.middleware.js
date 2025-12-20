import multer from 'multer';

// Use memory storage for serverless environments like Vercel
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 30
    }
});