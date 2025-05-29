import { Link } from "wouter";
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary text-3xl">
                <BookOpen size={32} />
              </span>
              <span className="font-heading font-bold text-xl text-white">CULIB</span>
            </div>
            <p className="text-gray-400 mb-4">
              Bibliothèque numérique d'épreuves du Centre Universitaire de Lokossa, pour une meilleure préparation académique.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61576501086186" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/entites" className="text-gray-400 hover:text-white transition-colors">
                  Entités
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-gray-400 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/equipe" className="text-gray-400 hover:text-white transition-colors">
                  Équipe
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Espace Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 flex-shrink-0" size={18} />
                <span>Centre Universitaire de Lokossa, Lokossa, Bénin</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="flex-shrink-0" size={18} />
                <a href="mailto:culiblokossa@gmail.com" className="hover:text-white transition-colors">culiblokossa@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="flex-shrink-0" size={18} />
                <a href="tel:+2290146421195" className="hover:text-white transition-colors">+229 01 46 42 11 95</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} CULIB - Marius Zounnon. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
