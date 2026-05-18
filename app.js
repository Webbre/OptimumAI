// app.js
import { WORKFLOW_STEPS_TEXTS, PROMPTS } from './config.js';
import { StorageService, SettingsService } from './storage.js';
import { callClaude, callGemini } from './api.js';

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const auth = getAuth(getApp());
let globalUserId = null;

let currentChatId = null;
let abortController = null;
let collapsedCategories = new Set(JSON.parse(localStorage.getItem('collapsed_categories') || '[]'));

window.startNewChat = startNewChat;
window.updateHistoryDisplay = updateHistoryDisplay;
window.toggleSettings = toggleSettings;
window.startWorkflow = startWorkflow;
window.handleCategoryDropdownChange = handleCategoryDropdownChange;

function getWelcomeScreenHTML() {
    return `
        <div class="welcome-container">
            <div class="welcome-title">Ewout's Optimum AI tool</div>
            <div class="welcome-subtitle">De denkkracht van Claude en Gemini gebundeld</div>
        </div>
    `;
}

function showToast(message, type = 'error') {
    let container = document.getElementById('toast-container') || (() => { 
        const div = document.createElement('div'); div.id = 'toast-container'; document.body.appendChild(div); return div; 
    })();
    const toast = document.createElement('div'); toast.className = `toast toast-${type}`; toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => { toast.style.opacity = '0'; toast.addEventListener('transitionend', () => toast.remove()); }, 4000);
}

window.onload = async () => {
    document.getElementById('chat-window').innerHTML = getWelcomeScreenHTML();
    await loadKeys(); 
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            globalUserId = user.uid;
            document.getElementById('auth-screen').style.display = 'none'; 
            await StorageService.migrateLocalToFirebase();
            await updateHistoryDisplay();
        } else {
            globalUserId = null;
            document.getElementById('auth-screen').style.display = 'flex'; 
            document.getElementById('history-list').innerHTML = ''; 
        }
    });
    
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    document.getElementById('authPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('userPrompt').addEventListener('keydown', e => { 
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            startWorkflow(); 
        } 
    });

    document.getElementById('sendBtn').addEventListener('click', startWorkflow);
    document.getElementById('newChatBtn').addEventListener('click', startNewChat);
    document.getElementById('settingsLink').addEventListener('click', toggleSettings);
    document.getElementById('saveSettingsBtn').addEventListener('click', toggleSettings);

    document.getElementById('menu-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const btn = document.getElementById('menu-toggle');
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) { btn.innerHTML = '✖ Sluiten'; } 
        else { btn.innerHTML = '☰ Menu'; }
    });
};

async function handleLogin() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) { showToast('Vul alle velden in'); return; }
    
    try {
        const btn = document.getElementById('loginBtn');
        btn.innerText = 'Bezig met inloggen...';
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Succesvol ingelogd!', 'success');
    } catch (error) {
        console.error("Inlogfout:", error);
        showToast('E-mailadres of wachtwoord is onjuist');
    } finally {
        document.getElementById('loginBtn').innerText = 'Inloggen';
    }
}

async function handleLogout() {
    if (confirm('Weet je zeker dat je wilt uitloggen?')) {
        await signOut(auth);
        await startNewChat();
        showToast('Je bent uitgelogd', 'info');
    }
}

async function loadKeys() {
    document.getElementById('geminiKey').value = await SettingsService.getSetting('webbreGemini') || '';
    document.getElementById('claudeKey').value = await SettingsService.getSetting('webbreClaude') || '';
    document.getElementById('claudeModel').value = await SettingsService.getSetting('webbreClaudeModel') || 'claude-opus-4-7';
    document.getElementById('geminiModel').value = await SettingsService.getSetting('webbreGeminiModel') || 'gemini-2.5-pro';
}

async function toggleSettings() {
    const m = document.getElementById('settings-modal');
    if (m.style.display === 'block') {
        await SettingsService.setSetting('webbreGemini', document.getElementById('geminiKey').value.trim());
        await SettingsService.setSetting('webbreGeminiModel', document.getElementById('geminiModel').value);
        await SettingsService.setSetting('webbreClaude', document.getElementById('claudeKey').value.trim());
        await SettingsService.setSetting('webbreClaudeModel', document.getElementById('claudeModel').value);
        m.style.display = 'none'; showToast('Instellingen opgeslagen', 'success');
    } else { m.style.display = 'block'; }
}

