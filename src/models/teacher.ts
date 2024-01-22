import {Schema ,model } from 'mongoose';

interface ITeacher {
    username: string,
    email: string,
    password: string,
    role: string,
    refreshToken:string
}

const teacherSchema = new Schema<ITeacher>({
    username: {type:String,required:true},
    email: {type:String,required:true},
    password: { type: String,required:true},
    role:{type : String, default: "teacher"},
    refreshToken:{ type : String,default:""}
})

const Teacher= model<ITeacher>('Teacher',teacherSchema);

export {
    Teacher
}