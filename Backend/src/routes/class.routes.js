import { Router } from "express";
import { verifyOwnerToken } from "../middlewares/auth.middleware.js";
import { verifyProfessorToken } from "../middlewares/auth.middleware.js";
import { verifyUserToken } from "../middlewares/auth.middleware.js";

import {
    createClass,
    getStudentsInaClass,
    getAttendanceRecordFortheClass,
    getAttendanceofaStudent,
    getClassCode,
    getClassesOfToday
    
} from "../controllers/class.controller.js";

const router = Router();

router.route("/create-class").post(verifyOwnerToken, createClass);
router.route("/get-students/:classId").get(getStudentsInaClass);
router.route("/get-attendance").post(getAttendanceRecordFortheClass);
router.route("/get-attendance-of-a-student").post(verifyUserToken, getAttendanceofaStudent);
router.route("/get-class-code/:classId").get(getClassCode);
router.route("/get-classes-of-today").get(verifyProfessorToken, getClassesOfToday);

export default router;

