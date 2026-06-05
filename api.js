// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

export async function callClaude(messages, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
        
        const result = await secureCallClaude({ 
            messages: messages,
            model: model 
        });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Claude aanroep:", error);
        throw error;
    }
}

// Toegevoegd: de optionele 'parts' parameter voor bestanden
export async function callGemini(prompt, parts, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        const payload = { model: model };
        // Als er bestanden zijn, sturen we de parts array, anders de platte prompt
        if (parts && parts.length > 0) {
            payload.parts = parts;
        } else {
            payload.prompt = prompt;
        }

        const result = await secureCallGemini(payload);
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
