import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to interact with AI
async function generateFromPrompt(ai, model, contents) {
    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
    });
    const text = response.text;
    const cleanedText = text.replace(/```(?:json|txt|text)?\n?([\s\S]*?)```/g, "$1").trim();
    return JSON.parse(cleanedText);
}

const validateImages = async (ai, imageParts) => {
    const prompt = `
      Act as a Senior Automotive Forensic Appraiser. Your task is to perform a Cross-Image Audit on a set of car photos to detect fraud, inconsistency, or missing mandatory documentation.

### DATA VALIDATION PROTOCOL:
1. **Physical Consistency**: Compare the paint color, wheel rim designs, seat upholstery patterns, and window tints across all images. Are there discrepancies?
2. **Environment & Metadata**: Do all photos appear to be taken in the same geographic/environmental setting (e.g., same driveway, same lighting, same weather)?
3. **The "Odometer-Dashboard" Check**:
    - Identify the specific image showing the odometer. 
    - Verify if the dashboard style matches the car's exterior model year.
4. **View Coverage Analysis**: Check for a 360-degree representation. Are any major panels (Rear-Left, Front-Right, etc.) intentionally omitted?
5. **Authenticity Audit**: Look for watermarks from other car sites, digital artifacts indicating AI generation, or pixelation suggesting a screenshot from a low-res source.

### STRICT OUTPUT SCHEMA:
Return ONLY a valid JSON object. No prose. No markdown.

{
  "isValid": boolean,
  "confidenceScore": number, (0-100)
  "detectedViews": ["Front", "Rear", "Left-Side", "Right-Side", "Interior-Front", "Odometer", "Engine-Bay"],
  "validationSummary": {
    "isSameVehicle": boolean,
    "isRealPhoto": boolean,
    "hasOdometer": boolean,
    "hasFullProfiles": boolean
  },
  "inconsistencies": ["List specific discrepancies found, e.g., 'Front bumper is silver but rear is white'", "Missing Rear-Right profile"],
  "fraudAlerts": ["List red flags, e.g., 'Watermark from competitor site detected'", "AI-generated artifacts on wheel spokes"]
}
    `;

    try {
        const contents = [...imageParts, { text: prompt }];
        return await generateFromPrompt(ai, "gemini-2.5-flash", contents);
    } catch (e) {
        console.error("Validation Step Error:", e);
        return { isValid: false, issues: ["AI Validation System Error"] };
    }
};

const extractDetails = async (ai, imageParts) => {
    const prompt = `
      Act as an expert automotive data analyst.
      Extract technical specifications from these car images.

      EXTRACTION RULES:
      - **Make**: Match exactly against: ["Maruti Suzuki", "Tata Motors", "Mahindra & Mahindra", "Force Motors", "Ashok Leyland", "Bajaj Auto", "Eicher Motors", "Hindustan Motors", "Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Nissan", "Hyundai", "Kia", "Mazda", "Subaru", "Lexus", "Acura", "Infiniti", "MG Motor", "Renault", "Skoda", "Citroën", "Jeep", "Volvo", "Porsche", "Lamborghini", "Ferrari", "Bentley", "Rolls-Royce", "Maserati", "Mini", "Aston Martin", "BYD", "Isuzu", "Lotus"].
      - **Year**: 4-digit integer. 0 if unknown.
      - **Price**: Estimated value in INR (Number range or single value).
      - **Mileage**: ARAI mileage (Number).

      Output Format (JSON Only):
      {
        "make": "string",
        "model": "string",
        "year": number,
        "color": "string",
        "price": "string",
        "mileage": number,
        "bodyType": "SUV" | "Sedan" | "Hatchback" | "Pickup" | "Coupe" | "Van" | "Wagon" | "Convertible" | "Minivan" | "Crossover" | "Unknown",
        "fuelType": "Petrol" | "Diesel" | "Electric" | "Hybrid" | "CNG" | "LPG" | "Unknown",
        "transmission": "Manual" | "Automatic" | "CVT" | "Semi-Automatic" | "Unknown",
        "description": "string (max 100 words)"
      }
    `;

    try {
        const contents = [...imageParts, { text: prompt }];
        const data = await generateFromPrompt(ai, "gemini-2.5-flash", contents);

        // Type coercion
        if (typeof data.year !== 'number') data.year = parseInt(data.year) || 0;
        if (typeof data.price !== 'string') data.price = String(data.price || "N/A");
        if (typeof data.mileage !== 'string') data.mileage = String(data.mileage || "N/A");

        return data;
    } catch (e) {
        console.error("Extraction Step Error:", e);
        throw new Error("Failed to extract car details");
    }
};

export const generateAIContent = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: "Server configuration error: API key missing" });
        }

        const ai = new GoogleGenAI(apiKey);

        // Handle Images
        const imageParts = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imageParts.push({
                    inlineData: {
                        data: file.buffer.toString("base64"),
                        mimeType: file.mimetype,
                    }
                });
            });
        }

        if (imageParts.length === 0) {
            // Fallback to text only if no images (legacy support or chat)
            const prompt = req.body.prompt || "Hello";
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            return res.json({ success: true, data: response.text });
        }

        // STEP 1: VALIDATION
        console.log("Starting Step 1: Validation...");
        const validationResult = await validateImages(ai, imageParts);

        if (!validationResult.isValid) {
            console.log("Validation Failed (BYPASSED FOR TESTING):", validationResult.issues);
            return res.status(400).json({
                success: false,
                error: "Validation Failed",
                issues: validationResult.issues
            });
        }

        // STEP 2: EXTRACTION
        console.log("Validation Passed. Starting Step 2: Extraction...");
        const carDetails = await extractDetails(ai, imageParts);

        return res.json({
            success: true,
            data: carDetails
        });

    } catch (error) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
