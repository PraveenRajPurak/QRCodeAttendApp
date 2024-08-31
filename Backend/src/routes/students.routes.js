import { Router } from "express";
import { verifyUserToken } from "../middlewares/auth.middleware.js";

import {
    setupStudent,
    getCourses,
    getClasses,
    checkStudentAccountPresence,
    getStudentdata,
    getStudentPlusUserData,
    getStudentAvatar,
    instituteInformation,
    getCourseNames
} from "../controllers/students.controller.js";

const router = Router();

router.route("/setup-student").post(verifyUserToken, setupStudent);
router.route("/get-courses").get(verifyUserToken, getCourses);
router.route("/get-classes/:courseId").get(verifyUserToken, getClasses);
router.route("/check-student-account-presence").get(verifyUserToken, checkStudentAccountPresence);
router.route("/get-student-data").get(verifyUserToken, getStudentdata);
router.route("/get-student-plus-user-data").get(verifyUserToken, getStudentPlusUserData);
router.route("/get-student-avatar").get(verifyUserToken, getStudentAvatar);
router.route("/institute-information").get(verifyUserToken, instituteInformation);
router.route("/get-course-names").get(verifyUserToken, getCourseNames);

export default router;

