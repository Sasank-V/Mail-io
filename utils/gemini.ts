import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

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
You are an expert Email Classifier specializing in analyzing and categorizing university emails. Your task is to carefully review the provided parsed email data in JSON format and classify it into one of the following categories:

${categoriesText}

The parsed email data includes key fields such as subject, from, to, date, body (text and/or HTML), and attachments. Use the content and context of the email (including keywords in the subject and body) to determine which category best fits. If a category's description is not provided, rely on the category name alone to infer its meaning.

Please provide your response in strict JSON format with no additional commentary. The response must be exactly in this format:

{ "type": "selected_category" }

Where "selected_category" is the exact name (as given in the userCategories array) of the category you determine is the best match.

Below is the parsed email data:
${
  typeof parsedData === "object"
    ? JSON.stringify(parsedData, null, 2)
    : parsedData
}

Analyze the above email data and return only the JSON object with the chosen category.
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
