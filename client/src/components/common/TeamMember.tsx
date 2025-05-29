import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Mail, Twitter, Github } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMemberProps {
  name: string;
  title: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    email?: string;
    twitter?: string;
    github?: string;
  };
}

export function TeamMember({
  name,
  title,
  bio,
  image,
  social
}: TeamMemberProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-50 dark:bg-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img 
              src={image} 
              alt={`Photo de ${name}`} 
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h3 className="font-heading font-medium text-xl mb-1">{name}</h3>
              <p className="text-primary mb-3">{title}</p>
              <p className="text-muted-foreground text-sm mb-4">
                {bio}
              </p>
              <div className="flex gap-3">
                {social.linkedin && (
                  <a href={social.linkedin} className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={18} />
                  </a>
                )}
                {social.email && (
                  <a href={`mailto:${social.email}`} className="text-muted-foreground hover:text-primary">
                    <Mail size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}