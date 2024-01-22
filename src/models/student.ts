import {Schema ,model } from 'mongoose';

interface IStudent {
    username: string,
    email: string,
    password: string,
    totalLecture: number,
    attendance:number,
    status:boolean,
    homework:string,
    parent_id: Schema.Types.ObjectId,
    role:string,
    refreshToken:string
}

const studentSchema = new Schema<IStudent>({
    username: {type:String,required:true},
    password: { type: String,required:true},
    email: {type:String,required:true},
    totalLecture:{ type: Number,default:0},
    attendance: { type: Number,default: 0},
    status: { type: Boolean,default:false},
    homework: { type: String,default:""},
    parent_id: { type: Schema.Types.ObjectId,default:""},
    role: {type: String,default:"student"},
    refreshToken:{ type : String,default:""}
})

const Student= model<IStudent>('Student',studentSchema);

export {
    Student
}