import {Schema ,model } from 'mongoose';

interface IParent {
    username: string,
    email: string,
    password: string,
    role: string,
    refreshToken:string
}

const parentSchema = new Schema<IParent>({
    username: {type:String,required:true},
    email: {type:String,required:true},
    password: { type: String,required:true},
    role: { type : String,default:"parent"},
    refreshToken:{ type : String,default:""}
})

const Parent= model<IParent>('Parent',parentSchema);

export {
    Parent
}