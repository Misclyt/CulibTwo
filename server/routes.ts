import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import path from "path";
import fs from "fs";
import multer from "multer";
import { insertDocumentSchema } from "@shared/schema";

// Setup file upload
const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont acceptés"));
    }
    cb(null, true);
  },
});

// Setup session store
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "culib-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: "lax"
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.verifyUserPassword(username, password);
        if (!user) {
          return done(null, false, { message: "Identifiants incorrects" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Non autorisé" });
  };

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // API routes
  // Authentication
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Déconnecté avec succès" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
  });

  // Entities
  app.get("/api/entities", async (req, res) => {
    try {
      const entities = await storage.getAllEntities();
      res.json(entities);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des entités" });
    }
  });

  app.get("/api/entities/:id", async (req, res) => {
    try {
      const entity = await storage.getEntity(parseInt(req.params.id));
      if (!entity) {
        return res.status(404).json({ message: "Entité non trouvée" });
      }
      res.json(entity);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération de l'entité" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      console.log("query:", req.query);
      const entityId = req.query.entityId
        ? parseInt(req.query.entityId as string)
        : undefined;
      console.log("entityId reçu:", entityId, "type:", typeof entityId); // Ajout ici

      let departments;
      if (entityId) {
        departments = await storage.getDepartmentsByEntityId(entityId);
      } else {
        departments = await storage.getAllDepartments();
      }

      res.json(departments);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des départements" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const department = await storage.getDepartment(parseInt(req.params.id));
      if (!department) {
        return res.status(404).json({ message: "Département non trouvé" });
      }
      res.json(department);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération du département" });
    }
  });

  // Programs
  app.get("/api/programs", async (req, res) => {
    try {
      console.log("query:", req.query);
      const departmentId = req.query.departmentId
        ? parseInt(req.query.departmentId as string)
        : undefined;

      let programs;
      if (departmentId) {
        programs = await storage.getProgramsByDepartmentId(departmentId);
      } else {
        programs = await storage.getAllPrograms();
      }

      res.json(programs);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des programmes" });
    }
  });

  app.get("/api/programs/:id", async (req, res) => {
    try {
      const program = await storage.getProgram(parseInt(req.params.id));
      if (!program) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.json(program);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération du programme" });
    }
  });

  // Academic years
  app.get("/api/academic-years", async (req, res) => {
    try {
      const academicYears = await storage.getAllAcademicYears();
      res.json(academicYears);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des années académiques",
      });
    }
  });

  // Document types
  app.get("/api/document-types", async (req, res) => {
    try {
      const documentTypes = await storage.getAllDocumentTypes();
      res.json(documentTypes);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des types de documents",
      });
    }
  });

  // Stats and Reports
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      const documentsPerEntity = await storage.getDocumentsPerEntity();
      const topDownloaded = await storage.getTopDownloadedDocuments(5);
      
      res.json({
        ...stats,
        documentsPerEntity,
        topDownloaded
      });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  app.post("/api/reports/generate", isAuthenticated, async (req, res) => {
    try {
      const XLSX = require('xlsx');
      console.log("Génération du rapport en cours...");
      const workbook = XLSX.utils.book_new();

      // Récupérer les données
      const stats = await storage.getStats();
      const documentsPerEntity = await storage.getDocumentsPerEntity();
      const topDownloaded = await storage.getTopDownloadedDocuments(10);
      const recentDocuments = await storage.getRecentDocuments(10);

      // Créer les feuilles
      const statsSheet = XLSX.utils.json_to_sheet([{
        "Total Documents": stats.totalDocuments,
        "Total Téléchargements": stats.totalDownloads,
        "Date du rapport": new Date().toLocaleDateString()
      }]);

      const entitySheet = XLSX.utils.json_to_sheet(documentsPerEntity.map(d => ({
        "Entité": d.entityName,
        "Nombre de documents": d.count
      })));

      const topSheet = XLSX.utils.json_to_sheet(topDownloaded.map(d => ({
        "Titre": d.title,
        "Téléchargements": d.downloads
      })));

      const recentSheet = XLSX.utils.json_to_sheet(recentDocuments.map(d => ({
        "Titre": d.title,
        "Date d'ajout": new Date(d.uploadDate).toLocaleDateString(),
        "Type": d.documentType?.name || "",
        "Entité": d.entity?.name || ""
      })));

      // Ajouter les feuilles au classeur
      XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistiques Globales");
      XLSX.utils.book_append_sheet(workbook, entitySheet, "Documents par Entité");
      XLSX.utils.book_append_sheet(workbook, topSheet, "Top Téléchargements");
      XLSX.utils.book_append_sheet(workbook, recentSheet, "Documents Récents");

      // Générer le buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=rapport-${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la génération du rapport" });
    }
  });

  app.post("/api/stats/track-visit", async (req, res) => {
    try {
      await storage.incrementUniqueVisitors();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors du suivi de la visite" });
    }
  });

  app.post("/api/stats/track-download/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      await storage.incrementDownloads(documentId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors du suivi du téléchargement" });
    }
  });

  // Documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      console.log(req.query);
      const {
        query,
        entityId,
        departmentId,
        programId,
        academicYearId,
        documentTypeId,
      } = req.query as { [key: string]: string | undefined };

      const filters: CombinedSearchFilters = {};

      if (query && typeof query === "string" && query.trim() !== "") {
        filters.query = query.trim();
      }
      if (entityId) {
        const parsed = parseInt(entityId, 10);
        if (!isNaN(parsed)) filters.entityId = parsed;
      }
      if (departmentId) {
        const parsed = parseInt(departmentId, 10);
        if (!isNaN(parsed)) filters.departmentId = parsed;
      }
      if (programId) {
        const parsed = parseInt(programId, 10);
        if (!isNaN(parsed)) filters.programId = parsed;
      }
      if (academicYearId) {
        const parsed = parseInt(academicYearId, 10);
        if (!isNaN(parsed)) filters.academicYearId = parsed;
      }
      if (documentTypeId) {
        const parsed = parseInt(documentTypeId, 10);
        if (!isNaN(parsed)) filters.documentTypeId = parsed;
      }

      // Si aucun filtre (y compris query) n'est appliqué, on considère que c'est pour "tous les documents"
      if (Object.keys(filters).length === 0) {
        console.log("Backend: Getting all documents (no filters provided)");
        const documents = await storage.getAllDocuments(); // Ou storage.findDocuments({})
        return res.json(documents);
      }

      // Sinon, on utilise les filtres combinés
      console.log("Backend: Searching/filtering documents with:", filters);
      // Vous auriez besoin d'une fonction storage.findDocuments qui peut gérer tous ces critères
      const documents = await storage.filterDocuments(filters);
      res.json(documents);
    } catch (err) {
      console.error("Erreur /api/documents:", err);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des documents" });
    }
  });

  app.get("/api/documents/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const documents = await storage.getRecentDocuments(limit);
      res.json(documents);
    } catch (err) {
      res.status(500).json({
        message: "Erreur lors de la récupération des documents récents",
      });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocumentWithRelations(
        parseInt(req.params.id)
      );
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }
      res.json(document);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération du document" });
    }
  });

  // Admin routes (protected)
  app.post(
    "/api/documents",
    isAuthenticated,
    upload.single("file"),
    async (req, res) => {
      try {
        const file = req.file;
        if (!file) {
          return res
            .status(400)
            .json({ message: "Aucun fichier n'a été fourni" });
        }

        const documentData = JSON.parse(req.body.document);

        // Validate document data
        const validatedData = insertDocumentSchema.parse({
          ...documentData,
          filePath: `/uploads/${file.filename}`,
          fileSize: file.size,
          uploadDate: new Date(),
        });

        const document = await storage.createDocument(validatedData);
        res.status(201).json(document);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: "Données de document invalides",
            errors: err.errors,
          });
        }

        res
          .status(500)
          .json({ message: "Erreur lors de la création du document" });
      }
    }
  );

  app.put("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);

      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      res.json(document);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du document" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Delete file
      if (document.filePath.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), document.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete document from storage
      const success = await storage.deleteDocument(id);

      if (success) {
        res.json({ message: "Document supprimé avec succès" });
      } else {
        res
          .status(500)
          .json({ message: "Erreur lors de la suppression du document" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression du document" });
    }
  });

  // Serve uploaded files
  app.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(process.cwd(), "uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${req.params.filename}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  const httpServer = createServer(app);
  return httpServer;
}