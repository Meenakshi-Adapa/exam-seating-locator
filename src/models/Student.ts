import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
    rollNumber: string;
    name: string;
    course: string;
    roomNumber: string;
    seatNumber?: string;
    blockNumber?: string;
    floorNumber?: string;
    examDate?: string;
    imageUrl?: string;
}

const StudentSchema: Schema<IStudent> = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    roomNumber: {
        type: String,
        required: true,
    },
    seatNumber: {
        type: String,
        required: false,
    },
    blockNumber: {
        type: String,
        required: false,
    },
    floorNumber: {
        type: String,
        required: false,
    },
    examDate: {
        type: String, // Or Date, depending on how dates come from the CSV
        required: false,
    },
    imageUrl: {
        type: String,
        required: false,
    },
});

// Check if the model exists before compiling it to prevent OverwriteModelError during Next.js Hot Reloads
const Student: Model<IStudent> =
    mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
