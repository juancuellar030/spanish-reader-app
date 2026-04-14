const fs = require('fs');

const markdown = fs.readFileSync('school_students_2026.md', 'utf-8');
const lines = markdown.split('\n');

const students = [];
let currentGrade = 0;
let idCounter = 1;

function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const assignedStoriesByGrade = {
    1: ["grade-1-story-1-flipbook", "grade-1-story-1", "grade-1-story-2", "grade-1-story-3"],
    2: ["grade-2-story-1-flipbook"],
    3: ["grade-3-story-1", "grade-3-story-2", "grade-3-story-3"],
    4: ["grade-4-story-1", "grade-4-story-2", "grade-4-story-3"],
    5: ["grade-5-story-1", "grade-5-story-2", "grade-5-story-3"]
};

for (const line of lines) {
    const text = line.trim();
    if (!text) continue;

    if (text.startsWith('First grade')) currentGrade = 1;
    else if (text.startsWith('Second grade')) currentGrade = 2;
    else if (text.startsWith('Third grade')) currentGrade = 3;
    else if (text.startsWith('Fourth grade')) currentGrade = 4;
    else if (text.startsWith('Fifth grade')) currentGrade = 5;
    else if (text.startsWith('##') || text.match(/^[A-ZÁÉÍÓÚÑ]/)) {
        const name = text.replace(/^#+\s*/, '').trim();
        if (name) {
            students.push({
                id: `student-${idCounter++}`,
                name: name,
                grade: currentGrade,
                password: generatePassword(),
                assignedStories: assignedStoriesByGrade[currentGrade] || []
            });
        }
    }
}

fs.writeFileSync('src/data/students.json', JSON.stringify(students, null, 4));
console.log('Successfully generated src/data/students.json with ' + students.length + ' students.');
