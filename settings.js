// settings.js

export function maakInstellingenMenu(containerId, userId, logoutActie, instellingenActie) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Voorkom dubbele menu's bij dubbele inlaad-acties
    const bestaandMenu = document.getElementById('fancy-settings-wrapper');
    if (bestaandMenu) bestaandMenu.remove();

    // Wrapper maken
    const wrapper = document.createElement('div');
    wrapper.id = 'fancy-settings-wrapper';
    wrapper.className = 'settings-wrapper'; // Styling nu via CSS!

    // Icoon maken
    const icoon = document.createElement('span');
    icoon.innerHTML = '⚙️';
    icoon.className = 'settings-icon';
    
    // Menu maken
    const menu = document.createElement('div');
    menu.className = 'settings-menu';

    function maakMenuItem(tekst, actie) {
        const knop = document.createElement('button');
        knop.innerText = tekst;
        knop.className = 'settings-btn';
        
        knop.addEventListener('click', () => {
            // Verberg het menu door de CSS class te verwijderen
            menu.classList.remove('open');
            icoon.classList.remove('open');
            actie();
        });
        
        return knop;
    }

    const uitlogKnop = maakMenuItem('🚪 Uitloggen', logoutActie);
    menu.appendChild(uitlogKnop);

    // Beveiligde knop (alleen voor jou)
    const adminUID = 'quPw1vZznYZoiD23stDz7cng0ND3';
    if (userId === adminUID) {
        const scheidingsLijn = document.createElement('hr');
        scheidingsLijn.className = 'settings-divider';
        menu.appendChild(scheidingsLijn);

        const modellenKnop = maakMenuItem('🛠️ AI modellen', instellingenActie);
        menu.appendChild(modellenKnop);
    }

    // Toggle logica
    icoon.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('open');
        icoon.classList.toggle('open');
    });

    // Buiten klikken sluit menu
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
            icoon.classList.remove('open');
        }
    });

    wrapper.appendChild(icoon);
    wrapper.appendChild(menu);
    container.appendChild(wrapper);
}
