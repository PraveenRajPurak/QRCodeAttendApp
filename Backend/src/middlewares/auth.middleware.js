import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.mjs";
import {Owner} from "../models/owner.mjs";
import {Professor} from "../models/professors.mjs";

export const verifyUserToken = asyncHandler(async (req, res, next) => {
    console.log("User Auth middleware request");
    try {
        const accessToken = req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            return new ApiError(401, "Invalid Token");
        }

        console.log("Access Token : ",accessToken);

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if(!decoded) {
            return new ApiError(401, "Invalid Token");
        }

        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            throw new ApiError(401, "User not found")
        }

        req.user = user;
        console.log("User coming out of middleware");
        next()
    }
    catch(error){
        throw new ApiError(501, "Token could not be verified due to internal server error", error?.message);
    }
});

export const verifyOwnerToken = asyncHandler(async (req, res, next) => {

    try {

        const accessToken = req.header("Authorization")?.replace("Bearer ", "");

        if(!accessToken) {
            throw new ApiError(401, "Invalid Token");
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if(!decoded) {
            throw new ApiError(401, "Invalid Token");
        }

        const owner = await Owner.findById(decoded._id).select("-password");

        if (!owner) {
            throw new ApiError(401, "Owner not found")
        }

        req.owner = owner;

        next()
    }
    catch(error) {
        throw new ApiError(501, "Token could not be verified due to internal server error", error?.message);
    }
});

export const verifyProfessorToken = asyncHandler(async (req, res, next) => {
    
    try {
        const accessToken = req.header("Authorization")?.replace("Bearer ", "");

        console.log("Professor accessToken : ", accessToken);

        if(!accessToken) {
            throw new ApiError(401, "Invalid Token");
        }

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        console.log("Decoded : ", decoded);

        if(!decoded) {  
            throw new ApiError(401, "Invalid Token");
        }

        const professor = await Professor.findById(decoded._id).select("-password");

        console.log("professor in the middleware: ", professor);

        if (!professor) {
            throw new ApiError(401, "Professor not found")
        }
        
        req.professor = professor;

        next()
    }
    catch(error){
        throw new ApiError(501, "Token could not be verified due to internal server error", error?.message);
    }
})