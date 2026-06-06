// api.js
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

// Hulpfunctie om Firebase calls aan de voorkant te kunnen afbreken via een signaal
function withAbort(promise, signal) {
    if (!signal) return promise;
    return new Promise((resolve, reject) => {
        // Als er al op stop is geklikt voordat we beginnen
        if (signal.aborted) {
            const err = new Error("Aborted");
            err.name = "AbortError";
            return reject(err);
        }
        
        // De actie die we uitvoeren zodra er op 'stop' wordt geklikt
        const abortHandler = () => {
            const err = new Error("Aborted");
            err.name = "AbortError";
            reject(err);
        };
        
        // Luister naar de stopknop
        signal.addEventListener('abort', abortHandler);
        
        // Voer de originele API call uit
        promise
            .then(resolve)
            .catch(reject)
            .finally(() => {
                // Opruimen als we klaar zijn
                signal.removeEventListener('abort', abortHandler);
            });
    });
}

export async function callClaude(messages, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallClaude = httpsCallable(functions, 'secureCallClaude');
        
        // We wikkelen de aanroep nu in onze withAbort functie
        const result = await withAbort(secureCallClaude({ 
            messages: messages,
            model: model 
        }), signal);
        
        return result.data;
    } catch (error) {
        // We loggen geen rode foutmeldingen in de console als we het simpelweg zelf gestopt hebben
        if (error.name !== "AbortError") {
            console.error("Fout in beveiligde Claude aanroep:", error);
        }
        throw error;
    }
}

export async function callGemini(prompt, parts, model, signal) {
    try {
        const functions = getFunctions(getApp());
        const secureCallGemini = httpsCallable(functions, 'secureCallGemini');

        const payload = { model: model };
        if (parts && parts.length > 0) {
            payload.parts = parts;
        } else {
            payload.prompt = prompt;
        }

        // We wikkelen de aanroep nu in onze withAbort functie
        const result = await withAbort(secureCallGemini(payload), signal);
        
        return result.data;
    } catch (error) {
        // We loggen geen rode foutmeldingen in de console als we het simpelweg zelf gestopt hebben
        if (error.name !== "AbortError") {
            console.error("Fout in beveiligde Gemini aanroep:", error);
        }
        throw error;
    }
}
