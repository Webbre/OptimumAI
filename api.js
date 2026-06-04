// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

const functions = getFunctions(getApp());
const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

export async function callClaude(messages, signal) {
    try {
        // We sturen de berichten naar jouw Firebase Kluis, NIET rechtstreeks naar Anthropic
        const result = await secureCallClaude({ messages: messages });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Claude aanroep:", error);
        throw error;
    }
}

export async function callGemini(prompt, signal) {
    try {
        // We sturen de prompt naar jouw Firebase Kluis, NIET rechtstreeks naar Google API
        const result = await secureCallGemini({ prompt: prompt });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
