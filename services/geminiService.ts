
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the skin tone from an image and suggests a color palette.
 * @param imageBase64 The base64 encoded image string of the portrait.
 * @returns A promise that resolves to an array of hex color strings.
 */
export async function analyzeSkinToneAndSuggestColors(imageBase64: string): Promise<string[]> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            text: `From the provided portrait image, identify the user's skin undertone (e.g., cool, warm, neutral, olive). Based on this undertone, recommend a palette of 6 complementary clothing colors. Please provide the output in a strict JSON format. The JSON object should have a single key "colors", which is an array of 6 hex color code strings. Do not include any other text, explanations, or markdown formatting.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result.colors;
  } catch (error) {
    console.error("Error analyzing skin tone:", error);
    throw new Error("Failed to analyze skin tone. Please check the image and try again.");
  }
}

/**
 * Changes the color of the main clothing item in an image.
 * @param imageBase64 The base64 encoded image string of the clothing.
 * @param mimeType The MIME type of the clothing image.
 * @param colorHex The target hex color for the clothing.
 * @returns A promise that resolves to the base64 string of the edited image.
 */
export async function recolorClothingImage(imageBase64: string, mimeType: string, colorHex: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Please change the color of the primary clothing item in this image to ${colorHex}. It is crucial to preserve the original textures, folds, shadows, and highlights to make the color change look natural and realistic. Do not alter the background or any other objects in the image.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image was returned from the API.");
  } catch (error) {
    console.error("Error recoloring clothing image:", error);
    throw new Error("Failed to recolor the clothing. Please try a different image or color.");
  }
}