async function handleCategoryDropdownChange(event) {
    if (currentChatId) {
        await StorageService.updateChatField(currentChatId, 'category', event.target.value);
        await updateHistoryDisplay();
    }
}

function renderCategoryGroup(title, chatsArray, categoryId, listElement) {
    if (chatsArray.length === 0) return;
    
    const header = document.createElement('div');
    header.className = 'category-header';
    const isCollapsed = collapsedCategories.has(categoryId);
    
    header.innerHTML = `<span>${title}</span><span class="chevron ${isCollapsed ? 'collapsed' : ''}">▼</span>`;
    header.onclick = () => {
        if (collapsedCategories.has(categoryId)) collapsedCategories.delete(categoryId);
        else collapsedCategories.add(categoryId);
        localStorage.setItem('collapsed_categories', JSON.stringify([...collapsedCategories]));
        updateHistoryDisplay();
    };
    listElement.appendChild(header);

    if (!isCollapsed) {
        const container = document.createElement('div');
        container.className = 'category-group-container';
        
        if (categoryId === 'pinned') {
            chatsArray.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0)).forEach(c => {
                container.appendChild(createHistoryElement(c));
            });
        } else {
            const groupedByDate = {};
            chatsArray.forEach(chat => {
                const d = chat.date || 'Onbekende datum';
                if (!groupedByDate[d]) groupedByDate[d] = [];
                groupedByDate[d].push(chat);
            });

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                if (a === 'Onbekende datum') return 1; if (b === 'Onbekende datum') return -1;
                const [dayA, monthA, yearA] = a.split('-'); const [dayB, monthB, yearB] = b.split('-');
                return new Date(`${yearB}-${monthB}-${dayB}`) - new Date(`${yearA}-${monthA}-${dayA}`);
            });

            for (const date of sortedDates) {
                const dateHeader = document.createElement('div');
                dateHeader.className = 'date-header'; dateHeader.innerText = date;
                container.appendChild(dateHeader);
                groupedByDate[date].sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0)).forEach(c => {
                    container.appendChild(createHistoryElement(c));
                });
            }
        }
        listElement.appendChild(container);
    }
}

async function updateHistoryDisplay() {
    if (!globalUserId) return; 
    
    const rawChats = await StorageService.getChats();
    const chats = [];
    
    for (const c of rawChats) {
        if ((!c.messages || c.messages.length === 0) && c.id !== currentChatId) {
            await StorageService.deleteChat(c.id);
        } else if (c.userId === globalUserId || !c.userId) { 
            chats.push(c);
        }
    }

    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const filtered = query ? chats.filter(c => c.title?.toLowerCase().includes(query) || c.messages?.some(m => m.content?.toLowerCase().includes(query))) : chats;
    const list = document.getElementById('history-list'); list.innerHTML = '';
    
    const pinned = filtered.filter(c => c.pinned);
    const unpinned = filtered.filter(c => !c.pinned);
    
    const werkChats = unpinned.filter(c => c.category === 'Werk & school');
    const priveChats = unpinned.filter(c => c.category !== 'Werk & school');

    renderCategoryGroup('📌 Vastgezet', pinned, 'pinned', list);
    renderCategoryGroup('🏠 Privé', priveChats, 'prive', list);
    renderCategoryGroup('💼 Werk & school', werkChats, 'werk', list);
}

