import express , {Request,Response} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validatePassword, validateEmail } from '../utils/validation';
import dotenv from 'dotenv';
import { Parent } from '../models/parent';
import { Student } from '../models/student';
import schedule from 'node-schedule';
import { sendMail } from '../utils/transporter';

dotenv.config();

const parentLogin = async (req:Request,res:Response)=>{
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
    const parent= await Parent.findOne({email:email});
    if(!parent){
        res.status(400).json({
            error:"user doesn't exists"
        })
        return ;
    }
    const match : boolean= await bcrypt.compare(password,parent.password);
    if(!match){
        res.status(400).json({
            error: "Invalid Credentials"
        })
        return;
    }
    const token : string =jwt.sign({_id:parent._id,role:parent.role},process.env.JWT_SECRET || "");
    res.cookie('accessToken',token,{httpOnly:true});
    res.status(200).json({
        message: "parent logged in"
    })
}

const seeHomeWork = async (req:Request, res: Response)=>{
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET||"") as JwtPayload;
    if(decodeJWT.role!="parent"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }

    const child =await Student.findOne({parent_id:decodeJWT._id});
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

const seeAttendance = async (req:Request,res: Response)=>{
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET||"") as JwtPayload;
    if(decodeJWT.role!="parent"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const child =await Student.findOne({parent_id:decodeJWT._id});
    if(!child){
        res.status(400).json({
            error: "no child found"
        })
    }
    
    res.status(200).json({
        message: "Attendance fetched successfully",
        total : child?.totalLecture,
        Attended: child?.attendance
    })
}

const setChildStatus = async (req:Request,res:Response) => {
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET||"") as JwtPayload;
    if(decodeJWT.role!="parent"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    await Student.findOneAndUpdate({parent_id:decodeJWT._id},{status:true})
    .then(()=>{
        const job= schedule.scheduleJob('*/30 * * * * *',async ()=>{
            const student = await Student.findOne({parent_id:decodeJWT._id});
            if(student?.status){
                // sendMail;
                console.log("child didn't reach on time");
            }
        });
        res.status(200).json({
            message: "Status changed!",
        })
    })
    .catch((err)=>{
        console.log(err);
    })
}

export {
    parentLogin,
    seeHomeWork,
    seeAttendance,
    setChildStatus
}