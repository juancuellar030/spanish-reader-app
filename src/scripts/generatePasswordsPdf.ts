import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read students data
const studentsPath = path.join(__dirname, '..', 'data', 'students.json');
const studentsData = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));

// Group students by grade
const studentsByGrade: Record<number, any[]> = {};
studentsData.forEach((student: any) => {
    if (!studentsByGrade[student.grade]) {
        studentsByGrade[student.grade] = [];
    }
    studentsByGrade[student.grade].push(student);
});

// Sort students within each grade by name
Object.keys(studentsByGrade).forEach((grade) => {
    studentsByGrade[Number(grade)].sort((a, b) => a.name.localeCompare(b.name));
});

// Create a document
const doc = new PDFDocument({ size: [612, 936], margin: 50 });

// Pipe its output somewhere, like to a file or HTTP response
const outputPath = path.join(process.cwd(), 'Contraseñas_Estudiantes.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const drawTableRow = (y: number, name: string, password: string, isHeader = false) => {
    doc.fontSize(isHeader ? 12 : 11);
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');

    // Draw cells
    doc.text(name, 50, y, { width: 300 });
    doc.text(password, 350, y, { width: 150 });

    // Draw lines
    doc.moveTo(50, y - 5).lineTo(500, y - 5).stroke();
    doc.moveTo(50, y + 20).lineTo(500, y + 20).stroke();
};

let tableTop = 50;

const drawPageHeader = (grade: number) => {
    doc.fontSize(24).text('Contraseñas de Estudiantes', 50, 50, { align: 'center' });
    doc.fontSize(16).font('Helvetica-Bold').text(`Grado ${grade}`, 50, 100);
    drawTableRow(130, 'Nombre del Estudiante', 'Contraseña', true);
    return 155;
};

// Iterate through grades
const sortedGrades = Object.keys(studentsByGrade).map(Number).sort((a, b) => a - b);

sortedGrades.forEach((grade, index) => {
    if (index > 0) {
        doc.addPage();
    }

    tableTop = drawPageHeader(grade);

    // Students
    studentsByGrade[grade].forEach((student: any) => {
        // 13 inches = 936 points. Leave a 50 margin at bottom -> break at 880
        if (tableTop > 880) {
            doc.addPage();
            tableTop = drawPageHeader(grade);
        }
        drawTableRow(tableTop, student.name, student.password, false);
        tableTop += 25;
    });
});

// Finalize PDF file
doc.end();

console.log(`PDF generated successfully at: ${outputPath}`);
