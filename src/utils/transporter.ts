import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
})

const mailOptions = {
    from: {
        name: "System",
        address:process.env.MAIL_USER,
    },
    to:process.env.MAIL_USER,
    subject:"Play School",
    text:"Sent mail"
}

const sendMail =async (transporter:any , mailOptions: any)=>{
    try{
        await transporter.sendMail(mailOptions);
        console.log("successfull");
    }
    catch(err){
        console.log(err);
    }
}

export {
    sendMail
}