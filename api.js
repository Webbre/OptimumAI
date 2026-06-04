// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

const app = getApp();
const auth = getAuth(app); // CRUCIAAL: Dit koppelt jouw inlog-status direct aan de kluis!
const functions = getFunctions(app);

const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

export async function callClaude(messages, signal) {
    try {
        const result = await secureCallClaude({ messages: messages });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Claude aanroep:", error);
        throw error;
    }
}

export async function callGemini(prompt, signal) {
    try {
        const result = await secureCallGemini({ prompt: prompt });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
