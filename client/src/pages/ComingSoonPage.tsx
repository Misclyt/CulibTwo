import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Construction } from "lucide-react";

export default function ComingSoonPage() {
  const [location] = useLocation();
  const path = decodeURIComponent(location);
  const entityMatch = path.match(/\/coming-soon\/entity\/(\d+)/);
  const entityId = entityMatch ? entityMatch[1] : null;

  return (
    <div className="py-12 min-h-[80vh] bg-background">
      <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Construction className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="font-heading font-bold text-3xl">Contenu à venir</h1>
          
          <p className="text-muted-foreground text-lg">
            Cette section est en cours de développement et sera bientôt disponible.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Disponible prochainement</span>
          </div>
          
          <div className="pt-4">
            <Link href={entityId ? "/entites" : "/"}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retourner {entityId ? "aux entités" : "à l'accueil"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}