import { Schema, model } from 'mongoose';

const PageContentsSchema = new Schema({
    _id: String,
    data: Object,
});

export const PageDataModel = model('PageContents', PageContentsSchema);
