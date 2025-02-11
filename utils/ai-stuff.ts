import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import path from "path";
import Tesseract, { createWorker } from "tesseract.js";

export async function askGemini(
  prompt: string,
  filename?: string,
  mimeType?: string,
  path?: string
) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  let result;
  if (filename && mimeType && path) {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
    const uploadResult = await fileManager.uploadFile(`${path}`, {
      mimeType,
      displayName: filename,
    });
    result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);
  } else {
    result = await model.generateContent(prompt);
  }
  // console.log(result.response.text());
  const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const jsonString = jsonMatch[0];
    try {
      const parsedJson = JSON.parse(jsonString);
      return parsedJson;
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
  } else {
    console.error("No JSON object found in the response.");
    return "JSON Not found in Gemini Response";
  }
}

export const getEmailClassifyPrompt = (parsedData, userCategories) => {
  // Build a detailed list of categories with their descriptions.
  const categoriesText = userCategories
    .map((category) => {
      const desc =
        category.description && category.description.trim().length > 0
          ? category.description
          : "No specific keywords provided; use the category name for context";
      return `Category: "${category.name}" – Description: "${desc}"`;
    })
    .join("\n");

  return `
You are an expert Email Classifier specializing in analyzing and categorizing university emails. Your role is to review the provided parsed email data (in JSON format) and determine the single best category from the list provided below. The email data includes key fields such as "subject", "from", "to", "date", "body" (which may be plain text or HTML), and "attachments".

The categories you must choose from are:
${categoriesText}

Guidelines:
1. Examine all the information in the email data including subject, body content, and any attachments.
2. Compare the email details against the descriptions provided for each category.
3. Select the one category whose description best fits the overall context of the email.
4. If the email does not clearly match any category, choose the one that is the best approximation.
5. Your final response must be a single, valid JSON object that contains only one key "type" with the value being the selected category name.
6. Do not include any extra text, explanation, or markdown formatting in your output. The output must be exactly in the following format:

{ "type": "selected_category" }

Where "selected_category" is one of the category names exactly as provided in the list above.

Below is the parsed email data:
${typeof parsedData === "object" ? JSON.stringify(parsedData, null, 2) : parsedData}

Analyze the above email data carefully and return only the JSON object with the chosen category.
  `;
};

export const getEventSummaryPrompt = (parsedData) => {
  return `
You are an expert Event Detail Extractor. Your task is to analyze the following email data (provided as parsed JSON) and extract all relevant event details if the email describes an event. Please extract and output exactly the following fields in the specified JSON format:

{
  "summary": "Event summary",
  "location": "Event location",
  "description": "Event description",
  "start": {
    "dateTime": "YYYY-MM-DDTHH:MM:SS-XX:XX",
    "timeZone": "TimeZone"
  },
  "end": {
    "dateTime": "YYYY-MM-DDTHH:MM:SS-XX:XX",
    "timeZone": "TimeZone"
  },
  "reminders": {
    "useDefault": false,
    "overrides": [
      {"method": "email", "minutes": 1440},
      {"method": "popup", "minutes": 10}
    ]
  }
}

If a particular field cannot be determined from the email, set its value to an empty string (for text fields) or false (for booleans) as appropriate.

Below is the parsed email data:

${typeof parsedData === "object" ? JSON.stringify(parsedData, null, 2) : parsedData}

Return only the JSON object with no additional text.
  `;
};

// export async function parseImage(filePath: string) {
//   Tesseract.recognize(filePath)
//     .progress(console.log)
//     .then((res: any) => {
//       return res;
//     })
//     .catch(console.error);
// }

export function extractJson(responseText: string) {
  // This regex matches from the first "{" to the last "}" in the string.
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsedJson = JSON.parse(jsonMatch[0]);
      return parsedJson;
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return null;
    }
  }
  return null;
}
