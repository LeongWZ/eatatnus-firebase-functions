import {onCall, HttpsError} from "firebase-functions/v2/https";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

// This will allow only requests with an auth token to access the Vision
// API, including anonymous ones.
// It is highly recommended to limit access only to signed-in users. This may
// be done by adding the following condition to the if statement:
//    || context.auth.token?.firebase?.sign_in_provider === 'anonymous'
//
// For more fine-grained control, you may add additional failure checks, ie:
//    || context.auth.token?.firebase?.email_verified === false
// Also see: https://firebase.google.com/docs/auth/admin/custom-claims
export const batchAnnotateImages = onCall(
  {region: "asia-southeast1"},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "annotateImage must be called while authenticated."
      );
    }

    try {
      return await client.batchAnnotateImages(request.data);
    } catch (e) {
      // @ts-expect-error: catch vision api errors
      throw new HttpsError("internal", e.message, e.details);
    }
  }
);
