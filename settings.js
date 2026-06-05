// settings.js

export function maakInstellingenMenu(containerId, emailGebruiker) {
  // Zoek de plek waar het menu moet komen (bijvoorbeeld de div van je titel)
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Kan de container voor het instellingenmenu niet vinden.");
    return;
  }

  // Maak een verpakking (wrapper) voor het icoon en het menu
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.style.marginLeft = '15px';

  // Maak het tandwiel-icoontje
  const icoon = document.createElement('span');
  icoon.innerHTML = '⚙️';
  icoon.style.cursor = 'pointer';
  icoon.style.fontSize = '1.2rem';
  icoon.style.transition = 'transform 0.3s ease';
  
  // Maak het dropdown-menu
  const menu = document.createElement('div');
  menu.style.position = 'absolute';
  menu.style.top = '120%';
  menu.style.left = '0';
  menu.style.backgroundColor = '#ffffff';
  menu.style.border = '1px solid #e0e0e0';
  menu.style.borderRadius = '8px';
  menu.style.padding = '8px 0';
  menu.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
  menu.style.minWidth = '180px';
  menu.style.zIndex = '1000';
  
  // Start onzichtbaar voor de soepele animatie
  menu.style.opacity = '0';
  menu.style.visibility = 'hidden';
  menu.style.transform = 'translateY(-10px)';
  menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s';

  // Hulpscript om snel stijlvolle knoppen te maken
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
    
    // Een lichtgrijze achtergrond als je er met de muis overheen gaat
    knop.addEventListener('mouseover', () => knop.style.backgroundColor = '#f5f5f5');
    knop.addEventListener('mouseout', () => knop.style.backgroundColor = 'transparent');
    knop.addEventListener('click', actie);
    
    return knop;
  }

  // Voeg de standaard 'Uitloggen' knop toe voor iedereen
  const uitlogKnop = maakMenuItem('Uitloggen', () => {
    console.log('Uitloggen aangeklikt');
    // Hier kun je later de code toevoegen die de gebruiker daadwerkelijk uitlogt
  });
  menu.appendChild(uitlogKnop);

  // Controleer of de ingelogde gebruiker de beheerder is
  const beheerdersEmail = "emweeber@gmail.com"; // VERVANG DIT DOOR JOUW EMAIL
  
  if (emailGebruiker === beheerdersEmail) {
    // Voeg een subtiel lijntje toe om de beheerder-opties te scheiden
    const scheidingsLijn = document.createElement('hr');
    scheidingsLijn.style.margin = '4px 0';
    scheidingsLijn.style.border = 'none';
    scheidingsLijn.style.borderTop = '1px solid #eee';
    menu.appendChild(scheidingsLijn);

    // Voeg de exclusieve modellen-knop toe
    const modellenKnop = maakMenuItem('API Modellen wijzigen', () => {
      console.log('Modellen wijzigen aangeklikt');
      // Hier komt straks de pop-up of logica om de modellen aan te passen
    });
    menu.appendChild(modellenKnop);
  }

  // Klik-actie voor het mooi openen en sluiten (inclusief een draaiend tandwiel)
  icoon.addEventListener('click', (event) => {
    event.stopPropagation(); // Voorkom dat andere klik-acties op de pagina in de war raken
    const isOpen = menu.style.visibility === 'visible';
    
    if (isOpen) {
      // Menu dichtklappen
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      icoon.style.transform = 'rotate(0deg)';
      setTimeout(() => menu.style.visibility = 'hidden', 300);
    } else {
      // Menu openklappen
      menu.style.visibility = 'visible';
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
      icoon.style.transform = 'rotate(90deg)';
    }
  });

  // Sluit het menu automatisch als je ergens anders op de pagina klikt
  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target) && menu.style.visibility === 'visible') {
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      icoon.style.transform = 'rotate(0deg)';
      setTimeout(() => menu.style.visibility = 'hidden', 300);
    }
  });

  // Plak alle onderdelen aan elkaar en zet ze op de pagina
  wrapper.appendChild(icoon);
  wrapper.appendChild(menu);
  container.appendChild(wrapper);
}