function createHistoryElement(chat) {
    const item = document.createElement('div'); 
    item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
    item.onclick = () => loadChat(chat.id);
    
    const t = document.createElement('span'); 
    t.className = 'chat-title-text'; t.innerText = chat.title || 'Nieuwe chat'; 
    
    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const p = document.createElement('button'); 
    p.className = `action-btn pin-btn ${chat.pinned ? 'pinned' : ''}`; p.innerText = '📌';
    p.title = chat.pinned ? 'Maak deze chat los' : 'Pin deze chat';
    p.onclick = async (e) => { 
        e.stopPropagation(); await StorageService.updateChatField(chat.id, 'pinned', !chat.pinned); updateHistoryDisplay(); 
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete-btn'; delBtn.innerText = '🗑️'; delBtn.title = 'Verwijder chat';
    delBtn.onclick = async (e) => {
        e.stopPropagation(); 
        if (confirm('Weet je zeker dat je deze chat permanent wilt verwijderen?')) {
            await StorageService.deleteChat(chat.id);
            if (currentChatId === chat.id) await startNewChat();
            else updateHistoryDisplay();
        }
    };
    
    actions.appendChild(p); actions.appendChild(delBtn); item.appendChild(t); item.appendChild(actions); 
    return item;
}

async function loadChat(id) {
    currentChatId = id; 
    const chats = await StorageService.getChats(); 
    const chat = chats.find(c => c.id === id);
    const win = document.getElementById('chat-window'); win.innerHTML = '';
    
    if (chat) {
        document.getElementById('chatCategory').value = chat.category || 'Privé';
        chat.messages.forEach(m => appendMessage(m.role, m.content, false));
        win.scrollTop = win.scrollHeight;
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('menu-toggle').innerHTML = '☰ Menu';
    }
    document.getElementById('userPrompt').value = '';
    updateHistoryDisplay();
}

function appendMessage(role, content, autoScroll = true) {
    const win = document.getElementById('chat-window');
    const welcome = win.querySelector('.welcome-container'); if (welcome) welcome.remove();
    const div = document.createElement('div');
    
    if (role === 'steps') {
        div.className = 'workflow-steps';
        content.forEach(s => { const sd = document.createElement('div'); sd.className = 'workflow-step'; sd.innerHTML = s; div.appendChild(sd); });
    } else if (role === 'ai') {
        div.className = 'message ai-message'; div.innerHTML = DOMPurify.sanitize(marked.parse(content));
    } else if (role === 'user') {
        div.className = 'message user-message'; div.innerText = content;
    } else if (role === 'error') {
        div.className = 'message error-message'; div.innerText = content;
    }
    
    win.appendChild(div);
    if (autoScroll) win.scrollTop = win.scrollHeight;
    return div;
}

async function generateChatTitle(promptText, chatId) {
    try { 
        let rawText = '';
        try { rawText = await callGemini(PROMPTS.TITEL(promptText), null); } 
        catch (geminiFout) {
            rawText = await callClaude([{role: 'user', content: PROMPTS.TITEL(promptText)}], null);
        }
        let nieuweTitel = rawText;
        const match = rawText.match(/\[(.*?)\]/);
        if (match && match[1]) { nieuweTitel = match[1].trim(); } 
        else {
            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.toUpperCase().includes('THOUGHT') && !l.startsWith('-'));
            if (lines.length > 0) nieuweTitel = lines[lines.length - 1];
        }
        nieuweTitel = nieuweTitel.replace(/\[|\]/g, '').replace(/^["']|["']$/g, '').trim();
        await StorageService.updateChatField(chatId, 'title', nieuweTitel);
        await updateHistoryDisplay();
    } catch(e) { console.error("Titelgeneratie gefaald:", e); }
}

async function startNewChat() {
    currentChatId = null; 
    document.getElementById('search-input').value = ''; 
    document.getElementById('chat-window').innerHTML = getWelcomeScreenHTML();
    document.getElementById('userPrompt').value = ''; 
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('menu-toggle').innerHTML = '☰ Menu';
    await updateHistoryDisplay();
}

async function startWorkflow() {
    if (abortController) { abortController.abort(); return; }
    const prompt = document.getElementById('userPrompt').value.trim();
    if (!prompt) return;
    
    if (!currentChatId) {
        currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const selectedCategory = document.getElementById('chatCategory').value || 'Privé';
        
        await StorageService.saveChat({ 
            id: currentChatId, 
            userId: globalUserId,
            title: prompt.substring(0,25) + '...', 
            category: selectedCategory,
            date: new Date().toLocaleDateString('nl-NL'),
            createdAt: Date.now(), 
            messages: [] 
        });
        generateChatTitle(prompt, currentChatId);
    }
    
    abortController = new AbortController(); 
    const signal = abortController.signal;
    const btn = document.getElementById('sendBtn'); 
    btn.innerText = 'Stop'; btn.classList.add('stop-btn');
    
    const originalPrompt = prompt; 
    appendMessage('user', prompt); 
    document.getElementById('userPrompt').value = '';
    const win = document.getElementById('chat-window'); 
    const loader = document.createElement('div'); loader.className = 'workflow-steps'; win.appendChild(loader);

    try {
        const chats = await StorageService.getChats(); 
        let chat = chats.find(c => c.id === currentChatId);
        
        // VEILIGHEIDSNET: Zorg dat het object altijd compleet is
        if (!chat) {
            chat = { 
                id: currentChatId, 
                userId: globalUserId,
                title: prompt.substring(0,25) + '...', 
                category: document.getElementById('chatCategory').value || 'Privé',
                date: new Date().toLocaleDateString('nl-NL'),
                createdAt: Date.now(),
                messages: [] 
            };
        }
        
        // Garandeer dat messages een array is
        if (!chat.messages) {
            chat.messages = [];
        }

        const history = chat.messages.filter(m => m.role==='user'||m.role==='ai').map(m => ({ role: m.role==='ai'?'assistant':'user', content: m.content }));
        
        loader.innerHTML = `<div class="workflow-step"><div class="spinner"></div> ${WORKFLOW_STEPS_TEXTS.CLAUDE_BUSY}</div>`;
        const draft = await callClaude([...history, {role:'user', content: prompt}], signal);
        
        loader.innerHTML = `<div class="workflow-step"><span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.CLAUDE_DONE}</div><div class="workflow-step"><div class="spinner"></div> ${WORKFLOW_STEPS_TEXTS.GEMINI_BUSY}</div>`;
        const feedback = await callGemini(PROMPTS.GEMINI_REVIEW(prompt, draft), signal);
        
        loader.innerHTML = `<div class="workflow-step"><span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.CLAUDE_DONE}</div><div class="workflow-step"><span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.GEMINI_DONE}</div><div class="workflow-step"><div class="spinner"></div> ${WORKFLOW_STEPS_TEXTS.OPTIMIZE_BUSY}</div>`;
        const final = await callClaude([{role:'user', content: PROMPTS.STRIKTE_REWRITE(prompt, draft, feedback)}], signal);

        loader.remove();
        const stappen = [`<span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.CLAUDE_DONE}`, `<span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.GEMINI_DONE}`, `<span class="workflow-done">✓</span> ${WORKFLOW_STEPS_TEXTS.OPTIMIZE_DONE}`];
        const sDiv = appendMessage('steps', stappen, false); appendMessage('ai', final, false);
        win.scrollTo({ top: sDiv.offsetTop - 20, behavior: 'smooth' });

        // Voeg de nieuwe berichten toe
        chat.messages.push({ role: 'user', content: prompt }, { role: 'steps', content: stappen }, { role: 'ai', content: final });
        
        // VERKEERSREGELAAR: Haal de allerlaatste versie van de chat op uit Firebase voordat we opslaan
        const updatedChats = await StorageService.getChats();
        const latestChat = updatedChats.find(c => c.id === currentChatId);
        
        if (latestChat) {
            // Als de titel inmiddels is aangepast door Trein B, behouden we die, en voegen we alleen onze berichten toe!
            latestChat.messages = chat.messages;
            await StorageService.saveChat(latestChat);
        } else {
            // Anders slaan we onze eigen versie gewoon op
            await StorageService.saveChat(chat);
        }
        
        await updateHistoryDisplay();
    } catch (e) {
        loader.remove();
        if (e.name === 'AbortError') { 
            showToast('Gestopt', 'info'); 
            document.getElementById('userPrompt').value = originalPrompt; 
            appendMessage('error', 'Generatie gestopt. De prompt is teruggeplaatst.');
        } else { showToast(e.message); appendMessage('error', e.message); }
    } finally { abortController = null; btn.innerText = 'Verstuur'; btn.classList.remove('stop-btn'); }
}
