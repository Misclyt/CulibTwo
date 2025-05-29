import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

import HomePage from "@/pages/HomePage";
import EntitiesPage from "@/pages/EntitiesPage";
import AboutPage from "@/pages/AboutPage";
import TeamPage from "@/pages/TeamPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import NotFound from "@/pages/not-found";
// Assuming ReportsPage is in "@/pages/ReportsPage"
import ReportsPage from "@/pages/ReportsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/entites" component={EntitiesPage} />
      <Route path="/entites/entity/:id" component={EntitiesPage} />
      <Route path="/entites/department/:id" component={EntitiesPage} />
      <Route path="/entites/program/:id" component={EntitiesPage} />
      <Route path="/entites/program/:id/:year" component={EntitiesPage} />
      <Route path="/coming-soon" component={ComingSoonPage} />
      <Route path="/coming-soon/entity/:id" component={ComingSoonPage} />
      <Route path="/a-propos" component={AboutPage} />
      <Route path="/equipe" component={TeamPage} />
      <Route path="/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/reports" component={ReportsPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const PageTransition = ({ children }: { children: React.ReactNode }) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ 
          duration: 0.4,
          ease: [0.43, 0.13, 0.23, 0.96]
        }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
          <AnimatePresence mode="wait">
            <PageTransition>
              <Router />
            </PageTransition>
          </AnimatePresence>
        </main>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;