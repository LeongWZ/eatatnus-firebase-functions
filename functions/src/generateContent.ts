import {onCall, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {defineString} from "firebase-functions/params";

const GEMINI_API_KEY = defineString("GEMINI_API_KEY");

const model = "gemini-1.5-flash";

export const generateContent = onCall(
  {region: "asia-southeast1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "generateContent must be called while authenticated."
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());

    const generativeModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.9,
        topP: 1,
      },
    });

    try {
      const content = await generativeModel.generateContent(request.data);
      const result =
        content.response.candidates?.at(0)?.content.parts.at(0)?.text;
      return result;
    } catch (e) {
      // @ts-expect-error: catch vision api errors
      throw new HttpsError("internal", e.message, e.details);
    }
  }
);
