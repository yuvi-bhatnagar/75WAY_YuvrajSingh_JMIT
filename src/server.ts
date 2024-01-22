import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connect';
import { router } from './routes/routes'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/',router);

const port : number=3000;
const uri : string = process.env.MONGO_URL || "";

try{
    connectDB(uri);
    app.listen(port,()=>{
        console.log(`server is running on port ${port}`);
    })
}
catch(err){
    console.log(err);
}