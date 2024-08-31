import { configDotenv } from "dotenv";

configDotenv({
    path: "./.env"
});

import app from "./app.js";
import { dbConnect } from "./db/dbconnect.js";

dbConnect()
.then(
   () => {
    app.listen(process.env.PORT || 5001, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    })
   }
 )
.catch(
    (error) => {
        console.log("ERROR IN STARTING SERVER. MONGODB CONNECTION FAILED", error);
    }
)

