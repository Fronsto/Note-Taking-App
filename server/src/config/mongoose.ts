import mongoose from 'mongoose';
require('dotenv').config();

export const mongooseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('connected to mongodb');
    } catch (err) {
        console.log('error connecting to mongodb : ', err);
    }
};
