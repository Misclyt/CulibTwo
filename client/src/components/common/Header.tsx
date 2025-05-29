import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary text-3xl">
              <BookOpen size={32} />
            </span>
            <span className="font-heading font-bold text-xl md:text-2xl">CULIB</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" active={location === "/"}>
              Accueil
            </NavLink>
            <NavLink href="/entites" active={location.startsWith("/entites")}>
              Entités
            </NavLink>
            <NavLink href="/a-propos" active={location === "/a-propos"}>
              À propos
            </NavLink>
            <NavLink href="/equipe" active={location === "/equipe"}>
              Équipe
            </NavLink>
            {user ? (
              <Link href="/admin">
                <Button>Admin</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Admin</Button>
              </Link>
            )}
          </nav>

          {/* Dark Mode Toggle & Mobile Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 mt-6">
                  <MobileNavLink href="/" active={location === "/"} onClick={() => setIsOpen(false)}>
                    Accueil
                  </MobileNavLink>
                  <MobileNavLink
                    href="/entites"
                    active={location.startsWith("/entites")}
                    onClick={() => setIsOpen(false)}
                  >
                    Entités
                  </MobileNavLink>
                  <MobileNavLink
                    href="/a-propos"
                    active={location === "/a-propos"}
                    onClick={() => setIsOpen(false)}
                  >
                    À propos
                  </MobileNavLink>
                  <MobileNavLink
                    href="/equipe"
                    active={location === "/equipe"}
                    onClick={() => setIsOpen(false)}
                  >
                    Équipe
                  </MobileNavLink>
                  {user ? (
                    <Link href="/admin">
                      <Button className="w-full" onClick={() => setIsOpen(false)}>
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full" onClick={() => setIsOpen(false)}>
                        Admin
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={`font-medium transition-colors ${
        active
          ? "text-primary"
          : "text-foreground/80 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <Link 
      href={href}
      className={`font-medium text-lg transition-colors ${
        active
          ? "text-primary"
          : "text-foreground/80 hover:text-primary"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
