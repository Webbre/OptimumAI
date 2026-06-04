// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

export async function callClaude(messages, signal) {
    try {
        const app = getApp();
        const auth = getAuth(app);
        
        // Controleer of je inloggegevens beschikbaar zijn
        if (!auth.currentUser) {
            throw new Error("De app ziet niet dat je bent ingelogd.");
        }

        const functions = getFunctions(app);
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
        const app = getApp();
        const auth = getAuth(app);
        
        // Controleer of je inloggegevens beschikbaar zijn
        if (!auth.currentUser) {
            throw new Error("De app ziet niet dat je bent ingelogd.");
        }

        const functions = getFunctions(app);
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        const result = await secureCallGemini({ prompt: prompt });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
