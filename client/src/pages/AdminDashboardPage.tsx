import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut,
  Upload,
  FileText,
  Trash2,
  FileUp,
  Search,
  Download,
  Users,
  BarChart,
  LineChart,
  ArrowUpRight,
  FilePieChart,
  BookOpen,
  BookOpenCheck,
  Building,
  Eye,
} from "lucide-react";

// Form validation schema
const documentFormSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  programId: z.string().min(1, { message: "Veuillez sélectionner une filière" }),
  academicYearId: z.string().min(1, { message: "Veuillez sélectionner une année académique" }),
  documentTypeId: z.string().min(1, { message: "Veuillez sélectionner un type de document" }),
  year: z.string().min(1, { message: "Veuillez entrer l'année de l'épreuve" }),
  description: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function AdminDashboardPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if user is authenticated
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Fetch entities, departments, programs, academic years, and document types
  const { data: entities } = useQuery({
    queryKey: ["/api/entities"],
    enabled: !!user,
  });

  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
    enabled: !!user,
  });

  const { data: programs } = useQuery({
    queryKey: ["/api/programs"],
    enabled: !!user,
  });

  const { data: academicYears } = useQuery({
    queryKey: ["/api/academic-years"],
    enabled: !!user,
  });

  const { data: documentTypes } = useQuery({
    queryKey: ["/api/document-types"],
    enabled: !!user,
  });

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  // Form setup
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      programId: "",
      academicYearId: "",
      documentTypeId: "",
      year: new Date().getFullYear().toString(),
      description: "",
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setFileError("");

    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Seuls les fichiers PDF sont acceptés");
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFileError("La taille du fichier ne doit pas dépasser 10MB");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du document");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document ajouté",
        description: "Le document a été ajouté avec succès",
      });
      form.reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setActiveTab("documents");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du document",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/documents/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document",
      });
    },
  });

  // Handle document upload
  const onSubmit = (data: DocumentFormValues) => {
    if (!selectedFile) {
      setFileError("Veuillez sélectionner un fichier PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    
    const documentData = {
      title: data.title,
      programId: parseInt(data.programId),
      academicYearId: parseInt(data.academicYearId),
      documentTypeId: parseInt(data.documentTypeId),
      year: parseInt(data.year),
      description: data.description || "",
    };
    
    formData.append("document", JSON.stringify(documentData));
    uploadMutation.mutate(formData);
  };

  // Handle document deletion
  const handleDeleteClick = (document: any) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/login");
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Helper function to get entity and department names for a document
  const getEntityAndDepartmentForDocument = (doc: any) => {
    if (!programs || !departments || !entities) return { entity: "", department: "" };
    
    const program = programs.find((p: any) => p.id === doc.programId);
    if (!program) return { entity: "", department: "" };
    
    const department = departments.find((d: any) => d.id === program.departmentId);
    if (!department) return { entity: "", department: "" };
    
    const entity = entities.find((e: any) => e.id === department.entityId);
    
    return {
      entity: entity?.name || "",
      department: department?.name || ""
    };
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Filter documents based on search query
  const filteredDocuments = documents?.filter((doc: any) => {
    if (!searchQuery) return true;
    
    const { entity, department } = getEntityAndDepartmentForDocument(doc);
    const academicYear = academicYears?.find((y: any) => y.id === doc.academicYearId);
    const documentType = documentTypes?.find((t: any) => t.id === doc.documentTypeId);
    const program = programs?.find((p: any) => p.id === doc.programId);
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower) ||
      entity.toLowerCase().includes(searchLower) ||
      department.toLowerCase().includes(searchLower) ||
      academicYear?.name.toLowerCase().includes(searchLower) ||
      documentType?.name.toLowerCase().includes(searchLower) ||
      program?.name.toLowerCase().includes(searchLower) ||
      program?.fullName?.toLowerCase().includes(searchLower) ||
      doc.year.toString().includes(searchLower)
    );
  });

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Espace Administrateur</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ajouter">Ajouter un Document</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Documents disponibles
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">254</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% depuis le mois dernier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visites</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,892</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +24% depuis la semaine dernière
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'engagement</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +8% depuis la période précédente
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Aperçu des téléchargements</CardTitle>
                <CardDescription>
                  Évolution des téléchargements sur les 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] flex items-center justify-center border-t">
                  <LineChart className="h-16 w-16 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Documents populaires</CardTitle>
                <CardDescription>
                  Les documents les plus téléchargés ce mois-ci
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents?.slice(0, 4).map((doc: any, i: number) => {
                    const { entity, department } = getEntityAndDepartmentForDocument(doc);
                    const program = programs?.find((p: any) => p.id === doc.programId);
                    return (
                      <div key={doc.id} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {entity} / {program?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <span>{42 - i * 7}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par entité</CardTitle>
                <CardDescription>
                  Distribution des documents par entité académique
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[200px] flex items-center justify-center border-t">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <FilePieChart className="h-12 w-12 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">Données disponibles en production</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Statistiques utilisateurs</CardTitle>
                <CardDescription>
                  Profil des visiteurs et comportement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Utilisateurs uniques</span>
                    </div>
                    <span className="font-medium">478</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Pages par session</span>
                    </div>
                    <span className="font-medium">3.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Taux de rebond</span>
                    </div>
                    <span className="font-medium">24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Taux de conversion</span>
                    </div>
                    <span className="font-medium">12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Opérations fréquentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start" 
                    onClick={() => setActiveTab("ajouter")}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Ajouter un document
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start" 
                    onClick={() => setActiveTab("documents")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les documents
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FilePieChart className="mr-2 h-4 w-4" />
                    Générer un rapport
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Documents</CardTitle>
              <CardDescription>
                Consultez, recherchez et gérez tous les documents disponibles.
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, entité, département..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : !documents || documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun document n'a été trouvé.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Entité/Département</TableHead>
                        <TableHead>Année</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date d'ajout</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments?.map((doc: any) => {
                        const { entity, department } = getEntityAndDepartmentForDocument(doc);
                        const academicYear = academicYears?.find((y: any) => y.id === doc.academicYearId);
                        const documentType = documentTypes?.find((t: any) => t.id === doc.documentTypeId);
                        
                        return (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.title}</TableCell>
                            <TableCell>
                              {entity} / {department}
                            </TableCell>
                            <TableCell>
                              {academicYear?.name} ({doc.year})
                            </TableCell>
                            <TableCell>{documentType?.name}</TableCell>
                            <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <a
                                  href={doc.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteClick(doc)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ajouter" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un nouveau document</CardTitle>
              <CardDescription>
                Ajoutez un nouveau document à la bibliothèque CULIB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre du document</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mathématiques - Analyse Numérique" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="programId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filière</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une filière" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments?.map((dept: any) => {
                                const entity = entities?.find((e: any) => e.id === dept.entityId);
                                const deptPrograms = programs?.filter((p: any) => p.departmentId === dept.id);
                                
                                return (
                                  <div key={dept.id}>
                                    <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                                      {entity?.name} - {dept.name}
                                    </div>
                                    {deptPrograms?.map((program: any) => (
                                      <SelectItem key={program.id} value={program.id.toString()}>
                                        {program.name} {program.fullName ? `(${program.fullName})` : ''}
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academicYearId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année académique</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une année" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicYears?.map((year: any) => (
                                <SelectItem key={year.id} value={year.id.toString()}>
                                  {year.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="documentTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentTypes?.map((type: any) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année de l'épreuve</FormLabel>
                          <FormControl>
                            <Input type="number" min="2000" max="2100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Épreuve de rattrapage | 2ème année | 2023" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier PDF</Label>
                    <div className="border border-input rounded-md p-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : "Sélectionner un fichier PDF"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Taille maximale: 10MB
                        </p>
                        {fileError && (
                          <p className="text-xs text-destructive">{fileError}</p>
                        )}
                        <Input
                          id="file"
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Label 
                          htmlFor="file"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                        >
                          Choisir un fichier
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Ajout en cours...
                      </div>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Ajouter le document
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {documentToDelete && (
              <p className="font-medium">{documentToDelete.title}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
