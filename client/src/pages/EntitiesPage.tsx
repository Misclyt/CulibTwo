import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight, School, Building2, BookOpen, FileText, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EntitiesPage() {
  // URL handling
  const [location, setLocation] = useLocation();
  const urlParts = location.split('/').filter(Boolean);
  const currentView = urlParts[1] || 'entities'; // entities, department, program
  const currentId = urlParts[2] ? parseInt(urlParts[2], 10) : null;
  const yearView = urlParts[3] || null;

  // Data loading
  const { data: entities, isLoading: entitiesLoading } = useQuery({
    queryKey: ["/api/entities"]
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["/api/departments"]
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/programs"]
  });

  const { data: academicYears } = useQuery({
    queryKey: ["/api/academic-years"]
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"]
  });

  // Loading state
  const isLoading = entitiesLoading || departmentsLoading || programsLoading || documentsLoading;

  // Get current entity, department or program based on URL
  const getCurrentEntity = () => {
    if (currentView === 'entity' && currentId && entities) {
      return entities.find((entity: any) => entity.id === currentId);
    }
    return null;
  };

  const getCurrentDepartment = () => {
    if (currentView === 'department' && currentId && departments) {
      return departments.find((dept: any) => dept.id === currentId);
    }
    return null;
  };

  const getCurrentProgram = () => {
    if (currentView === 'program' && currentId && programs) {
      return programs.find((prog: any) => prog.id === currentId);
    }
    return null;
  };

  // Get entity color based on name (for visual distinction)
  const getEntityColor = (entityName: string) => {
    const colors = {
      "ENSET": "bg-blue-700",
      "INSTI": "bg-emerald-700",
    };
    return colors[entityName as keyof typeof colors] || "bg-primary";
  };

  // Get departments for an entity
  const getDepartmentsForEntity = (entityId: number) => {
    if (!departments) return [];
    return departments.filter((dept: any) => dept.entityId === entityId);
  };

  // Get programs for a department
  const getProgramsForDepartment = (departmentId: number) => {
    if (!programs) return [];
    return programs.filter((prog: any) => prog.departmentId === departmentId);
  };

  // Get documents for a program and optional academic year
  const getDocumentsForProgram = (programId: number, academicYearId?: number) => {
    if (!documents) return [];
    let filtered = documents.filter((doc: any) => doc.programId === programId);
    if (academicYearId) {
      filtered = filtered.filter((doc: any) => doc.academicYearId === academicYearId);
    }
    return filtered;
  };

  // Render helpers
  const renderBreadcrumbs = () => {
    const breadcrumbs = [
      { name: "Entités", path: "/entites" }
    ];

    const currentEntity = getCurrentEntity();
    const currentDepartment = getCurrentDepartment();
    const currentProgram = getCurrentProgram();

    if (currentEntity) {
      breadcrumbs.push({ 
        name: currentEntity.name, 
        path: `/entites/entity/${currentEntity.id}` 
      });
    }

    if (currentDepartment) {
      const entityId = currentDepartment.entityId;
      const entity = entities?.find((e: any) => e.id === entityId);
      
      if (entity) {
        breadcrumbs.push({ 
          name: entity.name, 
          path: `/entites/entity/${entity.id}` 
        });
      }
      
      breadcrumbs.push({ 
        name: currentDepartment.name, 
        path: `/entites/department/${currentDepartment.id}` 
      });
    }

    if (currentProgram) {
      const department = departments?.find((d: any) => d.id === currentProgram.departmentId);
      
      if (department) {
        const entity = entities?.find((e: any) => e.id === department.entityId);
        
        if (entity) {
          breadcrumbs.push({ 
            name: entity.name, 
            path: `/entites/entity/${entity.id}` 
          });
        }
        
        breadcrumbs.push({ 
          name: department.name, 
          path: `/entites/department/${department.id}` 
        });
      }
      
      breadcrumbs.push({ 
        name: currentProgram.name, 
        path: `/entites/program/${currentProgram.id}` 
      });

      if (yearView) {
        const year = academicYears?.find((y: any) => y.id.toString() === yearView);
        if (year) {
          breadcrumbs.push({ 
            name: year.name, 
            path: `/entites/program/${currentProgram.id}/${year.id}` 
          });
        }
      }
    }

    return (
      <nav className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{item.name}</span>
              ) : (
                <Link href={item.path} className="hover:text-primary transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // View: Entities list (main page)
  const renderEntitiesView = () => {
    if (!entities || entities.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune entité disponible pour le moment.</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8">
        {entities.map((entity: any) => {
          // Définir le nombre de départements et filières manuellement pour chaque entité
          const departmentCount = entity.name === "ENSET" ? 4 : entity.name === "INSTI" ? 5 : getDepartmentsForEntity(entity.id).length;
          const programCount = entity.name === "ENSET" ? 15 : entity.name === "INSTI" ? 8 : 0;

          return (
            <Card key={entity.id} className="overflow-hidden border-2 hover:border-primary/60 transition-all duration-300 group">
              <div className={`${getEntityColor(entity.name)} h-2`}></div>
              <CardHeader className="relative">
                <div className="absolute top-4 right-4 opacity-10 text-primary">
                  <School size={80} />
                </div>
                <CardTitle className="text-2xl">{entity.name}</CardTitle>
                <CardDescription className="text-lg">{entity.fullName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} />
                      <span>{departmentCount} départements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <span>{programCount} filières</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{entity.description || `Explorez les départements et filières de ${entity.fullName}.`}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setLocation(entity.id <= 2 ? `/coming-soon/entity/${entity.id}` : `/entites/entity/${entity.id}`)} 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                >
                  Explorer {entity.name}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  // View: Single entity with its departments
  const renderEntityView = () => {
    const entity = getCurrentEntity();
    if (!entity) return null;

    const entityDepartments = getDepartmentsForEntity(entity.id);

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl flex items-center gap-2">
              <span className={`${getEntityColor(entity.name)} p-1 rounded`}>
                <School className="h-8 w-8 text-white" />
              </span>
              {entity.name}
            </h1>
            <p className="text-xl text-muted-foreground">{entity.fullName}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entityDepartments.map((department: any) => {
            const programCount = getProgramsForDepartment(department.id).length;
            
            return (
              <Card key={department.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{department.name}</CardTitle>
                      <CardDescription className="text-base">{department.fullName}</CardDescription>
                    </div>
                    <Building2 className="h-8 w-8 text-primary/50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <BookOpen size={16} />
                    <span>{programCount} filières</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {department.description || `Découvrez les filières et épreuves du département ${department.name}.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation(`/entites/department/${department.id}`)}
                  >
                    Voir les filières
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // View: Single department with its programs
  const renderDepartmentView = () => {
    const department = getCurrentDepartment();
    if (!department) return null;

    const departmentPrograms = getProgramsForDepartment(department.id);
    const entity = entities?.find((e: any) => e.id === department.entityId);

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl flex items-center gap-2">
              <span className="bg-primary p-1 rounded">
                <Building2 className="h-8 w-8 text-white" />
              </span>
              Département {department.name}
            </h1>
            <p className="text-xl text-muted-foreground">{department.fullName}</p>
            {entity && (
              <Badge variant="outline" className="mt-2">
                {entity.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentPrograms.map((program: any) => {
            // Count documents for this program
            const documentCount = documents ? documents.filter((doc: any) => doc.programId === program.id).length : 0;
            
            return (
              <Card key={program.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary/60">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{program.name}</CardTitle>
                      {program.fullName && program.fullName !== program.name && (
                        <CardDescription className="text-base">{program.fullName}</CardDescription>
                      )}
                    </div>
                    <BookOpen className="h-7 w-7 text-primary/50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {program.isTroncCommun === 1 && (
                      <Badge variant="secondary">Tronc commun</Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <FileText size={14} />
                      <span>{documentCount} épreuves</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {program.description || `Accédez aux épreuves de la filière ${program.name}.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => setLocation(`/entites/program/${program.id}`)}
                  >
                    Voir les épreuves
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // View: Program documents organized by academic year
  const renderProgramView = () => {
    const program = getCurrentProgram();
    if (!program) return null;

    // Get department and entity information
    const department = departments?.find((d: any) => d.id === program.departmentId);
    const entity = department ? entities?.find((e: any) => e.id === department.entityId) : null;
    
    // Get all documents for this program
    const programDocuments = documents ? documents.filter((doc: any) => doc.programId === program.id) : [];

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    };

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {entity && <Badge variant="outline">{entity.name}</Badge>}
            {department && <Badge variant="outline">{department.name}</Badge>}
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl flex items-center gap-2">
            <span className="bg-primary p-1 rounded">
              <BookOpen className="h-8 w-8 text-white" />
            </span>
            {program.name}
          </h1>
          {program.fullName && program.fullName !== program.name && (
            <p className="text-xl text-muted-foreground">{program.fullName}</p>
          )}
        </div>

        {academicYears && academicYears.length > 0 ? (
          <Tabs defaultValue={yearView || academicYears[0].id.toString()} className="w-full">
            <TabsList className="w-full justify-start overflow-auto">
              {academicYears.map((year: any) => (
                <TabsTrigger 
                  key={year.id} 
                  value={year.id.toString()}
                  onClick={() => setLocation(`/entites/program/${program.id}/${year.id}`)}
                >
                  {year.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {academicYears.map((year: any) => {
              const yearDocuments = programDocuments.filter((doc: any) => doc.academicYearId === year.id);
              
              return (
                <TabsContent key={year.id} value={year.id.toString()} className="py-4">
                  {yearDocuments.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/20">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground mb-2">Aucune épreuve disponible pour {year.name}</p>
                      <p className="text-sm text-muted-foreground/70">
                        Les épreuves seront ajoutées prochainement.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {yearDocuments.map((doc: any) => (
                        <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row">
                          <div className="md:w-16 w-full p-2 md:p-4 bg-primary/10 flex items-center justify-center md:justify-start">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-medium text-lg">{doc.title}</h3>
                            {doc.description && (
                              <p className="text-muted-foreground text-sm mt-1">{doc.description}</p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>Année: {doc.year}</span>
                              </div>
                              <div>
                                <span>Date d'ajout: {formatDate(doc.uploadDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex items-center">
                            <a 
                              href={doc.filePath} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Télécharger
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune année académique disponible.</p>
          </div>
        )}
      </div>
    );
  };

  // Main render function
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      );
    }

    if (currentView === 'entity' && currentId) {
      return renderEntityView();
    }

    if (currentView === 'department' && currentId) {
      return renderDepartmentView();
    }

    if (currentView === 'program' && currentId) {
      return renderProgramView();
    }

    return renderEntitiesView();
  };

  return (
    <div className="py-8 lg:py-12 bg-background min-h-[85vh]">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        {renderBreadcrumbs()}
        
        {/* Main content area */}
        {renderContent()}
      </div>
    </div>
  );
}
