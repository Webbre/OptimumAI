// config.js

export const CONFIG = { 
    OUTPUT_TOKENS: 4096 
};

export const SCHEMA_VERSION = 3;

export const WORKFLOW_STEPS_TEXTS = {
    CLAUDE_BUSY: 'Claude denkt na...', 
    CLAUDE_DONE: 'Claude heeft nagedacht',
    GEMINI_BUSY: 'Gemini controleert...', 
    GEMINI_DONE: 'Gemini heeft gecontroleerd',
    OPTIMIZE_BUSY: 'Claude optimaliseert...', 
    OPTIMIZE_DONE: 'Claude heeft geoptimaliseerd'
};

export const PROMPTS = {
    TITEL: (promptText) => `Je bent een AI die uitsluitend titels genereert. Bedenk een ultrakorte titel (maximaal 2 tot 4 woorden) voor de onderstaande vraag. \nREGELS:\n1. Zet de titel ALTIJD tussen vierkante haken, bijvoorbeeld: [Pearl Harbor aanval].\n2. Geef GEEN ENKELE andere tekst, uitleg of 'THOUGHT' proces.\n3. Gebruik alleen een hoofdletter voor het eerste woord (en eigennamen).\nVraag: ${promptText}`,
    GEMINI_REVIEW: (promptText, draft) => `Review dit antwoord op de vraag: "${promptText}". Antwoord: ${draft}`,
    STRIKTE_REWRITE: (promptText, draft, feedback) => `Herschrijf het volgende antwoord. Geef uitsluitend resultaat. ## voor titels, ### voor subtitels. Vraag: ${promptText} | Draft: ${draft} | Feedback: ${feedback}`
};

// PLAK HIER JOUW FIREBASE CONFIGURATIE (vervang de "..." met jouw gegevens):
export const firebaseConfig = {
    apiKey: "AIzaSyBQSBGdYgh6JKXD6lTchIQJryGdvL57xV0",
    authDomain: "optimumai-161af.firebaseapp.com",
    projectId: "optimumai-161af",
    storageBucket: "optimumai-161af.firebasestorage.app",
    messagingSenderId: "778043809577",
    appId: "1:778043809577:web:14d2bda745887e4a1f2138"
};