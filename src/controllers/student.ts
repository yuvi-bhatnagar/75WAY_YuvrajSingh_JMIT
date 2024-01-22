import express , {Request,Response} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validatePassword, validateEmail } from '../utils/validation';
import dotenv from 'dotenv';
import { Student } from '../models/student';

dotenv.config();

const studentLogin = async (req:Request,res:Response)=>{
    const {email ,password} =req.body;
    if(!email || !password) {
        res.status(400).json({
            error:"All fields are required"
        })
        return;
    }
    if(!validateEmail(email)){
        res.status(400).json({
            error:"Invalid Email"
        })
        return ;
    }
    if(!validatePassword(password)){
        res.status(400).json({
            error:"password must contain atleast 8 charactes ,one uppercase, one lowercase, one number and one special character"            
        })
        return;
    }
    const student= await Student.findOne({email:email});
    if(!student){
        res.status(400).json({
            error:"user doesn't exists"
        })
        return ;
    }
    const match : boolean= await bcrypt.compare(password,student.password);
    if(!match){
        res.status(400).json({
            error: "Invalid Credentials"
        })
        return;
    }
    const token : string =jwt.sign({_id:student._id,role:student.role},process.env.JWT_SECRET || "");
    res.cookie('accessToken',token,{httpOnly:true});
    res.status(200).json({
        message: "student logged in"
    })
}

const seeHomeWorkStudent =async (req:Request,res:Response)=>{
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET||"") as JwtPayload;
    if(decodeJWT.role!="student"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }

    const child =await Student.findOne({_id:decodeJWT._id});
    if(!child){
        res.status(400).json({
            error: "no child found"
        })
    }

    res.status(200).json({
        message: "Homework fetched successfully",
        homeword: child?.homework
    })
}

export {
    studentLogin,
    seeHomeWorkStudent
}