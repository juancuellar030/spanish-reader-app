const fs = require('fs');

// Update stories.json
const storiesPath = './src/data/stories.json';
const stories = JSON.parse(fs.readFileSync(storiesPath));
const newStory = {
    "id": "grade-3-story-1-flipbook",
    "title": "El mapa olvidado de los fundadores",
    "grade": 3,
    "type": "flipbook",
    "coverImage": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/story-cover.png",
    "previewImage3D": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/story-book-3d.png",
    "endImage": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/last-page.jpeg",
    "audioFile": "/spanish-reader-app/assets/audio/grade-3/story-1-flipbook.mp3",
    "timestampFile": "/spanish-reader-app/assets/audio/grade-3/story-1-flipbook.vtt",
    "wordCount": 350,
    "pages": [
        {
            "pageNumber": 1,
            "text": "Todo comenzó una tarde lluviosa de viernes. Lucas y Mariana se habían quedado tarde en el colegio ayudando a la bibliotecaria a organizar el archivo histórico, una sala llena de cajas viejas que olía a papel y a polvo.\n\n—¡Mira esto! —susurró Mariana. Estaba moviendo un retrato antiguo del primer rector del colegio cuando notó que el marco de madera tenía un compartimento secreto.\n\nLucas se acercó y, con mucho cuidado, sacó un papel amarillento y quebradizo. No era una carta, sino un plano del colegio. Pero este plano era diferente al que conocían: mostraba pasillos que ya no existían y una \"X\" roja marcada justo debajo del laboratorio de ciencias. Al pie del mapa, había una frase escrita en latín: \"Scientia est clavis\" (La ciencia es la llave).",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-1-first-half.jpeg",
            "wordStart": 0,
            "wordEnd": 100
        },
        {
            "pageNumber": 2,
            "text": "—Es un mapa del tesoro —dijo Lucas con los ojos muy abiertos—. Mi abuelo me contó que los fundadores del colegio escondieron algo valioso hace cien años, pero nadie supo nunca qué era.\n\n—Tenemos que investigar —respondió Mariana, guardando el mapa en su mochila—. Mañana, durante el recreo largo, iremos al laboratorio.",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-1-second-half.jpeg",
            "wordStart": 101,
            "wordEnd": 150
        },
        {
            "pageNumber": 3,
            "text": "Al día siguiente, los dos amigos se escabulleron hacia el edificio de ciencias. El mapa indicaba que la entrada al túnel secreto estaba detrás de la estantería de los microscopios.\n\nMariana empujó la estantería, pero era demasiado pesada.\n\n—Espera —dijo Lucas, mirando el mapa de nuevo—. Aquí hay unos símbolos extraños. Parecen números romanos: V, I, III.\n\n—Cinco, uno, tres... —murmuró Mariana. Entonces, miró los frascos de muestras biológicas en la repisa. Cada frasco tenía un número. Sin pensarlo dos veces, movió el frasco número 5, luego el 1 y finalmente el 3.",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-2-first-half.jpeg",
            "wordStart": 151,
            "wordEnd": 230
        },
        {
            "pageNumber": 4,
            "text": "Se escuchó un clic mecánico. Un panel de madera en la pared se deslizó suavemente, revelando un hueco oscuro y estrecho. El corazón de Lucas latía con fuerza por la adrenalina.\n\n—¿Estás lista? —preguntó encendiendo la linterna de su reloj.\n\n—Siempre —respondió ella.\n\nEntraron en el pequeño cuarto secreto. No había oro ni joyas. En el centro, sobre una mesa de piedra, había una caja de metal oxidada con la fecha \"1925\" grabada en la tapa.",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-2-second-half.jpeg.jpg",
            "wordStart": 231,
            "wordEnd": 300
        },
        {
            "pageNumber": 5,
            "text": "Justo cuando iban a abrir la caja, escucharon pasos afuera. Era Don Ricardo, el conserje.\n\n—¡Rápido! —susurró Mariana.\n\nAbrieron la caja. Dentro encontraron una colección de objetos extraños: una pluma fuente, unas gafas redondas, una foto en blanco y negro de los primeros alumnos y una carta escrita a mano.\n\nLucas leyó la carta en voz alta:\n\n\"A los estudiantes del futuro: No les dejamos oro, porque el dinero se gasta. Les dejamos nuestra historia. Este colegio fue construido ladrillo a ladrillo por soñadores. El verdadero tesoro es el conocimiento que adquirirán aquí. Úsenlo para hacer el bien\".",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-3-first-half.jpeg",
            "wordStart": 301,
            "wordEnd": 380
        },
        {
            "pageNumber": 6,
            "text": "Lucas y Mariana se miraron, un poco decepcionados por no encontrar monedas de oro, pero también emocionados. Entendieron que tenían en sus manos el legado original de su colegio.\n\nGuardaron todo tal como estaba y salieron sigilosamente, cerrando el panel secreto.\n\n—¿Se lo contamos a alguien? —preguntó Lucas mientras volvían al patio.\n\nMariana sonrió.\n\n—No. Dejemos que otros estudiantes lo descubran dentro de cien años. Será nuestro secreto de fundadores.",
            "image": "/spanish-reader-app/assets/images/story-covers/third-grade/story-1/chapter-3-second-half.jpeg",
            "wordStart": 381,
            "wordEnd": 450
        }
    ]
};
const insertIndex = stories.findIndex(s => s.id === "grade-2-story-1-flipbook");
if (insertIndex !== -1) {
    stories.splice(insertIndex + 1, 0, newStory);
} else {
    stories.unshift(newStory);
}
fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 4));

// Update students.json
const studentsPath = './src/data/students.json';
const students = JSON.parse(fs.readFileSync(studentsPath));
students.forEach(s => {
    if (s.grade === 3 && !s.assignedStories.includes("grade-3-story-1-flipbook")) {
        s.assignedStories.unshift("grade-3-story-1-flipbook");
    }
});
fs.writeFileSync(studentsPath, JSON.stringify(students, null, 4));

console.log("JSON files updated.");
