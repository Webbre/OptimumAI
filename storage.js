// storage.js

// Firebase inladen via officiële Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './config.js';

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lokale opslag voor je API keys (die sturen we niet naar de cloud)
export const SettingsService = {
    async getSetting(key) { 
        return localStorage.getItem(key); 
    },
    async setSetting(key, value) { 
        localStorage.setItem(key, value); 
    }
};

export const StorageService = {
    _cache: null,
    _cacheTimestamp: 0,
    CACHE_TTL: 5000, 

    // Ophalen uit de Cloud Database (Firestore)
    async getChats(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this._cache && (now - this._cacheTimestamp) < this.CACHE_TTL) {
            return this._cache;
        }
        
        try {
            const querySnapshot = await getDocs(collection(db, "chats"));
            const chats = [];
            querySnapshot.forEach((doc) => {
                chats.push(doc.data());
            });
            this._cache = chats;
            this._cacheTimestamp = now;
            return this._cache;
        } catch (e) {
            console.error("Fout bij ophalen chats uit Firebase. Check of Test Mode aan staat:", e);
            return [];
        }
    },

    // Opslaan in de Cloud
    async saveChat(updatedChat) {
        try {
            updatedChat.updatedAt = Date.now();
            const chatRef = doc(db, "chats", updatedChat.id);
            await setDoc(chatRef, updatedChat, { merge: true });
            this._cache = null; // Cache wissen
        } catch (e) {
            console.error("Fout bij opslaan chat in Firebase:", e);
            throw e;
        }
    },

    // Atomaire update voor Firebase
    async updateChatField(chatId, field, value) {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
                [field]: value,
                updatedAt: Date.now()
            });
            this._cache = null; 
        } catch (e) {
            console.error("Fout bij updaten chat in Firebase:", e);
        }
    },

    // Geniale functie: Verhuist je oude lokale chats naar de nieuwe cloud!
    async migrateLocalToFirebase() {
        const localChatsStr = localStorage.getItem('webbre_chats');
        if (localChatsStr) {
            const localChats = JSON.parse(localChatsStr);
            if (localChats.length > 0) {
                console.log(`Verhuizing gestart: ${localChats.length} oude chats naar Firebase kopiëren...`);
                for (const chat of localChats) {
                    const chatRef = doc(db, "chats", chat.id);
                    await setDoc(chatRef, chat, { merge: true });
                }
                console.log("Verhuizing compleet! Lokale opslag wordt gewist.");
                localStorage.removeItem('webbre_chats');
            }
        }
    }
};