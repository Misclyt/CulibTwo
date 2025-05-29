
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";

interface StatsData {
  totalDocuments: number;
  totalDownloads: number;
  documentsPerEntity: Array<{
    entityName: string;
    count: number;
  }>;
  topDownloaded: Array<{
    title: string;
    downloads: number;
  }>;
}

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des statistiques");
      }
      return response.json();
    },
  });

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la génération du rapport: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Succès",
        description: "Le rapport a été généré et téléchargé avec succès",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rapports et Statistiques</h1>
        <Button onClick={generateReport} disabled={isGenerating}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {isGenerating ? "Génération..." : "Générer le rapport"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Documents par entité</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats?.documentsPerEntity.map((item) => (
                <li key={item.entityName} className="flex justify-between">
                  <span>{item.entityName}</span>
                  <span className="font-semibold">{item.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents les plus téléchargés</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats?.topDownloaded.map((doc) => (
                <li key={doc.title} className="flex justify-between">
                  <span className="truncate flex-1 mr-4">{doc.title}</span>
                  <span className="font-semibold">
                    {doc.downloads} <Download className="inline h-4 w-4 ml-1" />
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total des documents</span>
                <span className="font-semibold">{stats?.totalDocuments}</span>
              </div>
              <div className="flex justify-between">
                <span>Total des téléchargements</span>
                <span className="font-semibold">{stats?.totalDownloads}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
