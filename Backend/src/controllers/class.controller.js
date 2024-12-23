import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Class } from "../models/class.mjs";
import { Course } from "../models/course.mjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Attendance } from "../models/attendance.mjs";
import { Student } from "../models/student.mjs";

const generatedCodes = new Set();

function generateUniqueCode() {
    let code;
    do {
        code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (generatedCodes.has(code));

    generatedCodes.add(code);
    return code;
}

const createClass = asyncHandler(async (req, res) => {
    const { courseCode, date, startTime, endTime } = req.body;
    // CourseCode is taken as input to find out the id of the course this class belongs to
    const course = await Course.findOne(
        {
            code: courseCode
        }
    )

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const classCode = generateUniqueCode();

    const classCreation = await Class.create({
        code: classCode,
        course: new mongoose.Types.ObjectId(course._id),
        date,
        startTime,
        endTime
    })

    if (!classCreation) {
        throw new ApiError(400, "Something went wrong in class creation");
    }

    // Add the class code to the course
    course.classes.push(classCreation._id);
    await course.save(
        {
            validateBeforeSave: false
        }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Class created successfully", classCreation)
        )
});

const getStudentsInaClass = asyncHandler(async (req, res) => {

    const classId = req.params.classId;

    if (!classId) {
        throw new ApiError(400, "Class id is required");
    }

    const courses = await Course.aggregate([{
        $unwind: "$classes"
    },
    {
        $match: {
            "classes": new mongoose.Types.ObjectId(classId)
        }
    }]);

    if (courses.legnth > 0) {
        throw new ApiError(404, "Class not found");
    }

    const students = await Student.find({

        course: {
            $in: [
                courses[0]._id
            ]
        }

    }).select("-password -refreshToken -course -attendanceRecord");

    if (!students) {
        throw new ApiError(404, "Students not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Students fetched successfully", students)
        );

});

const getAttendanceofaStudent = asyncHandler(async (req, res) => {

    const { classId } = req.body;

    const student = await Student.findOne({
        user: new mongoose.Types.ObjectId(req.user._id)
    })

    // console.log("User : ", req.user._id)

    console.log("Student : ", student)

    if (!student) {
        throw new ApiError(500, "Student AC details could not be fetched.")
    }

    const attendanceRecord = await Attendance.findOne({
        $and: [
            {
                class: new mongoose.Types.ObjectId(classId)
            },
            {
                student: new mongoose.Types.ObjectId(student._id)
            }
        ]
    }).select("-password -refreshToken");

    console.log("Attendance Record : ", attendanceRecord)

    let attendanceStatus = "Absent";

    if (attendanceRecord && attendanceRecord.status === true) {
        attendanceStatus = "Present";
    }

    console.log("Attendance Status : ", attendanceStatus)

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Attendance record fetched successfully", attendanceStatus)
        );
})

const getAttendanceRecordFortheClass = asyncHandler(async (req, res) => {

    const { classId } = req.body;

    if (!classId) {
        throw new ApiError(400, "Class id is required");
    }

    const attendances = await Attendance.aggregate([
        {
            $match: {
                class: new mongoose.Types.ObjectId(classId)
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "student",
                foreignField: "_id",
                as: "studentInfo"
            }
        },
        {
            $addFields: {
                enrollmentNumber: "$studentInfo.enrollNo"
            }
        },
        {
            $project: {
                enrollmentNumber: 1,
                status: 1
            }
        }
    ])

    if (!attendances) {
        throw new ApiError(404, "Attendances not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Attendances fetched successfully", attendances)
        );

});

const getClassCode = asyncHandler(async (req, res) => {

    const { classId } = req.params;

    const class_code = await Class.findById(classId).select("-attendances -course");

    if (!class_code) {
        throw new ApiError(404, "Class not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Class code fetched successfully", class_code)
        );
})

const getClassesOfToday = asyncHandler(async (req, res) => {

    const classes = await Course.aggregate([
        {
            $match: {
                professor: new mongoose.Types.ObjectId(req.professor._id)
            }
        },
        {
            $unwind: "$classes"
        },
        {
            $lookup: {
                from: "classes",
                localField: "classes",
                foreignField: "_id",
                as: "classInfo"
            }
        },
        {
            $unwind: "$classInfo"
        },
        {
            $match: {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$classInfo.date" } }, 
                        { $dateToString: { format: "%Y-%m-%d", date: new Date() } }
                    ]
                }
            }
        }
    ])

    console.log("Classes : ", classes)

    if (!classes) {
        throw new ApiError(404, "Classes not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Classes fetched successfully", classes)
        );
})

export {
    createClass,
    getStudentsInaClass,
    getAttendanceRecordFortheClass,
    getAttendanceofaStudent,
    getClassCode,
    getClassesOfToday
};
