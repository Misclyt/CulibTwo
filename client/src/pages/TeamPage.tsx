import { TeamMember } from "@/components/common/TeamMember";
import { TEAM_MEMBERS } from "@/lib/constants";
import { ScrollReveal } from "@/components/common/ScrollReveal";

export default function TeamPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" delay={0.2}>
          <h1 className="font-heading font-semibold text-2xl md:text-3xl text-center mb-8">
            Notre équipe
          </h1>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM_MEMBERS.map((member, index) => (
            <ScrollReveal key={member.id} direction="up" delay={0.4 + index * 0.2}>
              <TeamMember
                name={member.name}
                title={member.title}
                bio={member.bio}
                image={member.image}
                social={member.social}
              />
            </ScrollReveal>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h2 className="font-heading font-medium text-xl mb-4">
            Rejoignez notre équipe
          </h2>
          <p className="text-muted-foreground mb-6">
            Vous êtes étudiant ou enseignant au CUL et vous souhaitez contribuer à ce projet ?
            Nous recherchons des volontaires pour nous aider à collecter et organiser les épreuves
            de différentes filières.
          </p>
          <a href="mailto:culiblokossa@gmail.com" className="text-primary hover:underline">
            Contactez-nous au culiblokossa@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}