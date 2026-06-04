// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

export async function callClaude(messages, signal) {
    try {
        // We halen de actuele inlog-status pas op nádat je op versturen klikt
        const functions = getFunctions(getApp());
        const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
        
        const result = await secureCallClaude({ messages: messages });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Claude aanroep:", error);
        throw error;
    }
}

export async function callGemini(prompt, signal) {
    try {
        // We halen de actuele inlog-status pas op nádat je op versturen klikt
        const functions = getFunctions(getApp());
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        const result = await secureCallGemini({ prompt: prompt });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
