import { Router } from "express";
import { verifyOwnerToken } from "../middlewares/auth.middleware.js";
import { verifyProfessorToken } from "../middlewares/auth.middleware.js";
import { verifyUserToken } from "../middlewares/auth.middleware.js";

import {
    setupCollege,
    getStudentsRecords,
    getProfessorsRecords,
    setupProfessor,
    coursesInaCollege,
    checkCollegeOwnershipPresence,
    getAllCollegeNames,
    getCollege
} from "../controllers/college.controller.js";

const router = Router();

router.route("/setup-college").post(verifyOwnerToken, setupCollege);
router.route("/get-students").post(verifyOwnerToken, getStudentsRecords);
router.route("/get-professors").post(verifyOwnerToken, getProfessorsRecords);
router.route("/setup-professor").post(verifyOwnerToken, setupProfessor);
router.route("/courses-in-a-college").post(verifyOwnerToken, coursesInaCollege);
router.route("/check-college-ownership-presence").get(verifyOwnerToken, checkCollegeOwnershipPresence);
router.route("/get-all-college-names").get(verifyOwnerToken, getAllCollegeNames);
router.route("/get-college").get(verifyOwnerToken, getCollege);

export default router;