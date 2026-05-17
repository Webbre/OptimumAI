// api.js
import { CONFIG } from './config.js';
import { SettingsService } from './storage.js';

export async function callClaude(messages, signal) {
    const key = await SettingsService.getSetting('webbreClaude');
    const model = await SettingsService.getSetting('webbreClaudeModel') || 'claude-opus-4-7';
    
    try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST", 
            headers: { 
                "x-api-key": key, 
                "anthropic-version": "2023-06-01", 
                "content-type": "application/json", 
                "anthropic-dangerous-direct-browser-access": "true" 
            },
            body: JSON.stringify({ model, max_tokens: CONFIG.OUTPUT_TOKENS, messages }), 
            signal
        });
        
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) throw new Error('Claude API-key is ongeldig.');
            if (res.status === 429) throw new Error('Claude rate-limit bereikt. Wacht even.');
            if (res.status >= 500) throw new Error(`Claude server-probleem (${res.status}).`);
            throw new Error(`Claude API Fout: ${res.status}`);
        }
        
        const data = await res.json(); 
        return data.content[0].text;
    } catch (e) {
        if (e.name === 'AbortError') throw e;
        if (e.message.includes('Failed to fetch')) throw new Error('Kan geen verbinding maken met Claude. Check je internet.');
        throw e;
    }
}

export async function callGemini(prompt, signal) {
    const key = await SettingsService.getSetting('webbreGemini');
    const model = await SettingsService.getSetting('webbreGeminiModel') || 'gemini-2.5-pro';
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    try {
        const res = await fetch(url, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), 
            signal 
        });
        
        if (!res.ok) {
            if (res.status === 400) throw new Error('Gemini weigert de prompt.');
            if (res.status === 401 || res.status === 403) throw new Error('Gemini API-key ongeldig.');
            if (res.status === 429) throw new Error('Gemini rate-limit bereikt.');
            if (res.status >= 500) throw new Error(`Gemini server-probleem (${res.status}).`);
            throw new Error(`Gemini API Fout: ${res.status}`);
        }
        
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) throw new Error('Geen bruikbaar antwoord ontvangen van Gemini (veiligheidsfilter).');
        return text;
    } catch (e) {
        if (e.name === 'AbortError') throw e;
        if (e.message.includes('Failed to fetch')) throw new Error('Kan geen verbinding maken met Gemini.');
        throw e;
    }
}