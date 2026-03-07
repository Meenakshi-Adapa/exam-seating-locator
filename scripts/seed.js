const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load variables
dotenv.config({ path: ".env.local" });

const studentSchema = new mongoose.Schema({
    rollNumber: String,
    name: String,
    course: String,
    roomNumber: String,
    seatNumber: String,
    examDate: String,
    imageUrl: String,
});

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

async function seed() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB!");

        // Clear old test data
        await Student.deleteMany({ rollNumber: "16C123" });

        // Insert dummy data, including an image URL for testing
        const newStudent = new Student({
            rollNumber: "16C123",
            name: "John Doe",
            course: "Computer Science 101",
            roomNumber: "Hall A",
            seatNumber: "Row 5, Seat 12",
            examDate: new Date().toISOString(),
            imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
        });

        await newStudent.save();
        console.log("Successfully inserted test student record: 16C123");

    } catch (err) {
        console.error("Error seeding data:", err);
    } finally {
        mongoose.connection.close();
    }
}

seed();
