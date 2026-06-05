// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

export async function callClaude(messages, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
        
        // We sturen nu expliciet het geselecteerde model mee naar de kluis
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

export async function callGemini(prompt, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        // We sturen nu expliciet het geselecteerde model mee naar de kluis
        const result = await secureCallGemini({ 
            prompt: prompt,
            model: model
        });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
