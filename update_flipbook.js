const fs = require('fs');

const path = 'src/data/stories.json';
let stories = JSON.parse(fs.readFileSync(path, 'utf-8'));

const story = stories.find(s => s.id === 'grade-4-story-1-flipbook');

// Task 1: Move Chapter 4 intro from page 13 (idx 6) to page 11 (idx 5)
// Page 11 is story.pages[5]
// Page 13 is story.pages[6]

const p5_append = "\n\nCapítulo 4: La negociación\n\nLeo entendió entonces a qué se refería su tío Elías. El mundo no se había roto por un fallo mecánico, sino por la codicia de la rutina. Sabía que no podía derrotar a una criatura de humo con los puños; tenía que usar la inteligencia.";

// Remove this block from p6
const p6_target = "Capítulo 4: La negociación\n\nLeo entendió entonces a qué se refería su tío Elías. El mundo no se había roto por un fallo mecánico, sino por la codicia de la rutina. Sabía que no podía derrotar a una criatura de humo con los puños; tenía que usar la inteligencia.\n\n";

if (story.pages[6].text.includes("Capítulo 4: La negociación")) {
    story.pages[5].text += p5_append;
    story.pages[6].text = story.pages[6].text.replace(p6_target, "");
}

// Task 2: Move last lines of page 15 (idx 7) to overlayText
const p7_overlay = "—Tío —dijo Leo con una sonrisa tranquila—, creo que encontré el minuto que faltaba. No estaba en el engranaje del reloj.\n\nEl tío Elías se detuvo, miró a su sobrino a los ojos y sonrió.\n\n—Siempre supe que eras un buen relojero, muchacho. Ahora, ven y ayúdame a secar este café. No hay prisa, tenemos toda la tarde por delante.";

if (story.pages[7].text.includes("—Tío —dijo Leo")) {
    story.pages[7].text = story.pages[7].text.replace("\n\n" + p7_overlay, "");
    story.pages[7].overlayText = p7_overlay;
}

// Recalculate wordStart and wordEnd for ALL pages in this story
let currentGlobalWord = 0;
for (let p of story.pages) {
    p.wordStart = currentGlobalWord;

    // Count words in main text
    let mainWords = p.text.trim().length > 0 ? p.text.trim().split(/\s+/).length : 0;

    // Count words in overlayText if it exists
    let overlayWords = 0;
    if (p.overlayText && p.overlayText.trim().length > 0) {
        overlayWords = p.overlayText.trim().split(/\s+/).length;
    }

    let totalPageWords = mainWords + overlayWords;
    p.wordEnd = currentGlobalWord + totalPageWords - 1;
    currentGlobalWord += totalPageWords;
}

fs.writeFileSync(path, JSON.stringify(stories, null, 4));
console.log("Updated stories.json successfully.");
