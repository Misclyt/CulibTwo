export const ENTITIES = {
  ENSET: {
    id: 1,
    name: "ENSET",
    fullName: "École Normale Supérieure de l'Enseignement Technique",
    departments: [
      {
        id: 1,
        name: "STI",
        fullName: "Sciences et Techniques Industrielles",
        programs: ["Tronc commun", "MA", "FM", "GC", "ELT", "ELE", "ER", "FC"]
      },
      {
        id: 2,
        name: "STA",
        fullName: "Sciences et Techniques Agricoles",
        programs: ["Tronc commun", "PA", "PV"]
      },
      {
        id: 3,
        name: "STAG",
        fullName: "Sciences et Techniques Administratives et de Gestion",
        programs: ["Tronc commun", "ECO", "CG", "SAG"]
      },
      {
        id: 4,
        name: "STBASS",
        fullName: "Sciences et Techniques Biologiques Appliquées et Sciences Sociales",
        programs: ["Tronc commun", "HR", "MMV", "EFS"]
      }
    ]
  },
  INSTI: {
    id: 2,
    name: "INSTI",
    fullName: "Institut National des Sciences et Techniques Industrielles",
    departments: [
      {
        id: 5,
        name: "GE",
        fullName: "Génie Énergétique",
        programs: ["Tronc commun", "FC", "ER"]
      },
      {
        id: 6,
        name: "GC",
        fullName: "Génie Civil",
        programs: ["Tronc commun", "GC"]
      },
      {
        id: 7,
        name: "MSY",
        fullName: "Maintenance des Systèmes",
        programs: ["Tronc commun", "MI", "MA"]
      },
      {
        id: 8,
        name: "GEI",
        fullName: "Génie Électrique et Informatique",
        programs: ["Tronc commun", "IT", "ELE", "ELT"]
      },
      {
        id: 9,
        name: "GMP",
        fullName: "Génie Mécanique et Productique",
        programs: ["Tronc commun", "GMP"]
      }
    ]
  }
};

export const ACADEMIC_YEARS = [
  { id: 1, name: "1ère année", year: 1 },
  { id: 2, name: "2ème année", year: 2 },
  { id: 3, name: "3ème année", year: 3 }
];

export const DOCUMENT_TYPES = [
  { id: 1, name: "Examen final" },
  { id: 2, name: "Contrôle continu" },
  { id: 3, name: "Rattrapage" },
  { id: 4, name: "TD" },
  { id: 5, name: "TP" }
];

export const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Vivien GNONLONFOUN",
    title: "Coordinateur du projet",
    bio: "Etudiant en énergies renouvelables à l'ENSET, journaliste à la VDN, influenceur engagé et stratège digital.",
    image: "/team/492A6754.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/vivien-gnonlonfoun-944bab313?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      email: "pencrace501@gmail.com",
      twitter: "#"
    }
  },
  {
    id: 2,
    name: "Marius ZOUNNON",
    title: "Responsable technique",
    bio: "Etudiant en Mécanique Automobile à l'ENSET, ancien membre de la FEUNSTIM, activiste et meilleur jeune graphiste aux Awards University 2024.",
    image: "/team/492A9764.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/marius-zounnon-076073336?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      email: "zounnonmarius@gmail.com",
      github: "#"
    }
  }
];

export const STATS = [
  { id: 1, value: "50+", label: "Épreuves disponibles" },
  { id: 2, value: "8+", label: "Départements" },
  { id: 3, value: "15+", label: "Filières" },
  { id: 4, value: "100+", label: "Utilisateurs actifs" }
];

export const RECENT_DOCUMENTS = [
  {
    id: 1,
    title: "Mathématiques Appliquées - Analyse Numérique",
    entity: "ENSET",
    department: "STI",
    program: "MA",
    academicYear: "2ème année",
    documentType: "Rattrapage",
    year: 2023,
    uploadDate: "15/06/2023",
    fileSize: "2.4 MB",
    filePath: "/uploads/sti_ma_an_2023.pdf",
    description: "Épreuve de rattrapage | 2ème année | 2023"
  },
  {
    id: 2,
    title: "Programmation Orientée Objet - Java",
    entity: "INSTI",
    department: "GEI",
    program: "IT",
    academicYear: "1ère année",
    documentType: "Examen final",
    year: 2023,
    uploadDate: "12/06/2023",
    fileSize: "1.8 MB",
    filePath: "/uploads/gei_it_poo_2023.pdf",
    description: "Examen final | 1ère année | 2023"
  },
  {
    id: 3,
    title: "Comptabilité Générale - États Financiers",
    entity: "ENSET",
    department: "STAG",
    program: "CG",
    academicYear: "3ème année",
    documentType: "Contrôle continu",
    year: 2023,
    uploadDate: "10/06/2023",
    fileSize: "3.1 MB",
    filePath: "/uploads/stag_cg_ef_2023.pdf",
    description: "Contrôle continu | 3ème année | 2023"
  }
];
