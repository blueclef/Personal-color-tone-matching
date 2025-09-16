import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Color } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the skin tone from an image and suggests a color palette with names.
 * @param imageBase64 The base64 encoded image string of the portrait.
 * @returns A promise that resolves to an array of color objects with hex codes and names.
 */
export async function analyzeSkinToneAndSuggestColors(imageBase64: string): Promise<Color[]> {
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
            text: `From the provided portrait image, identify the user's skin undertone (e.g., cool, warm, neutral, olive). Based on this undertone, recommend a palette of 6 complementary clothing colors. Please provide the output in a strict JSON format. The JSON object should have a single key "colors", which is an array of 6 objects, each with a "hex" (string hex color code) and "name" (string color name) property. Do not include any other text, explanations, or markdown formatting.`,
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
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING },
                }
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
 * Performs a virtual try-on by fitting a recolored clothing item onto a person.
 * @param personImageBase64 The base64 encoded image string of the person.
 * @param personMimeType The MIME type of the person image.
 * @param clothingImageBase64 The base64 encoded image string of the clothing.
 * @param clothingMimeType The MIME type of the clothing image.
 * @param colorHex The target hex color for the clothing.
 * @returns A promise that resolves to the base64 string of the final edited image.
 */
export async function performVirtualTryOn(
  personImageBase64: string,
  personMimeType: string,
  clothingImageBase64: string,
  clothingMimeType: string,
  colorHex: string
): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: personImageBase64,
              mimeType: personMimeType,
            },
          },
          {
            inlineData: {
              data: clothingImageBase64,
              mimeType: clothingMimeType,
            },
          },
          {
            text: `This is a virtual try-on task. The first image is a person. The second image is a clothing item. Please change the color of the clothing item from the second image to ${colorHex} and realistically fit it onto the person in the first image. It is crucial to preserve the person's pose, face, and the background from the first image. Do not alter the background. The final output should be a single, photorealistic image of the person wearing the new, recolored clothing.`,
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

    throw new Error("No image was returned from the API for the virtual try-on.");
  } catch (error) {
    console.error("Error performing virtual try-on:", error);
    throw new Error("Failed to perform virtual try-on. Please try a different image or color.");
  }
}

/**
 * Changes the hairstyle of a person in an image.
 * @param imageBase64 The base64 encoded image string of the person.
 * @param imageMimeType The MIME type of the person image.
 * @param hairStylePrompt A text description of the desired hairstyle.
 * @returns A promise that resolves to the base64 string of the final edited image.
 */
export async function changeHairStyle(
  imageBase64: string,
  imageMimeType: string,
  hairStylePrompt: string
): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageMimeType,
            },
          },
          {
            text: `Please change the hairstyle of the person in the image to a ${hairStylePrompt}. It is crucial to preserve the person's face, their clothing, and the background exactly as they are. The final output should be a single, photorealistic image of the person with the new hairstyle.`,
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

    throw new Error("No image was returned from the API for changing the hairstyle.");
  } catch (error) {
    console.error("Error changing hairstyle:", error);
    throw new Error("Failed to change hairstyle. Please try again.");
  }
}