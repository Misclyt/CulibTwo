import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react"; // Icône loader
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

// Helper fetch
const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message || `Erreur réseau lors de l'appel à ${url}`
    );
  }
  return response.json();
};

interface ApiListItem {
  id: number | string;
  name: string;
}

export function SearchForm() {
  const [_wouterLocation, setWouterLocation] = useLocation();

  const initialParams = new URLSearchParams(window.location.search);

  // Tous les champs d'état
  const [entityId, setEntityId] = useState(initialParams.get("entityId") || "");
  const [departmentId, setDepartmentId] = useState(
    initialParams.get("departmentId") || ""
  );
  const [programId, setProgramId] = useState(initialParams.get("programId") || "");
  const [academicYearId, setAcademicYearId] = useState(
    initialParams.get("academicYearId") || ""
  );
  const [documentTypeId, setDocumentTypeId] = useState(
    initialParams.get("documentTypeId") || ""
  );

  // Loader pour la recherche
  const [isSearching, setIsSearching] = useState(false);

  const { data: entities, isLoading: isLoadingEntities } = useQuery<ApiListItem[]>(
    {
      queryKey: ["api_entities_list"],
      queryFn: () => fetchData("/api/entities"),
    }
  );

  const { data: departments, isLoading: isLoadingDepartments } = useQuery<
    ApiListItem[]
  >({
    queryKey: ["api_departments_list", entityId],
    queryFn: async ({ queryKey }) => {
      const [_key, currentEntityId] = queryKey;
      let url = "/api/departments";
      if (currentEntityId && currentEntityId !== "all" && currentEntityId !== "") {
        url += `?entityId=${currentEntityId}`;
      }
      return fetchData(url);
    },
    enabled: !!entityId,
  });

  const { data: programs, isLoading: isLoadingPrograms } = useQuery<ApiListItem[]>({
    queryKey: ["api_programs_list", departmentId],
    queryFn: async ({ queryKey }) => {
      const [_key, currentDepartmentId] = queryKey;
      let url = "/api/programs";
      if (
        currentDepartmentId &&
        currentDepartmentId !== "all" &&
        currentDepartmentId !== ""
      ) {
        url += `?departmentId=${currentDepartmentId}`;
      }
      return fetchData(url);
    },
    enabled: !!departmentId,
  });

  const { data: academicYears, isLoading: isLoadingAcademicYears } = useQuery<
    ApiListItem[]
  >({
    queryKey: ["api_academic_years_list"],
    queryFn: () => fetchData("/api/academic-years"),
  });

  const { data: documentTypes, isLoading: isLoadingDocumentTypes } = useQuery<
    ApiListItem[]
  >({
    queryKey: ["api_document_types_list"],
    queryFn: () => fetchData("/api/document-types"),
  });

  useEffect(() => {
    setDepartmentId("");
    setProgramId("");
  }, [entityId]);

  useEffect(() => {
    setProgramId("");
  }, [departmentId]);

  // Réinitialisation complète des filtres et URL
  const handleReset = () => {
    setEntityId("");
    setDepartmentId("");
    setProgramId("");
    setAcademicYearId("");
    setDocumentTypeId("");
    setWouterLocation("/documents"); // <-- Reset aussi l'URL ici
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams();
    if (entityId && entityId !== "all") params.append("entityId", entityId);
    if (departmentId && departmentId !== "all") params.append("departmentId", departmentId);
    if (programId && programId !== "all") params.append("programId", programId);
    if (academicYearId && academicYearId !== "all")
      params.append("academicYearId", academicYearId);
    if (documentTypeId && documentTypeId !== "all")
      params.append("documentTypeId", documentTypeId);

    // Simulation délai (adapter selon ton vrai cas)
    setTimeout(() => {
      setIsSearching(false);
      setWouterLocation(`/documents?${params.toString()}`);
    }, 800);
  };

  const isDepartmentSelectDisabled = !entityId || isLoadingDepartments;
  const isProgramSelectDisabled = !departmentId || isLoadingPrograms;

  return (
    <Card className="bg-gray-50 dark:bg-gray-800">
      <CardContent className="p-6">
        <form onSubmit={handleSearch}>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="entity">Entité</Label>
              <Select
                value={entityId}
                onValueChange={setEntityId}
                disabled={isLoadingEntities}
              >
                <SelectTrigger id="entity">
                  <SelectValue placeholder="Toutes les entités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entités</SelectItem>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">Département</Label>
              <Select
                value={departmentId}
                onValueChange={setDepartmentId}
                disabled={isDepartmentSelectDisabled}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departments?.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="program">Filière</Label>
              <Select
                value={programId}
                onValueChange={setProgramId}
                disabled={isProgramSelectDisabled}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Toutes les filières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les filières</SelectItem>
                  {programs?.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="academicYear">Année</Label>
              <Select
                value={academicYearId}
                onValueChange={setAcademicYearId}
                disabled={isLoadingAcademicYears}
              >
                <SelectTrigger id="academicYear">
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {academicYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="documentType">Type de document</Label>
              <Select
                value={documentTypeId}
                onValueChange={setDocumentTypeId}
                disabled={isLoadingDocumentTypes}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {documentTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Boutons Réinitialiser et Rechercher */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              disabled={isSearching}
            >
              Réinitialiser
            </Button>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recherche...
                </>
              ) : (
                "Rechercher"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
