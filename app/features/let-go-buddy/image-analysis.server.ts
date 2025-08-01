import OpenAI from "openai";

export async function analyzeImageForSelling(base64Image: string, itemName: string) {
  if (!base64Image.startsWith('data:image/')) {
      throw new Error("Invalid Base64 image data");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant specialized in pricing and describing secondhand items for online marketplaces in Thailand.
          Analyze the image and item name provided.
          Your task is to generate a compelling product title, a detailed description, and a suggested price in THB.
          
          Consider:
          - The item's likely condition based on the image.
          - The brand and material if identifiable.
          - Current market trends for similar secondhand items in Thailand.
          
          Please respond with a JSON object with the following keys: "title", "description", "price".
          The price should be a number.
        `
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please generate a listing for this item: ${itemName}.`
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No analysis generated from OpenAI");
  }
  
  const analysis = JSON.parse(content);
  return analysis;
}
