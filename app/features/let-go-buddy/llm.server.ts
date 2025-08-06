import { OpenAI } from "openai";

// This should be in your .env file
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
    type: 'ai' | 'user';
    content: string;
}

export async function generateAnalysis(chatHistory: ChatMessage[]) {
    const prompt = `
        You are Joy, a decluttering coach. You have just had a conversation with a user about an item they are considering letting go of.
        Based on the following conversation transcript, please provide a brief analysis.

        Conversation:
        ${chatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

        Your task is to generate a JSON object with the following fields:
        - "ai_listing_title": A catchy and descriptive title for the item if it were to be sold (e.g., "Vintage Leather-bound Journal").
        - "ai_listing_description": A compelling description for a secondhand marketplace listing.
        - "ai_category": Your recommendation. Choose one: "sell", "donate", or "keep".
        - "analysis_summary": A short summary explaining your recommendation based on the user's feelings and responses.
        - "emotion_summary": Briefly describe the user's dominant emotion regarding the item (e.g., "nostalgic," "conflicted," "ready to move on").

        Provide only the JSON object in your response.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = response.choices[0].message?.content;
        if (!result) {
            throw new Error("OpenAI response was empty.");
        }

        return JSON.parse(result);

    } catch (error) {
        console.error("Error calling OpenAI:", error);
        throw new Error("Failed to generate analysis from AI.");
    }
}
