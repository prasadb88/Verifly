import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.error("MONGODB_URL is not defined in .env file");
            process.exit(1);
        }

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED");
        console.log("Error Name:", error.name);
        console.log("Error Message:", error.message);
        process.exit(1);
    }
}

export default connectDB;