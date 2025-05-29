import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/common/SearchForm";
import { DocumentCard } from "@/components/common/DocumentCard";
import { StatisticCard } from "@/components/common/StatisticCard";
import { STATS } from "@/lib/constants";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/common/ScrollReveal";

export default function HomePage() {
  const { data: recentDocuments, isLoading } = useQuery({
    queryKey: ["/api/documents/recent"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="h-[500px] lg:h-[600px] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-[#4CAF50]/90 z-10"></div>
          <div className="absolute inset-0 bg-pattern opacity-10 z-5"></div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center">
            <motion.div 
              className="max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.h1 
                className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Bibliothèque Numérique du Centre Universitaire de Lokossa
              </motion.h1>
              <p className="text-white text-lg md:text-xl mb-8">
                Accédez à une collection complète d'épreuves d'examens des années précédentes pour mieux préparer vos études et réussir brillamment vos examens au CUL.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/entites">
                  <Button size="lg" className="w-full sm:w-auto font-medium">
                    Parcourir par entité
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button size="lg" variant="outline" className="bg-white/90 text-primary hover:bg-white w-full sm:w-auto font-medium">
                    Voir toutes les épreuves
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* About CUL Section */}
      <ScrollReveal direction="up" delay={0.2}>
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">
                  Le Centre Universitaire de Lokossa
                </h2>
                <p className="text-muted-foreground mb-4">
                  Le Centre Universitaire de Lokossa (CUL) est un des quatre centres d'enseignement supérieur de l'UNSTIM (Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques).
                </p>
                <p className="text-muted-foreground mb-6">
                  Le CUL est composé de deux principales entités : l'École Normale Supérieure d'Enseignement Technique (ENSET) et l'Institut Supérieur des Sciences et Technologies Industrielles (INSTI), chacune proposant des filières de formation adaptées aux besoins du marché de l'emploi et au développement du pays.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Formation de qualité assurée par des enseignants qualifiés</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Infrastructures modernes et ressources pédagogiques adaptées</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Partenariats avec des entreprises et universités internationales</span>
                  </li>
                </ul>
                <Link href="/a-propos">
                  <Button variant="outline">En savoir plus sur le CULIB</Button>
                </Link>
              </div>
              <div className="flex justify-center order-first md:order-last">
                <div className="relative rounded-2xl overflow-hidden border border-border w-full max-w-md aspect-square shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10"></div>
                  <div className="flex items-center justify-center h-full text-8xl font-bold text-primary/30">
                    CUL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Search Section */}
      <ScrollReveal direction="up" delay={0.4}>
        <section id="search" className="py-10 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading font-semibold text-2xl md:text-3xl text-center mb-8">
                Rechercher des épreuves
              </h2>
              <SearchForm />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Recent Documents Section */}
      <ScrollReveal direction="up" delay={0.6}>
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-semibold text-2xl md:text-3xl text-center mb-8">
              Épreuves récemment ajoutées
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-xl h-64 animate-pulse"></div>
                ))
              ) : recentDocuments && recentDocuments.length > 0 ? (
                recentDocuments.map((doc: any) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    entity={doc.entity?.name || ""}
                    department={doc.department?.name || ""}
                    description={doc.description || ""}
                    uploadDate={formatDate(doc.uploadDate)}
                    fileSize={formatFileSize(doc.fileSize)}
                    filePath={doc.filePath}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">Aucun document récent n'a été trouvé.</p>
                </div>
              )}
            </div>
            <div className="text-center mt-8">
              <Link href="/documents">
                <Button variant="link" className="text-primary dark:text-primary-foreground font-medium">
                  Voir toutes les épreuves
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Statistics Section */}
      <ScrollReveal direction="up" delay={0.8}>
        <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((stat) => (
                <StatisticCard key={stat.id} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Call to Action */}
      <ScrollReveal direction="up" delay={1}>
        <section className="py-14 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading font-semibold text-2xl md:text-3xl mb-4">
                Prêt à préparer vos examens efficacement ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Accédez à notre vaste collection d'épreuves et améliorez vos chances de réussite. Commencez dès maintenant !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/entites">
                  <Button size="lg" className="w-full sm:w-auto">
                    Découvrir les entités
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Parcourir les épreuves
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}