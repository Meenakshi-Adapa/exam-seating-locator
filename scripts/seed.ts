import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { User } from "../src/models/User";
import { SeatingPlan } from "../src/models/SeatingPlan";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const mockSeatingPlans = [
    {
        studentRollNumber: "CS101-001",
        studentName: "Alice Smith",
        examName: "Introduction to Computer Science",
        examDate: "2026-11-15",
        examTime: "10:00 AM - 12:00 PM",
        roomName: "Hall A",
        seatNumber: "A01",
    },
    {
        studentRollNumber: "CS101-002",
        studentName: "Bob Johnson",
        examName: "Introduction to Computer Science",
        examDate: "2026-11-15",
        examTime: "10:00 AM - 12:00 PM",
        roomName: "Hall A",
        seatNumber: "A02",
    },
    {
        studentRollNumber: "MATH201-001",
        studentName: "Alice Smith",
        examName: "Calculus II",
        examDate: "2026-11-16",
        examTime: "02:00 PM - 04:00 PM",
        roomName: "Room 402",
        seatNumber: "Row 1, Seat 5",
    },
];

async function seed() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(MONGODB_URI as string);
        console.log("Connected successfully!");

        console.log("Clearing existing SeatingPlan data...");
        await SeatingPlan.deleteMany({});

        console.log("Inserting mock seating plans...");
        await SeatingPlan.insertMany(mockSeatingPlans);

        console.log("Seeding complete. Verification successful!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
}

seed();
