import mongoose from "mongoose";
import  {DB_NAME} from "../constants.js";

export const dbConnect = async() => {
    try {
        const connenctionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connenctionInstance.connection.host}`);    
    }
    catch(err) {
        console.log(err);
        process.exit(1);
        // It's important to throw an error so that the server shuts down. This point can be a good question to ask yourself.
    }
}