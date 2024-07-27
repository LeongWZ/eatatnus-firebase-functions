import {onCall, HttpsError} from "firebase-functions/v2/https";
import {VertexAI} from "@google-cloud/vertexai";

const vertexAi = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: "asia-southeast1",
});

const model = "gemini-1.5-flash";

const generativeModel = vertexAi.preview.getGenerativeModel({
  model: model,
  generationConfig: { // Test impact of parameters: https://makersuite.google.com
    maxOutputTokens: 512,
    temperature: 0.9,
    topP: 1,
  },
});

export const generateContent = onCall(
  {region: "asia-southeast1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "generateContent must be called while authenticated."
      );
    }

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
