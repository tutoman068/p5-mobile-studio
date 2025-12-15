import { GoogleGenAI } from "@google/genai";

export const generateP5Code = async (prompt: string, currentCode: string): Promise<string> => {
  try {
    // Initialize inside the function to be safe against load-time environment issues
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullPrompt = `
      You are an expert creative coder using p5.js.
      
      User Request: "${prompt}"
      
      Current Code Context:
      ${currentCode}
      
      INSTRUCTIONS:
      1. Write valid p5.js JavaScript code.
      2. If the user asks to modify existing code, update the 'Current Code Context'.
      3. If the user asks for something new, provide a complete sketch with setup() and draw().
      4. DO NOT explain the code.
      5. DO NOT use markdown code blocks (like \`\`\`javascript).
      6. Return ONLY the raw JavaScript string.
      7. Use windowWidth and windowHeight for canvas size to ensure it fits the mobile screen.
      8. If using colors, favor the p5.js color palette or nice aesthetic hex codes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    let code = response.text || '';
    
    // Cleanup any markdown artifacts if Gemini slips up
    code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();
    
    return code;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate code. Please check your connection or try a different prompt.");
  }
};