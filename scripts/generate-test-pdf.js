import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour créer un PDF de test
function createTestPDF(fileName, title, content) {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Vérifier si le dossier uploads existe, sinon le créer
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, fileName);
  const doc = new PDFDocument();
  
  // Pipe le PDF dans un fichier
  doc.pipe(fs.createWriteStream(filePath));
  
  // Ajouter le contenu au PDF
  doc.fontSize(25).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(content);
  
  // Ajouter une page supplémentaire
  doc.addPage();
  doc.fontSize(20).text('Centre Universitaire de Lokossa', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Système de Gestion des Documents', { align: 'center' });
  doc.moveDown();
  doc.moveDown();
  doc.fontSize(12).text('Ce document est un exemple généré automatiquement pour tester le système de visualisation et de téléchargement de documents.', { align: 'justify' });
  
  // Finaliser le PDF
  doc.end();
  
  console.log(`Le PDF "${fileName}" a été créé dans le dossier "uploads".`);
  return filePath;
}

// Créer plusieurs PDFs de test
const testFiles = [
  {
    fileName: 'mathematiques-s1-2024.pdf',
    title: 'Examen de Mathématiques - Semestre 1',
    content: 'Ce document contient l\'examen de mathématiques du premier semestre de l\'année académique 2023-2024. Il comprend des exercices d\'algèbre, d\'analyse et de géométrie.'
  },
  {
    fileName: 'physique-s2-2024.pdf',
    title: 'Examen de Physique - Semestre 2',
    content: 'Ce document contient l\'examen de physique du deuxième semestre de l\'année académique 2023-2024. Il comprend des exercices de mécanique, d\'électromagnétisme et de thermodynamique.'
  },
  {
    fileName: 'informatique-s1-2024.pdf',
    title: 'Examen d\'Informatique - Semestre 1',
    content: 'Ce document contient l\'examen d\'informatique du premier semestre de l\'année académique 2023-2024. Il comprend des exercices sur les algorithmes, la programmation et les bases de données.'
  }
];

// Générer les PDFs
testFiles.forEach(file => {
  createTestPDF(file.fileName, file.title, file.content);
});

console.log('Tous les fichiers PDF de test ont été créés avec succès.');