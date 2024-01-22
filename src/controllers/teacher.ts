import express , {Request,Response} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validatePassword, validateEmail } from '../utils/validation';
import dotenv from 'dotenv';
import { Teacher } from '../models/teacher';
import { Parent } from '../models/parent';
import { Student } from '../models/student';

dotenv.config();

const teacherSignUp = async (req:Request,res:Response)=>{
    const {username,email ,password,confirmPassword} = req.body;
    if(!username || !email || !password || !confirmPassword) {
        res.status(400).json({
            error:"All fields are required"
        })
        return;
    }
    if(confirmPassword!=password){
        res.status(400).json({
            error:"confirm password should be same as password"
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
    const teacher= await Teacher.findOne({email:email});
    if(teacher){
        res.status(400).json({
            error:"user already exists"
        })
        return ;
    }

    const salt: string = bcrypt.genSaltSync(10);
    const hash: string = bcrypt.hashSync(password,salt);
    
    const newTeacher = new Teacher({
        username: username,
        email: email,
        password: hash
    })
    newTeacher.save()
    .then((newTeacher)=>{
        const accessToken : string= jwt.sign({_id:newTeacher._id,role:newTeacher.role},process.env.JWT_SECRET || "");
        res.cookie('accessToken',accessToken,{httpOnly:true});
        res.status(200).json({
            message:"Teacher created Succesfully",
            teacher: newTeacher
        })
    })
    .catch((err)=>{
        console.log(err);
    })
}

const teacherLogin = async (req:Request,res:Response)=>{
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
    const teacher= await Teacher.findOne({email:email});
    if(!teacher){
        res.status(400).json({
            error:"user doesn't exists"
        })
        return ;
    }
    const match : boolean= await bcrypt.compare(password,teacher.password);
    if(!match){
        res.status(400).json({
            error: "Invalid Credentials"
        })
        return;
    }
    const token : string =jwt.sign({_id:teacher._id,role:teacher.role},process.env.JWT_SECRET || "");
    res.cookie('accessToken',token,{httpOnly:true});
    res.status(200).json({
        message: "Teacher logged in"
    })
}

const createParent = async (req:Request, res:Response)=>{
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET
        ||"") as JwtPayload;
    if(decodeJWT.role!="teacher"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const {username,email ,password} =req.body;
    if(!username || !email || !password) {
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
    if(parent){
        res.status(400).json({
            error:"user already exists"
        })
        return ;
    }

    const salt: string = bcrypt.genSaltSync(10);
    const hash: string = bcrypt.hashSync(password,salt);
    
    const newparent = new Parent({
        username: username,
        email: email,
        password: hash
    })
    newparent.save()
    .then((newparent)=>{
        res.status(200).json({
            message:"parent created Succesfully",
            parent: newparent
        })
    })
    .catch((err)=>{
        console.log(err);
    })
}

const createStudent = async (req:Request, res:Response)=>{
    // Teacher Authorization
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET
        ||"") as JwtPayload;
    if(decodeJWT.role!="teacher"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }

    const {username,email ,password,parentId} =req.body;
    if(!username || !email || !password || !parentId) {
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
    if(student){
        res.status(400).json({
            error:"user already exists"
        })
        return ;
    }
    const parent= await Parent.findById(parentId);
    if(!parent){
        res.status(400).json({
            error:"Invalid Parent Id"
        })
        return ;
    }

    const salt: string = bcrypt.genSaltSync(10);
    const hash: string = bcrypt.hashSync(password,salt);
    
    const newstudent = new Student({
        username: username,
        email: email,
        password: hash,
        parent_id:parentId
    })
    newstudent.save()
    .then((newstudent)=>{
        res.status(200).json({
            message:"student created Succesfully",
            student: newstudent
        })
    })
    .catch((err)=>{
        console.log(err);
    })
}

const takeAttendance = async (req:Request,res:Response) =>{
    // teacher authentication

    const {studentId,present }=req.body;

    await Student.findByIdAndUpdate({_id:studentId},{$inc:{totalLecture:1}});
    if(present)
        await Student.findByIdAndUpdate({_id:studentId},{$inc:{attendance:1}});

    res.status(200).json({
        message:"Attendance marked sucessfully"
    })
}

const setStudentStatus = async (req: Request, res: Response)=>{
    //  teacher authentication
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET
        ||"") as JwtPayload;
    if(decodeJWT.role!="teacher"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }

    const {studentId} =req.body;

    await Student.findByIdAndUpdate({_id:studentId},{status:false})
    .then(()=>{
        res.status(200).json({
            message: "Status changed!"
        })
    })
    .catch((err)=>{
        console.log(err);
    })

}

const giveHomeWork =async (req: Request,res: Response)=>{
    //  teacher authentication 
    if(!req.cookies.accessToken){
        res.status(400).json({
            error:"Authoriztion denied"
        })
        return;
    }
    const accessToken=req.cookies.accessToken;
    const decodeJWT = jwt.verify(accessToken,process.env.JWT_SECRET||"") as JwtPayload;
    if(decodeJWT.role!="teacher"){
        res.status(400).json({
            error:"Authoriztion denied"
        })
    }

    const {homework}= req.body;

    await Student.updateMany({homework:homework})
    .then(()=>{
        res.status(400).json({
            message:"Homework is alloted"
        })
    })
    .catch((err)=>{
        console.log(err);
    })
}

export {
    teacherSignUp,
    teacherLogin,
    createParent,
    createStudent,
    takeAttendance,
    setStudentStatus,
    giveHomeWork
}