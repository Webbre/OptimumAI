// settings.js

export function maakInstellingenMenu(containerId, userId, logoutActie, instellingenActie) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Voorkom dat we dubbele menu's maken als de pagina per ongeluk twee keer laadt
    const bestaandMenu = document.getElementById('fancy-settings-wrapper');
    if (bestaandMenu) bestaandMenu.remove();

    const wrapper = document.createElement('div');
    wrapper.id = 'fancy-settings-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginLeft = '10px';

    // Het tandwiel
    const icoon = document.createElement('span');
    icoon.innerHTML = '⚙️';
    icoon.style.cursor = 'pointer';
    icoon.style.fontSize = '1.2rem';
    icoon.style.transition = 'transform 0.3s ease';
    
    // Het uitklapmenu
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '140%';
    menu.style.left = '0';
    menu.style.backgroundColor = '#ffffff';
    menu.style.border = '1px solid #e0e0e0';
    menu.style.borderRadius = '8px';
    menu.style.padding = '8px 0';
    menu.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    menu.style.minWidth = '180px';
    menu.style.zIndex = '1000';
    
    // Start onzichtbaar
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
    menu.style.transform = 'translateY(-10px)';
    menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s';

    function maakMenuItem(tekst, actie) {
        const knop = document.createElement('button');
        knop.innerText = tekst;
        knop.style.display = 'block';
        knop.style.width = '100%';
        knop.style.padding = '10px 16px';
        knop.style.border = 'none';
        knop.style.background = 'transparent';
        knop.style.textAlign = 'left';
        knop.style.cursor = 'pointer';
        knop.style.fontSize = '0.95rem';
        knop.style.color = '#333';
        knop.style.transition = 'background-color 0.2s';
        
        knop.addEventListener('mouseover', () => knop.style.backgroundColor = '#f5f5f5');
        knop.addEventListener('mouseout', () => knop.style.backgroundColor = 'transparent');
        knop.addEventListener('click', () => {
            // Sluit menu mooi af na klikken
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            icoon.style.transform = 'rotate(0deg)';
            setTimeout(() => menu.style.visibility = 'hidden', 300);
            actie(); // Voer de gekoppelde functie uit
        });
        
        return knop;
    }

    // Standaard knop: Uitloggen
    const uitlogKnop = maakMenuItem('🚪 Uitloggen', logoutActie);
    menu.appendChild(uitlogKnop);

    // Beveiligde knop: Alleen voor jou (Ewout)
    const adminUID = 'quPw1vZznYZoiD23stDz7cng0ND3';
    if (userId === adminUID) {
        const scheidingsLijn = document.createElement('hr');
        scheidingsLijn.style.margin = '4px 0';
        scheidingsLijn.style.border = 'none';
        scheidingsLijn.style.borderTop = '1px solid #eee';
        menu.appendChild(scheidingsLijn);

        const modellenKnop = maakMenuItem('🛠️ API & Modellen', instellingenActie);
        menu.appendChild(modellenKnop);
    }

    // Klik event voor het openen/sluiten
    icoon.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = menu.style.visibility === 'visible';
        
        if (isOpen) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            icoon.style.transform = 'rotate(0deg)';
            setTimeout(() => menu.style.visibility = 'hidden', 300);
        } else {
            menu.style.visibility = 'visible';
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
            icoon.style.transform = 'rotate(90deg)';
        }
    });

    // Sluit bij klikken buiten het menu
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target) && menu.style.visibility === 'visible') {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            icoon.style.transform = 'rotate(0deg)';
            setTimeout(() => menu.style.visibility = 'hidden', 300);
        }
    });

    wrapper.appendChild(icoon);
    wrapper.appendChild(menu);
    container.appendChild(wrapper);
}
