import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Student from "@/models/Student";
import { v2 as cloudinary } from "cloudinary";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { GoogleGenAI } from "@google/genai";
import jwt from "jsonwebtoken";
import Tesseract from "tesseract.js";
import { parseLocationFields } from "@/lib/locationParser";

// Configure Cloudinary using env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Gemini AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
    try {
        // Basic auth check with JWT verification
        const token = req.cookies.get("admin_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized: Missing token" }, { status: 401 });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (error) {
            return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
        }

        await dbConnect();

        const formData = await req.formData();
        const csvFile = formData.get("file") as File | null;
        const imageFile = formData.get("image") as File | null;

        if (!csvFile && !imageFile) {
            return NextResponse.json({ message: "No files provided" }, { status: 400 });
        }

        let imageUrl = "";
        let finalStudentsToInsert: any[] = [];
        let imageArrayBuffer: ArrayBuffer | null = null;

        // 1. Handle Image Upload & AI Extraction
        if (imageFile) {
            try {
                imageArrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(imageArrayBuffer);

                // A. Wrap cloudinary upload in a promise and stream it
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "exam-seating" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );

                    const stream = Readable.from(buffer);
                    stream.pipe(uploadStream);
                }) as any;

                imageUrl = uploadResult.secure_url;

                // B. If NO CSV is provided, use AI to extract text from this image
                if (!csvFile && process.env.GEMINI_API_KEY) {
                    console.log("No CSV found. Initiating Gemini AI Vision Extraction...");

                    const base64Image = buffer.toString("base64");

                    const prompt = `
                        Analyze this exam seating plan document.

                        The document contains multiple sections. Each section starts with a header like:
                        "11- BLOCK-I / FIRST FLOOR - F-118-A"

                        This header indicates:
                        - Block number
                        - Floor
                        - Room number

                        Below each header there are department labels (ME, CE, CSE, etc.) and lists of roll numbers.

                        Extract the data so that each roll number is associated with:
                        - rollNumber
                        - department
                        - block
                        - floor
                        - room

                        Return ONLY valid JSON in this format:
                        [
                          {
                            "rollNumber": "24R15A0305",
                            "department": "ME",
                            "block": "I",
                            "floor": "FIRST FLOOR",
                            "room": "F-118-A"
                          }
                        ]

                        Important rules:
                        1. When a new BLOCK header appears, apply it to all roll numbers until the next header.
                        2. Ignore totals like "Total: 28".
                        3. Extract only valid roll numbers.
                        4. The block number is the Roman numeral after "BLOCK-" in the header (e.g., "BLOCK-I" means block "I").
                        5. Do not include explanation text. Only return JSON.
                    `;

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: [
                            prompt,
                            {
                                inlineData: {
                                    data: base64Image,
                                    mimeType: imageFile.type || "image/jpeg"
                                }
                            }
                        ]
                    });

                    const rawText = response.text || "[]";
                    console.log("Raw AI Output Length:", rawText.length);

                    try {
                        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
                        let aiExtractedStudents = JSON.parse(cleanedText);

                        // Attach the uploaded image URL
                        finalStudentsToInsert = aiExtractedStudents.map((s: any) => {
                            const roomValue = s.roomNumber || s.room || s.location || "";
                            const location = parseLocationFields(roomValue);
                            return {
                                ...s,
                                course: s.course || s.department || "Unknown",
                                blockNumber: s.blockNumber || s.block || location.blockNumber,
                                floorNumber: s.floorNumber || s.floor || location.floorNumber,
                                roomNumber: s.roomNumber || s.room || location.roomNumber,
                                seatNumber: s.seatNumber || "TBD",
                                name: s.name || "Unknown",
                                imageUrl
                            };
                        });
                    } catch (parseErr) {
                        console.error("Failed to parse Gemini JSON:", rawText);
                        return NextResponse.json({ message: "AI processed the image but returned invalid data format." }, { status: 500 });
                    }
                }

                // C. If Gemini API key is missing, use Tesseract OCR fallback
                if (!csvFile && !process.env.GEMINI_API_KEY) {
                    console.log("No Gemini API key found. Falling back to Tesseract OCR...");

                    try {
                        const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
                        console.log("Tesseract Extracted Text Length:", text.length);

                        // Heuristic extraction for typical roll numbers (e.g., 22481A05K1 or 24R15A...)
                        // and basic room numbers
                        const lines = text.split('\n');

                        let currentRoom = "Unknown";
                        let currentBlock = "Unknown";
                        let currentFloor = "Unknown";
                        let currentBranch = "Unknown";

                        for (const line of lines) {
                            const location = parseLocationFields(line);
                            if (location.roomNumber !== "Unknown") currentRoom = location.roomNumber;
                            if (location.blockNumber !== "Unknown") currentBlock = location.blockNumber;
                            if (location.floorNumber !== "Unknown") currentFloor = location.floorNumber;

                            // Try to find a branch (e.g., CSE, ME, ECE)
                            const branchMatch = line.match(/\b(CSE|ECE|ME|CE|EEE|IT)\b/i);
                            if (branchMatch) {
                                currentBranch = branchMatch[1].toUpperCase();
                            }

                            // Try to find roll numbers (10 alphanumeric chars typically)
                            const rollMatch = line.match(/\b([0-9A-Z]{10})\b/i);
                            if (rollMatch) {
                                finalStudentsToInsert.push({
                                    rollNumber: rollMatch[1].toUpperCase(),
                                    blockNumber: currentBlock,
                                    floorNumber: currentFloor,
                                    roomNumber: currentRoom,
                                    course: currentBranch,
                                    name: "Unknown",
                                    seatNumber: "TBD",
                                    imageUrl
                                });
                            }
                        }
                    } catch (ocrErr) {
                        console.error("Tesseract processing error:", ocrErr);
                        // We don't fail the whole request here, just won't have parsed data.
                    }
                }
            } catch (imgErr) {
                console.error("Image processing error:", imgErr);
                return NextResponse.json({ message: "Failed to upload image or extract AI data" }, { status: 500 });
            }
        }

        // 2. Handle CSV Parsing (if provided)
        if (csvFile) {
            try {
                const fileBuffer = Buffer.from(await csvFile.arrayBuffer());
                const results: any[] = [];

                // Parse CSV Buffer
                await new Promise((resolve, reject) => {
                    const stream = Readable.from(fileBuffer);
                    stream
                        .pipe(csvParser())
                        .on("data", (data) => {
                            const keys = Object.keys(data);
                            const getVal = (possibleKeys: string[]) => {
                                const key = keys.find(k => possibleKeys.includes(String(k).trim().toLowerCase()));
                                return key ? data[key] : "";
                            };

                            const roomRaw = getVal(["roomnumber", "room_number", "room no", "room"]);
                            const parsedLocation = parseLocationFields(roomRaw);
                            const blockRaw = String(getVal(["blocknumber", "block_number", "block no", "blockno", "block"])).trim();
                            const floorRaw = String(getVal(["floornumber", "floor_number", "floor no", "floorno", "floor"])).trim();

                            results.push({
                                rollNumber: getVal(["rollnumber", "roll_number", "roll no", "id", "rollno"]),
                                name: getVal(["name", "studentname", "student_name", "student"]),
                                course: getVal(["course", "subject", "class"]),
                                roomNumber: parsedLocation.roomNumber,
                                blockNumber: blockRaw || parsedLocation.blockNumber,
                                floorNumber: floorRaw || parsedLocation.floorNumber,
                                seatNumber: getVal(["seatnumber", "seat_number", "seat no", "seat"]),
                                examDate: getVal(["examdate", "exam_date", "date"]),
                                imageUrl: imageUrl
                            });
                        })
                        .on("end", resolve)
                        .on("error", reject);
                });

                // Filter out empty rows
                finalStudentsToInsert = results.filter(s => s.rollNumber && s.name && s.roomNumber);

            } catch (csvErr) {
                console.error("CSV parsing/DB error:", csvErr);
                return NextResponse.json({ message: "Failed to process CSV file data" }, { status: 500 });
            }
        }

        // 3. Insert valid collected students into DB
        let insertedCount = 0;
        const validStudents = finalStudentsToInsert.filter(s => s.rollNumber && s.roomNumber);

        if (validStudents.length > 0) {
            const bulkOps = validStudents.map(student => ({
                updateOne: {
                    filter: { rollNumber: student.rollNumber },
                    update: { $set: student },
                    upsert: true
                }
            }));

            const bulkResult = await Student.bulkWrite(bulkOps);
            insertedCount = bulkResult.upsertedCount + bulkResult.modifiedCount;
        }

        return NextResponse.json(
            {
                message: `Successfully processed upload! ${insertedCount > 0 ? `AI/CSV Extracted & Added ${insertedCount} student records.` : ''} ${imageUrl ? "Image uploaded successfully." : ""}`,
                imageUrl
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Upload route completely failed:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
