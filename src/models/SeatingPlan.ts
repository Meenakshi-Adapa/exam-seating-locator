import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISeatingPlan extends Document {
    studentRollNumber: string;
    studentName: string;
    examName: string;
    examDate: string;
    examTime: string;
    roomName: string;
    seatNumber: string;
}

const SeatingPlanSchema: Schema = new Schema(
    {
        studentRollNumber: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        examName: {
            type: String,
            required: true,
            trim: true,
        },
        examDate: {
            type: String,
            required: true,
        },
        examTime: {
            type: String,
            required: true,
        },
        roomName: {
            type: String,
            required: true,
            trim: true,
        },
        seatNumber: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const SeatingPlan: Model<ISeatingPlan> =
    mongoose.models.SeatingPlan ||
    mongoose.model<ISeatingPlan>("SeatingPlan", SeatingPlanSchema);
