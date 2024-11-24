import { Router } from "express";
import { verifyOwnerToken } from "../middlewares/auth.middleware.js";
import { verifyProfessorToken } from "../middlewares/auth.middleware.js";
import { verifyUserToken } from "../middlewares/auth.middleware.js";

import {
    setupCourse,
    enrollInaCourse,
    getClasses,
    getstudentsInaCourse,
    getAttendanceRecordInaCourse,
    getCourseDetails
} from "../controllers/course.controller.js";

const router = Router();

router.route("/setup-course").post(verifyOwnerToken, setupCourse);
router.route("/enroll-in-a-course").post(verifyUserToken, enrollInaCourse);
router.route("/get-classes/").post(getClasses);
router.route("/get-students/").post(getstudentsInaCourse);
router.route("/get-attendance/").post(getAttendanceRecordInaCourse);
router.route("/get-course-details/").post(getCourseDetails);

export default router;

