import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { ScrollReveal } from "@/components/common/ScrollReveal";

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="font-heading font-semibold text-3xl md:text-4xl text-center mb-8">
              À propos de CULIB
            </h1>
          </ScrollReveal>

          <Card className="overflow-hidden mb-10">
            <ScrollReveal direction="up" delay={0.4}>
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="Étudiants du CUL" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-1/2">
                  <h2 className="font-heading font-medium text-xl mb-4">Notre mission</h2>
                  <p className="text-muted-foreground mb-4">
                    CULIB est une initiative visant à faciliter l'accès aux épreuves d'examens pour les étudiants du Centre Universitaire de Lokossa (CUL).
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Nous savons combien la préparation aux examens peut être stressante. C'est pourquoi nous avons créé cette bibliothèque numérique organisée selon les différentes entités, départements et filières du CUL.
                  </p>
                  <p className="text-muted-foreground">
                    Notre objectif est de vous aider à mieux vous préparer en ayant accès aux épreuves des années précédentes, tout en favorisant le partage des connaissances au sein de la communauté universitaire.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <ScrollReveal direction="up" delay={0.6}>
              <Card className="text-center p-5">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="font-medium text-lg mb-2">UNSTIM</h3>
                  <p className="text-muted-foreground text-sm">
                    Le CUL fait partie de l'Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.8}>
              <Card className="text-center p-5">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Communauté</h3>
                  <p className="text-muted-foreground text-sm">
                    CULIB est maintenu par une communauté d'étudiants passionnés par le partage des connaissances.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={1}>
              <Card className="text-center p-5">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Ressources</h3>
                  <p className="text-muted-foreground text-sm">
                    Notre bibliothèque s'enrichit continuellement grâce aux contributions des étudiants et des enseignants.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <h2 className="font-heading font-semibold text-2xl mb-4">
              Vous souhaitez contribuer ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Si vous disposez d'épreuves que vous souhaitez partager avec la communauté estudiantine, n'hésitez pas à contacter notre équipe.
            </p>
            <Link href="/equipe">
              <Button>
                Contacter l'équipe
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}