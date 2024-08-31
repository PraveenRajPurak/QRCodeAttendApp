import express from "express";
import cors from "cors";

const app = express();

app.use(cors(
    {
        origin : process.env.CORS_URL,
        credentials : true
    }
));
// Another point we had missed out earlier. We need to properly configure CORS. 

app.use(express.json({limit : "16Kb"}))
app.use(express.urlencoded({extended : true, limit : "16Kb"}))
app.use(express.static("public"))

export default app;

//Routes

import userRoutes from "./routes/user.routes.js";

import ownerRoutes from "./routes/owner.routes.js";

import studentRoutes from "./routes/students.routes.js";

import professorRoutes from "./routes/professor.routes.js";

import courseRoutes from "./routes/course.routes.js";

import classRoutes from "./routes/class.routes.js";

import attendanceRoutes from "./routes/attendance.routes.js";

import collegeRoutes from "./routes/college.routes.js"

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/owner",ownerRoutes);

app.use("/api/v1/student",studentRoutes)

app.use("/api/v1/professor",professorRoutes)

app.use("/api/v1/course",courseRoutes)

app.use("/api/v1/class",classRoutes)

app.use("/api/v1/attendance",attendanceRoutes)

app.use("/api/v1/college",collegeRoutes)
