import {
  Entity,
  InsertEntity,
  Department,
  InsertDepartment,
  Program,
  InsertProgram,
  AcademicYear,
  InsertAcademicYear,
  DocumentType,
  InsertDocumentType,
  Document,
  InsertDocument,
  User,
  InsertUser,
  DocumentWithRelations,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserPassword(username: string, password: string): Promise<User | null>;

  // Entity methods
  getAllEntities(): Promise<Entity[]>;
  getEntity(id: number): Promise<Entity | undefined>;
  createEntity(entity: InsertEntity): Promise<Entity>;

  // Department methods
  getAllDepartments(): Promise<Department[]>;
  getDepartmentsByEntityId(entityId: number): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Program methods
  getAllPrograms(): Promise<Program[]>;
  getProgramsByDepartmentId(departmentId: number): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Academic year methods
  getAllAcademicYears(): Promise<AcademicYear[]>;
  getAcademicYear(id: number): Promise<AcademicYear | undefined>;
  createAcademicYear(academicYear: InsertAcademicYear): Promise<AcademicYear>;

  // Document type methods
  getAllDocumentTypes(): Promise<DocumentType[]>;
  getDocumentType(id: number): Promise<DocumentType | undefined>;
  createDocumentType(documentType: InsertDocumentType): Promise<DocumentType>;

  // Document methods
  getAllDocuments(): Promise<Document[]>;
  getRecentDocuments(limit: number): Promise<DocumentWithRelations[]>;
  getDocumentsByProgramId(programId: number): Promise<Document[]>;
  getDocumentsByAcademicYearId(academicYearId: number): Promise<Document[]>;
  getDocumentsByDepartmentId(departmentId: number): Promise<Document[]>;
  getDocumentsByEntityId(entityId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentWithRelations(
    id: number
  ): Promise<DocumentWithRelations | undefined>;
  searchDocuments(query: string): Promise<DocumentWithRelations[]>;
  filterDocuments(filters: {
    entityId?: number;
    departmentId?: number;
    programId?: number;
    academicYearId?: number;
    documentTypeId?: number;
  }): Promise<DocumentWithRelations[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(
    id: number,
    document: Partial<Document>
  ): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private entities: Map<number, Entity>;
  private departments: Map<number, Department>;
  private programs: Map<number, Program>;
  private academicYears: Map<number, AcademicYear>;
  private documentTypes: Map<number, DocumentType>;
  private documents: Map<number, Document>;
  private stats: {
    uniqueVisitors: number;
    pagesPerSession: number;
    bounceRate: number;
    conversionRate: number;
    downloads: Map<number, number>; // documentId -> download count
  };

  private currentUserId: number;
  private currentEntityId: number;
  private currentDepartmentId: number;
  private currentProgramId: number;
  private currentAcademicYearId: number;
  private currentDocumentTypeId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.entities = new Map();
    this.departments = new Map();
    this.programs = new Map();
    this.academicYears = new Map();
    this.documentTypes = new Map();
    this.documents = new Map();
    this.stats = {
      uniqueVisitors: 0,
      pagesPerSession: 0,
      bounceRate: 0,
      conversionRate: 0,
      downloads: new Map()
    };

    this.currentUserId = 1;
    this.currentEntityId = 1;
    this.currentDepartmentId = 1;
    this.currentProgramId = 1;
    this.currentAcademicYearId = 1;
    this.currentDocumentTypeId = 1;
    this.currentDocumentId = 1;

    this.seedData();
  }

  // Initialize with default data
  private async seedData() {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    this.createUser({
      username: "admin",
      password: hashedPassword,
      name: "Administrateur",
    });

    // Create academic years
    this.createAcademicYear({
      year: 1,
      name: "1ère année",
    });
    this.createAcademicYear({
      year: 2,
      name: "2ème année",
    });
    this.createAcademicYear({
      year: 3,
      name: "3ème année",
    });

    // Create document types
    this.createDocumentType({ name: "Examen final" });
    this.createDocumentType({ name: "Contrôle continu" });
    this.createDocumentType({ name: "Rattrapage" });
    this.createDocumentType({ name: "TD" });
    this.createDocumentType({ name: "TP" });

    // Create entities
    const enset = await this.createEntity({
      name: "ENSET",
      fullName: "École Normale Supérieure de l'Enseignement Technique",
      description:
        "École Normale Supérieure de l'Enseignement Technique du Centre Universitaire de Lokossa",
    });
    console.log("enset:", enset);
    console.log("enset.id:", enset.id, "type:", typeof enset.id);

    const insti = await this.createEntity({
      name: "INSTI",
      fullName: "Institut National des Sciences et Techniques Industrielles",
      description:
        "Institut National des Sciences et Techniques Industrielles du Centre Universitaire de Lokossa",
    });
    console.log("insti:", insti);
    console.log("insti.id:", insti.id, "type:", typeof insti.id);

    // Create ENSET departments
    console.log(
      "entityId passé à createDepartment:",
      enset.id,
      typeof enset.id
    );
    const stiDept = await this.createDepartment({
      entityId: enset.id,
      name: "STI",
      fullName: "Sciences et Techniques Industrielles",
      description: "Département des Sciences et Techniques Industrielles",
    });
    console.log(`Dept créé : ${stiDept.name}, entityId = ${stiDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      enset.id,
      typeof enset.id
    );
    const staDept = await this.createDepartment({
      entityId: enset.id,
      name: "STA",
      fullName: "Sciences et Techniques Agricoles",
      description: "Département des Sciences et Techniques Agricoles",
    });
    console.log(`Dept créé : ${staDept.name}, entityId = ${staDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      enset.id,
      typeof enset.id
    );
    const stagDept = await this.createDepartment({
      entityId: enset.id,
      name: "STAG",
      fullName: "Sciences et Techniques Administratives et de Gestion",
      description:
        "Département des Sciences et Techniques Administratives et de Gestion",
    });
    console.log(
      `Dept créé : ${stagDept.name}, entityId = ${stagDept.entityId}`
    );

    console.log(
      "entityId passé à createDepartment:",
      enset.id,
      typeof enset.id
    );
    const stbassDept = await this.createDepartment({
      entityId: enset.id,
      name: "STBASS",
      fullName:
        "Sciences et Techniques Biologiques Appliquées et Sciences Sociales",
      description:
        "Département des Sciences et Techniques Biologiques Appliquées et Sciences Sociales",
    });
    console.log(
      `Dept créé : ${stbassDept.name}, entityId = ${stbassDept.entityId}`
    );

    // Create INSTI departments
    console.log(
      "entityId passé à createDepartment:",
      insti.id,
      typeof insti.id
    );
    const geDept = await this.createDepartment({
      entityId: insti.id,
      name: "GE",
      fullName: "Génie Énergétique",
      description: "Département de Génie Énergétique",
    });
    console.log(`Dept créé : ${geDept.name}, entityId = ${geDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      insti.id,
      typeof insti.id
    );
    const gcDept = await this.createDepartment({
      entityId: insti.id,
      name: "GC",
      fullName: "Génie Civil",
      description: "Département de Génie Civil",
    });
    console.log(`Dept créé : ${gcDept.name}, entityId = ${gcDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      insti.id,
      typeof insti.id
    );
    const msyDept = await this.createDepartment({
      entityId: insti.id,
      name: "MSY",
      fullName: "Maintenance des Systèmes",
      description: "Département de Maintenance des Systèmes",
    });
    console.log(`Dept créé : ${msyDept.name}, entityId = ${msyDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      insti.id,
      typeof insti.id
    );
    const geiDept = await this.createDepartment({
      entityId: insti.id,
      name: "GEI",
      fullName: "Génie Électrique et Informatique",
      description: "Département de Génie Électrique et Informatique",
    });
    console.log(`Dept créé : ${geiDept.name}, entityId = ${geiDept.entityId}`);

    console.log(
      "entityId passé à createDepartment:",
      insti.id,
      typeof insti.id
    );
    const gmpDept = await this.createDepartment({
      entityId: insti.id,
      name: "GMP",
      fullName: "Génie Mécanique et Productique",
      description: "Département de Génie Mécanique et Productique",
    });
    console.log(`Dept créé : ${gmpDept.name}, entityId = ${gmpDept.entityId}`);

    // Create STI programs
    this.createProgram({
      departmentId: stiDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "MA",
      fullName: "Mathématiques Appliquées",
      description: "Programme de Mathématiques Appliquées",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "FM",
      fullName: "Fabrication Mécanique",
      description: "Programme de Fabrication Mécanique",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "GC",
      fullName: "Génie Civil",
      description: "Programme de Génie Civil",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "ELT",
      fullName: "Électrotechnique",
      description: "Programme d'Électrotechnique",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "ELE",
      fullName: "Électronique",
      description: "Programme d'Électronique",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "ER",
      fullName: "Énergies Renouvelables",
      description: "Programme d'Énergies Renouvelables",
    });

    this.createProgram({
      departmentId: stiDept.id,
      name: "FC",
      fullName: "Froid et Climatisation",
      description: "Programme de Froid et Climatisation",
    });

    // Create STA programs
    this.createProgram({
      departmentId: staDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: staDept.id,
      name: "PA",
      fullName: "Production Animale",
      description: "Programme de Production Animale",
    });

    this.createProgram({
      departmentId: staDept.id,
      name: "PV",
      fullName: "Production Végétale",
      description: "Programme de Production Végétale",
    });

    // Create STAG programs
    this.createProgram({
      departmentId: stagDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: stagDept.id,
      name: "ECO",
      fullName: "Économie",
      description: "Programme d'Économie",
    });

    this.createProgram({
      departmentId: stagDept.id,
      name: "CG",
      fullName: "Comptabilité et Gestion",
      description: "Programme de Comptabilité et Gestion",
    });

    this.createProgram({
      departmentId: stagDept.id,
      name: "SAG",
      fullName: "Sciences et Administration de Gestion",
      description: "Programme de Sciences et Administration de Gestion",
    });

    // Create STBASS programs
    this.createProgram({
      departmentId: stbassDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: stbassDept.id,
      name: "HR",
      fullName: "Hôtellerie et Restauration",
      description: "Programme d'Hôtellerie et Restauration",
    });

    this.createProgram({
      departmentId: stbassDept.id,
      name: "MMV",
      fullName: "Marketing et Management de la Vente",
      description: "Programme de Marketing et Management de la Vente",
    });

    this.createProgram({
      departmentId: stbassDept.id,
      name: "EFS",
      fullName: "Éducation Familiale et Sociale",
      description: "Programme d'Éducation Familiale et Sociale",
    });

    // Create GE programs
    this.createProgram({
      departmentId: geDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: geDept.id,
      name: "FC",
      fullName: "Froid et Climatisation",
      description: "Programme de Froid et Climatisation",
    });

    this.createProgram({
      departmentId: geDept.id,
      name: "ER",
      fullName: "Énergies Renouvelables",
      description: "Programme d'Énergies Renouvelables",
    });

    // Create GC programs
    this.createProgram({
      departmentId: gcDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: gcDept.id,
      name: "GC",
      fullName: "Génie Civil",
      description: "Programme de Génie Civil",
    });

    // Create MSY programs
    this.createProgram({
      departmentId: msyDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: msyDept.id,
      name: "MI",
      fullName: "Maintenance Industrielle",
      description: "Programme de Maintenance Industrielle",
    });

    this.createProgram({
      departmentId: msyDept.id,
      name: "MA",
      fullName: "Mathématiques Appliquées",
      description: "Programme de Mathématiques Appliquées",
    });

    // Create GEI programs
    this.createProgram({
      departmentId: geiDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: geiDept.id,
      name: "IT",
      fullName: "Informatique",
      description: "Programme d'Informatique",
    });

    this.createProgram({
      departmentId: geiDept.id,
      name: "ELE",
      fullName: "Électronique",
      description: "Programme d'Électronique",
    });

    this.createProgram({
      departmentId: geiDept.id,
      name: "ELT",
      fullName: "Électrotechnique",
      description: "Programme d'Électrotechnique",
    });

    // Create GMP programs
    this.createProgram({
      departmentId: gmpDept.id,
      name: "Tronc commun",
      fullName: "Tronc commun",
      description: "Programme de tronc commun",
      isTroncCommun: true,
    });

    this.createProgram({
      departmentId: gmpDept.id,
      name: "GMP",
      fullName: "Génie Mécanique et Productique",
      description: "Programme de Génie Mécanique et Productique",
    });

    // Create sample documents
    this.createDocument({
      title: "Mathématiques Appliquées - Analyse Numérique",
      programId: 2, // MA
      academicYearId: 2, // 2ème année
      documentTypeId: 3, // Rattrapage
      filePath: "https://www.africau.edu/images/default/sample.pdf",
      fileSize: 3028, // 3 KB
      uploadDate: new Date(),
      year: 2023,
      description:
        "Épreuve de rattrapage d'Analyse Numérique pour les étudiants de 2ème année de Mathématiques Appliquées",
    });

    this.createDocument({
      title: "Programmation Orientée Objet - Java",
      programId: 31, // IT
      academicYearId: 1, // 1ère année
      documentTypeId: 1, // Examen final
      filePath:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileSize: 13264, // 13 KB
      uploadDate: new Date(),
      year: 2023,
      description:
        "Examen final de Programmation Orientée Objet pour les étudiants de 1ère année d'Informatique",
    });

    this.createDocument({
      title: "Comptabilité Générale - États Financiers",
      programId: 16, // CG
      academicYearId: 3, // 3ème année
      documentTypeId: 2, // Contrôle continu
      filePath: "https://www.orimi.com/pdf-test.pdf",
      fileSize: 502000, // 502 KB
      uploadDate: new Date(),
      year: 2023,
      description:
        "Contrôle continu des États Financiers pour les étudiants de 3ème année de Comptabilité et Gestion",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userInsert: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...userInsert, id, role: "admin" };
    this.users.set(id, user);
    return user;
  }

  async verifyUserPassword(
    username: string,
    password: string
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  // Entity methods
  async getAllEntities(): Promise<Entity[]> {
    return Array.from(this.entities.values());
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    return this.entities.get(id);
  }

  async createEntity(entityInsert: InsertEntity): Promise<Entity> {
    const id = this.currentEntityId++;
    const entity: Entity = { ...entityInsert, id };
    this.entities.set(id, entity);
    return entity;
  }

  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartmentsByEntityId(entityId: number): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(
      (dept) => Number(dept.entityId) === Number(entityId)
    );
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(
    departmentInsert: InsertDepartment
  ): Promise<Department> {
    const id = this.currentDepartmentId++;
    const department: Department = { ...departmentInsert, id };
    this.departments.set(id, department);
    return department;
  }

  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }

  async getProgramsByDepartmentId(departmentId: number): Promise<Program[]> {
    console.log(departmentId);
    return Array.from(this.programs.values()).filter(
      (prog) => prog.departmentId === departmentId
    );
  }

  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }

  async createProgram(programInsert: InsertProgram): Promise<Program> {
    const id = this.currentProgramId++;
    const program: Program = {
      ...programInsert,
      id,
      isTroncCommun: programInsert.isTroncCommun || false,
    };
    this.programs.set(id, program);
    return program;
  }

  // Academic year methods
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    return Array.from(this.academicYears.values());
  }

  async getAcademicYear(id: number): Promise<AcademicYear | undefined> {
    return this.academicYears.get(id);
  }

  async createAcademicYear(
    academicYearInsert: InsertAcademicYear
  ): Promise<AcademicYear> {
    const id = this.currentAcademicYearId++;
    const academicYear: AcademicYear = { ...academicYearInsert, id };
    this.academicYears.set(id, academicYear);
    return academicYear;
  }

  // Document type methods
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    return Array.from(this.documentTypes.values());
  }

  async getDocumentType(id: number): Promise<DocumentType | undefined> {
    return this.documentTypes.get(id);
  }

  async createDocumentType(
    documentTypeInsert: InsertDocumentType
  ): Promise<DocumentType> {
    const id = this.currentDocumentTypeId++;
    const documentType: DocumentType = { ...documentTypeInsert, id };
    this.documentTypes.set(id, documentType);
    return documentType;
  }

  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getRecentDocuments(limit: number): Promise<DocumentWithRelations[]> {
    const allDocs = Array.from(this.documents.values())
      .sort((a, b) => {
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      })
      .slice(0, limit);

    const docsWithRelations: DocumentWithRelations[] = [];

    for (const doc of allDocs) {
      const withRelations = await this.getDocumentWithRelations(doc.id);
      if (withRelations) {
        docsWithRelations.push(withRelations);
      }
    }

    return docsWithRelations;
  }

  async getDocumentsByProgramId(programId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.programId === programId
    );
  }

  async getDocumentsByAcademicYearId(
    academicYearId: number
  ): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.academicYearId === academicYearId
    );
  }

  async getDocumentsByDepartmentId(departmentId: number): Promise<Document[]> {
    // Find all programs in this department
    const departmentPrograms = await this.getProgramsByDepartmentId(
      departmentId
    );
    const programIds = departmentPrograms.map((p) => p.id);

    // Get all documents that belong to these programs
    return Array.from(this.documents.values()).filter((doc) =>
      programIds.includes(doc.programId)
    );
  }

  async getDocumentsByEntityId(entityId: number): Promise<Document[]> {
    // Find all departments in this entity
    const entityDepartments = await this.getDepartmentsByEntityId(entityId);

    // Find all programs in these departments
    const programsPromises = entityDepartments.map((dept) =>
      this.getProgramsByDepartmentId(dept.id)
    );
    const departmentPrograms = await Promise.all(programsPromises);
    const programIds = departmentPrograms.flat().map((p) => p.id);

    // Get all documents that belong to these programs
    return Array.from(this.documents.values()).filter((doc) =>
      programIds.includes(doc.programId)
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentWithRelations(
    id: number
  ): Promise<DocumentWithRelations | undefined> {
    const document = await this.getDocument(id);
    if (!document) return undefined;

    const program = await this.getProgram(document.programId);
    if (!program) return undefined;

    const academicYear = await this.getAcademicYear(document.academicYearId);
    if (!academicYear) return undefined;

    const documentType = await this.getDocumentType(document.documentTypeId);
    if (!documentType) return undefined;

    // Get department and entity (optional)
    let department: Department | undefined;
    let entity: Entity | undefined;

    if (program) {
      department = await this.getDepartment(program.departmentId);

      if (department) {
        entity = await this.getEntity(department.entityId);
      }
    }

    return {
      ...document,
      program,
      academicYear,
      documentType,
      department,
      entity,
    };
  }

  async searchDocuments(query: string): Promise<DocumentWithRelations[]> {
    const lowercaseQuery = query.toLowerCase();

    // Get all documents
    const allDocs = Array.from(this.documents.values());
    const matchingDocs: Document[] = [];

    // Find documents matching the query
    for (const doc of allDocs) {
      if (
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        doc.description?.toLowerCase().includes(lowercaseQuery)
      ) {
        matchingDocs.push(doc);
      } else {
        // Check if the program, academic year, or document type matches
        const program = await this.getProgram(doc.programId);
        const academicYear = await this.getAcademicYear(doc.academicYearId);
        const documentType = await this.getDocumentType(doc.documentTypeId);
        const department = program
          ? await this.getDepartment(program.departmentId)
          : undefined;
        const entity = department
          ? await this.getEntity(department.entityId)
          : undefined;

        if (
          program &&
          (program.name.toLowerCase().includes(lowercaseQuery) ||
            program.fullName?.toLowerCase().includes(lowercaseQuery))
        ) {
          matchingDocs.push(doc);
        } else if (
          academicYear &&
          academicYear.name.toLowerCase().includes(lowercaseQuery)
        ) {
          matchingDocs.push(doc);
        } else if (
          documentType &&
          documentType.name.toLowerCase().includes(lowercaseQuery)
        ) {
          matchingDocs.push(doc);
        } else if (
          department &&
          (department.name.toLowerCase().includes(lowercaseQuery) ||
            department.fullName.toLowerCase().includes(lowercaseQuery))
        ) {
          matchingDocs.push(doc);
        } else if (
          entity &&
          (entity.name.toLowerCase().includes(lowercaseQuery) ||
            entity.fullName.toLowerCase().includes(lowercaseQuery))
        ) {
          matchingDocs.push(doc);
        }
      }
    }

    // Get the documents with their relations
    const docsWithRelations: DocumentWithRelations[] = [];

    for (const doc of matchingDocs) {
      const withRelations = await this.getDocumentWithRelations(doc.id);
      if (withRelations) {
        docsWithRelations.push(withRelations);
      }
    }

    return docsWithRelations;
  }

  async filterDocuments(filters: {
    entityId?: number;
    departmentId?: number;
    programId?: number;
    academicYearId?: number;
    documentTypeId?: number;
  }): Promise<DocumentWithRelations[]> {
    let filteredDocs: Document[] = Array.from(this.documents.values());

    // Filter by entity
    if (filters.entityId) {
      filteredDocs = await this.getDocumentsByEntityId(filters.entityId);
    }

    // Filter by department
    if (filters.departmentId) {
      if (filters.entityId) {
        // We already filtered by entity, so filter the current result
        const departmentPrograms = await this.getProgramsByDepartmentId(
          filters.departmentId
        );
        const programIds = departmentPrograms.map((p) => p.id);

        filteredDocs = filteredDocs.filter((doc) =>
          programIds.includes(doc.programId)
        );
      } else {
        // No entity filter applied, so get all docs from this department
        filteredDocs = await this.getDocumentsByDepartmentId(
          filters.departmentId
        );
      }
    }

    // Filter by program
    if (filters.programId) {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.programId === filters.programId
      );
    }

    // Filter by academic year
    if (filters.academicYearId) {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.academicYearId === filters.academicYearId
      );
    }

    // Filter by document type
    if (filters.documentTypeId) {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.documentTypeId === filters.documentTypeId
      );
    }

    // Get the documents with their relations
    const docsWithRelations: DocumentWithRelations[] = [];

    for (const doc of filteredDocs) {
      const withRelations = await this.getDocumentWithRelations(doc.id);
      if (withRelations) {
        docsWithRelations.push(withRelations);
      }
    }

    return docsWithRelations;
  }

  async createDocument(documentInsert: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...documentInsert,
      id,
      uploadDate: documentInsert.uploadDate || new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(
    id: number,
    documentUpdate: Partial<Document>
  ): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;

    const updatedDocument = { ...existingDocument, ...documentUpdate };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}export const storage = new MemStorage();