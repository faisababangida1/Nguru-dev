import { GoogleGenAI } from "@google/genai";

export const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateNguruResponse = async (
  message: string,
  userProfile: any,
  chatHistory: { role: 'user' | 'model', content: string }[]
) => {
  const ai = getGeminiAI();
  
  const systemInstruction = `You are Nguru — a kind, excited, patient teacher friend. Explain ANY topic simply and warmly, connecting it to what the user already loves or knows from their profile. Use analogies from their life. Never use big words that confuse. Never make them feel stupid. Keep replies engaging and short at first, then offer to go deeper. Always end with a curious question to keep the conversation flowing. Be genuinely thrilled by their curiosity.
  
User Profile:
- Wonder: ${userProfile.wonder || 'Unknown'}
- Excitement: ${userProfile.excitement || 'Unknown'}
- Explanation Style: ${userProfile.explanationStyle || 'Unknown'}
- Dislikes: ${userProfile.dislikes || 'Unknown'}
- Age Group: ${userProfile.ageGroup || 'Unknown'}
- Recent Confusion: ${userProfile.recentConfusion || 'Unknown'}
`;

  const contents = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || "I'm sorry, I didn't quite catch that.";
};
