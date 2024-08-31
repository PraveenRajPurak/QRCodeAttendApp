import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Student } from "../models/student.mjs";
import { User } from "../models/user.mjs";
import { Course } from "../models/course.mjs";
import { Class } from "../models/class.mjs";
import { College } from "../models/college.mjs";

import mongoose from "mongoose";

const setupStudent = asyncHandler(async (req, res) => {

        const { enrollNo, institute_name, batch} = req.body
        if(!(enrollNo || institute_name || batch)) {
            throw new ApiError(400, "All fields are required");
        }

        console.log("EnrollNo, institute_name, batch : ", enrollNo, institute_name, batch)

        const institute = await College.findOne({
            name: institute_name
        })

        console.log("Institute : ", institute)

        if(!institute) {
            throw new ApiError(400, "Institute not found. Enter correct institute name");
        }

        const student = await Student.create({
            user: req.user._id,
            enrollNo,
            institute: institute._id,
            batch
        })

        if(!student) {
            throw new ApiError(400, "Something went wrong");
        }

        institute.students.push(student._id)

        await institute.save(
            {
                validateBeforeSave : false
            }
        )

        return res.status(201).json({message: "Student created successfully", student});

});

const getCourses = asyncHandler(async (req, res) => {

    const student = await Student.findOne({
        user: req.user._id
    })

    if(!student) {
        throw new ApiError(404, "Student account not found");
    }

    const courses = await Course.aggregate([
        {
            $unwind : "$students"
        },
        {
            $match : {
                students : student._id
            }
        },
        {
            $lookup : {
                from : "professors",
                localField : "professor",
                foreignField : "_id",
                as : "professor",
            }
        },
        {
            $addFields : {
                professorName : {$arrayElemAt : ["$professor.name", 0]},
            }
        },
        {
            $project : {
                _id : 1,
                name : 1,
                code : 1,
                professorName : 1
            }
        }
    ]
    )

    if(!courses) {
        throw new ApiError(404, "Courses not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Courses fetched successfully", courses)
    );

});

const getClasses = asyncHandler(async (req, res) => {

    const { courseId } = req.body

    if(!courseId) {
        throw new ApiError(400, "Course id is required");
    }

    const classes = await Class.find({
        course: courseId,
        status: "Regular"
    })

    if(!classes) {
        throw new ApiError(404, "Classes not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Classes fetched successfully", classes)
    );

});

const checkStudentAccountPresence = asyncHandler(async (req, res) => {

    const student = await Student.findOne({
        user: new mongoose.Types.ObjectId(req.user._id)
    })

    if(!student) {
        return res.status(200).json({isPresent: false});
    }

    return res.status(200).json({isPresent: true});
})

const getStudentdata = asyncHandler (async (req, res) => {

    const student = await Student.findOne({
        user: new mongoose.Types.ObjectId(req.user._id)
    })

    if(!student) {
        throw new ApiError(500, "Student AC details could not be fetched.")
    }

    return res.status(200).
    json(
        new ApiResponse(200, "Student details fetched successfully", student)
    )
})

const getStudentPlusUserData = asyncHandler( async(req,res,next) => {

    const userId = req.user._id;

    console.log("User Id : ", userId);

    if(!userId) {
        throw new ApiError(400, "User id is required");
    }

    const information = await User.aggregate([
        {
            $match : {
                _id : userId
            }
        },
        {
            $lookup : {
                from : "students",
                localField : "_id",
                foreignField : "user",
                as : "student",
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            enrollNo : 1,
                            batch : 1,
                            institute : 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                student : {$arrayElemAt : ["$student", 0]}
            }
        },
        {
            $project : {
                student : 1,
                fullname : 1,
                email : 1,
                phoneNumber : 1,
                role : 1,
                dateOfBirth : 1
            }
        }
    ])

    console.log("Information : ", information);

    if(!information) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, "User's all data fetched successfully", information[0]));
}
)

const getStudentAvatar = asyncHandler( async (req,res,next) => {

    const userId = req.user._id;

    if(!userId) {
        throw new ApiError(400, "User id is required");
    }

    const avatarURL = await User.findById(userId).select("avatar");

    if(!avatarURL) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User's avatar fetched successfully", avatarURL)
    )
})

const instituteInformation = asyncHandler(async (req, res, next) => {

    const {student_id} = req.body;

    const institute_Info = await College.aggregate([
        {
            $unwind : "$students"
        },
        {
            $match : {
                students : new mongoose.Types.ObjectId(student_id)
            }
        },
        {
            $project : {
                _id : 1,
                name : 1,
                website : 1,
                location : 1,
                officialEmailId : 1
            } 
        }
    ])

    console.log("Institute Info : ", institute_Info[0]);

    if(!institute_Info) {
        throw new ApiError(404, "Institute not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Institute information fetched successfully", institute_Info[0])
    )
})

const getCourseNames = asyncHandler (async (req,res,next) => {

    const {student_id} = req.body;

    if(!student_id) {   
        throw new ApiError(400, "Student id is required");
    }
    
    const courseNames = await Course.aggregate([
        {
            $unwind : "$students"
        },
        {
            $match : {
                students : new mongoose.Types.ObjectId(student_id)
            }
        },
        {
            $project : {
                _id : 1,
                name : 1
            }
        }
    ])

    console.log("Course Names : ", courseNames);

    if(!courseNames) {
        throw new ApiError(404, "Course not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Course names fetched successfully", courseNames)
    )
})

export {
    setupStudent,
    getCourses,
    getClasses,
    checkStudentAccountPresence,
    getStudentdata,
    getStudentPlusUserData,
    getStudentAvatar,
    instituteInformation,
    getCourseNames
}