// Dans DocumentsPage.tsx

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// Modifiez l'import de wouter pour inclure useSearch
import { useLocation, useSearch } from "wouter";
import { DocumentCard } from "@/components/common/DocumentCard";
import { SearchForm } from "@/components/common/SearchForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// ... (fetchData et IDocument restent les mêmes)
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

interface IDocument {
  id: number | string;
  title: string;
  entity?: { name: string };
  department?: { name: string };
  program?: { name: string };
  academicYear?: { name: string };
  documentType?: { name: string };
  description?: string;
  uploadDate: string;
  fileSize: number;
  filePath: string;
}

export default function DocumentsPage() {
  // `path` est le chemin (ex: /documents), `navigate` est la fonction pour naviguer
  const [_path, navigate] = useLocation();
  // `searchString` est la query string actuelle (ex: "?query=test&entityId=1")
  // Ce hook s'assure que le composant re-render lorsque la query string change.
  const searchString = useSearch();

  // L'état local pour les paramètres parsés
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  // Cet useEffect se déclenche maintenant lorsque `searchString` (de useSearch) change.
  useEffect(() => {
    console.log(
      "DocumentsPage: searchString from useSearch changed:",
      searchString
    );
    // `searchString` inclut le '?', URLSearchParams s'en accommode.
    const currentSearchParams = new URLSearchParams(searchString);
    setSearchParams(currentSearchParams);
  }, [searchString]); // Dépendre de searchString

  const {
    data: documents,
    isLoading,
    error,
    isFetching,
  } = useQuery<IDocument[], Error>({
    // La queryKey dépend maintenant de l'état `searchParams`, qui est mis à jour par l'useEffect ci-dessus
    queryKey: [
      "api_documents_search",
      searchParams ? Object.fromEntries(searchParams.entries()) : {},
    ],
    queryFn: async ({ queryKey }) => {
      const [_key, paramsObject] = queryKey;
      const queryString = new URLSearchParams(
        paramsObject as Record<string, string>
      ).toString();

      let url = "/api/documents";
      if (queryString) {
        url += `?${queryString}`;
      }
      console.log("DocumentsPage: Fetching documents from:", url);
      return fetchData(url);
    },
    // `enabled` est important pour ne pas lancer la requête tant que searchParams n'est pas initialisé
    enabled: searchParams !== null,
    keepPreviousData: true,
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (isNaN(bytes) || bytes < 0) return "Taille invalide";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i >= sizes.length || i < 0) return `${bytes} B`;
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
  };

  // useMemo est correct ici, il dépend de `searchParams` (l'état)
  const searchCriteriaDisplay = useMemo(() => {
    if (!searchParams || Array.from(searchParams.keys()).length === 0)
      return null;

    const criteria: string[] = [];
    const query = searchParams.get("query");
    if (query) criteria.push(`Recherche: "${query}"`);
    if (searchParams.get("entityId"))
      criteria.push(`Entité: ${searchParams.get("entityId")}`); // Pourrait être amélioré pour afficher le nom
    if (searchParams.get("departmentId"))
      criteria.push(`Département: ${searchParams.get("departmentId")}`);
    if (searchParams.get("programId"))
      criteria.push(`Filière: ${searchParams.get("programId")}`);
    if (searchParams.get("academicYearId"))
      criteria.push(`Année: ${searchParams.get("academicYearId")}`);
    if (searchParams.get("documentTypeId"))
      criteria.push(`Type: ${searchParams.get("documentTypeId")}`);

    return criteria.length > 0 ? `Critères: ${criteria.join(" • ")}` : null;
  }, [searchParams]);

  const hasActiveSearch =
    searchParams && Array.from(searchParams.keys()).length > 0;

   const apiRequest = async (method: string, url: string, data?: any) => {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleDownload = async (document: IDocument) => {
    try {
      await apiRequest("POST", `/api/stats/track-download/${document.id}`);
      window.open(document.filePath, '_blank');
    } catch (error) {
      console.error("Erreur lors du suivi du téléchargement:", error);
    }
  };


  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/entites")} // Ou une autre page pertinente
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="font-heading font-semibold text-2xl md:text-3xl">
            Epreuves et Documents
          </h1>
          {searchCriteriaDisplay && (
            <span className="text-sm text-muted-foreground">
              {searchCriteriaDisplay}
            </span>
          )}
        </div>

        <div className="mb-8">
          {/* SearchForm n'a pas besoin de modifications pour ce problème spécifique */}
          <SearchForm />
        </div>

        <div className="mt-8">
          {(isLoading && !documents) || (isFetching && !documents && !error) ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-700 rounded-xl h-48 animate-pulse"
                  ></div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">
                Une erreur est survenue: {error.message}
              </p>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id.toString()}
                  title={doc.title}
                  entity={doc.entity?.name || ""}
                  department={doc.department?.name || ""}
                  description={doc.description || ""}
                  uploadDate={formatDate(doc.uploadDate)}
                  fileSize={formatFileSize(doc.fileSize)}
                  filePath={doc.filePath}
                  // Vous pouvez ajouter program, academicYear, documentType ici si nécessaire
                  // programName={doc.program?.name || ""}
                  // academicYearName={doc.academicYear?.name || ""}
                  // documentTypeName={doc.documentType?.name || ""}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">
                {hasActiveSearch
                  ? "Aucun document trouvé pour ces critères."
                  : "Aucun document à afficher. Essayez une recherche ou des filtres."}
              </p>
              {hasActiveSearch && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Modifiez vos critères ou essayez une recherche plus large.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}