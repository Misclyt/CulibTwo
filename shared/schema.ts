import { pgTable, text, serial, integer, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Entities (ENSET, INSTI)
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description").notNull(),
});

// Departments (STI, STA, etc.)
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => entities.id).notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
});

// Programs (MA, FM, GC, etc.)
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  name: text("name").notNull(),
  fullName: text("full_name"),
  description: text("description"),
  isTroncCommun: integer("is_tronc_commun", { mode: "number" }).default(0).notNull(),
});

// Academic years (1st, 2nd, 3rd)
export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(), // 1, 2, 3
  name: text("name").notNull(), // "1ère année", "2ème année", "3ème année"
});

// Document types (exam, assignment, etc)
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Examen", "TD", "TP", etc.
});

// Documents (PDFs)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  programId: integer("program_id").references(() => programs.id).notNull(),
  academicYearId: integer("academic_year_id").references(() => academicYears.id).notNull(),
  documentTypeId: integer("document_type_id").references(() => documentTypes.id).notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  year: integer("year").notNull(), // Academic year (2023, 2024, etc.)
  description: text("description"),
});

// Users (admin)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin").notNull(),
});

// Insert schemas
export const insertEntitySchema = createInsertSchema(entities);
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertProgramSchema = createInsertSchema(programs);
export const insertAcademicYearSchema = createInsertSchema(academicYears);
export const insertDocumentTypeSchema = createInsertSchema(documentTypes);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
});

// Types
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type AcademicYear = typeof academicYears.$inferSelect;
export type InsertAcademicYear = z.infer<typeof insertAcademicYearSchema>;

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Document with relations
export type DocumentWithRelations = Document & {
  program: Program;
  academicYear: AcademicYear;
  documentType: DocumentType;
  department?: Department;
  entity?: Entity;
};
