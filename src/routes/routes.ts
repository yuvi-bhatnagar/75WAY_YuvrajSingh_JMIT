import express, {Request,Response,Router} from 'express'
import { createParent, createStudent, giveHomeWork, setStudentStatus, takeAttendance, teacherLogin, teacherSignUp } from '../controllers/teacher';
import { parentLogin, seeAttendance, seeHomeWork, setChildStatus } from '../controllers/parent';
import { seeHomeWorkStudent, studentLogin } from '../controllers/student';

const router : Router =express.Router();

router.get('/',(req:Request,res:Response)=>{
    res.send("welcome to play school");
})

//  Teacher
router.post('/teacher/Signup',teacherSignUp);
router.post('/teacher/login',teacherLogin);
router.post('/teacher/createStudent',createStudent);
router.post('/teacher/createParent',createParent);
router.put('/teacher/Attendance',takeAttendance);
router.put('/teacher/studentStatus',setStudentStatus);
router.post('/teacher/giveHomework',giveHomeWork);

//  Parent
router.post('/parent/login',parentLogin);
router.get('/parent/seeHomework',seeHomeWork);
router.get('/parent/seeAttendance',seeAttendance);
router.get('/parent/childstatus',setChildStatus);

//  Student
router.post('/student/login',studentLogin);
router.get('/student/seeHomework',seeHomeWorkStudent);

// logout
router.get('/logOut',(req:Request,res:Response)=>{
    res.clearCookie('accessToken');
    res.status(400).json({
        message:"logout success"
    })
})
export {
    router
}