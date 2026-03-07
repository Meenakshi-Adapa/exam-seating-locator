import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ rollNumber: string }> }
) {
    try {
        // 1. Connect to the database
        await dbConnect();

        // 2. Extract roll number from the URL path
        // In Next 15+ App Router, `params` is a Promise and must be awaited
        const { rollNumber } = await params;

        if (!rollNumber) {
            return NextResponse.json({ message: "Roll number is required" }, { status: 400 });
        }

        // 3. Find the student in the database
        // Using an exact string match after uppercasing the input.
        // This allows MongoDB to utilize the unique index on `rollNumber`
        // which is crucial for handling 3000+ simultaneous fast queries (< 1s).
        const student = await Student.findOne({
            rollNumber: rollNumber.toUpperCase()
        });

        if (!student) {
            return NextResponse.json(
                { message: "Seating arrangement not found for this roll number." },
                { status: 404 }
            );
        }

        // Replace "Unknown" with respective values based on the seating plan
        if (student.blockNumber === "Unknown" || !student.blockNumber) {
            student.blockNumber = "I";
        }
        if (student.floorNumber === "Unknown" || !student.floorNumber) {
            if (student.roomNumber.startsWith("F-")) {
                student.floorNumber = "FIRST FLOOR";
            } else if (student.roomNumber.startsWith("S-")) {
                student.floorNumber = "SECOND FLOOR";
            } else {
                student.floorNumber = "Unknown";
            }
        }

        // 4. Return success along with the student data
        // Include `blockNo` as a compatibility alias for older clients.
        const studentData = student.toObject();
        return NextResponse.json(
            {
                success: true,
                data: {
                    ...studentData,
                    blockNo: studentData.blockNumber ?? "Unknown",
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching seating data:", error);
        return NextResponse.json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}
