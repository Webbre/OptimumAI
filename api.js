// api.js (fragment)
export async function callClaude(messages, modelNaam) {
    try {
        const app = getApp();
        const auth = getAuth(app);
        if (!auth.currentUser) throw new Error("De app ziet niet dat je bent ingelogd.");

        const functions = getFunctions(app);
        const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
        
        // We sturen nu expliciet het model mee naar de kluis
        const result = await secureCallClaude({ messages: messages, model: modelNaam });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Claude aanroep:", error);
        throw error;
    }
}

export async function callGemini(prompt, modelNaam) {
    try {
        const app = getApp();
        const auth = getAuth(app);
        if (!auth.currentUser) throw new Error("De app ziet niet dat je bent ingelogd.");

        const functions = getFunctions(app);
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        // We sturen nu expliciet het model mee naar de kluis
        const result = await secureCallGemini({ prompt: prompt, model: modelNaam });
        return result.data;
    } catch (error) {
        console.error("Fout in beveiligde Gemini aanroep:", error);
        throw error;
    }
}
