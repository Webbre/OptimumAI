// storage.js

// Firebase inladen via officiële Google CDN - Nu INCLUSIEF deleteDoc!
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const SettingsService = {
    async getSetting(key) { return localStorage.getItem(key); },
    async setSetting(key, value) { localStorage.setItem(key, value); }
};

export const StorageService = {
    _cache: null,
    _cacheTimestamp: 0,
    CACHE_TTL: 5000, 

    async getChats(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this._cache && (now - this._cacheTimestamp) < this.CACHE_TTL) {
            return this._cache;
        }
        try {
            const querySnapshot = await getDocs(collection(db, "chats"));
            const chats = [];
            querySnapshot.forEach((doc) => { chats.push(doc.data()); });
            this._cache = chats;
            this._cacheTimestamp = now;
            return this._cache;
        } catch (e) {
            console.error("Fout bij ophalen chats:", e);
            return [];
        }
    },

    async saveChat(updatedChat) {
        try {
            updatedChat.updatedAt = Date.now();
            const chatRef = doc(db, "chats", updatedChat.id);
            await setDoc(chatRef, updatedChat, { merge: true });
            this._cache = null; 
        } catch (e) { console.error("Fout bij opslaan:", e); throw e; }
    },

    async updateChatField(chatId, field, value) {
        try {
            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, { [field]: value, updatedAt: Date.now() });
            this._cache = null; 
        } catch (e) { console.error("Fout bij updaten:", e); }
    },

    // NIEUW: Chat permanent verwijderen uit de database!
    async deleteChat(chatId) {
        try {
            await deleteDoc(doc(db, "chats", chatId));
            this._cache = null;
        } catch (e) { console.error("Fout bij verwijderen chat:", e); }
    },

    async migrateLocalToFirebase() {
        const localChatsStr = localStorage.getItem('webbre_chats');
        if (localChatsStr) {
            const localChats = JSON.parse(localChatsStr);
            if (localChats.length > 0) {
                for (const chat of localChats) {
                    const chatRef = doc(db, "chats", chat.id);
                    await setDoc(chatRef, chat, { merge: true });
                }
                localStorage.removeItem('webbre_chats');
            }
        }
    }
};
