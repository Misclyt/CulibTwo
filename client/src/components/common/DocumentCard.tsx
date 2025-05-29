import { Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface DocumentCardProps {
  id: number;
  title: string;
  entity: string;
  department: string;
  description: string;
  uploadDate: string;
  fileSize: string;
  filePath: string;
}

export function DocumentCard({
  id,
  title,
  entity,
  department,
  description,
  uploadDate,
  fileSize,
  filePath
}: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-50 dark:bg-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {entity}
              </Badge>
              <Badge variant="outline" className="ml-2 bg-secondary/10 text-secondary border-secondary/20">
                {department}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">Ajouté le {uploadDate}</span>
          </div>

          <h3 className="font-medium text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{description}</p>

          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center">
              <FileText className="text-red-500 mr-2" size={16} />
              <span className="text-sm text-muted-foreground">{fileSize}</span>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2" size={16} />
                    Aperçu
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                      {description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="w-full h-[70vh] mt-4 border rounded overflow-hidden">
                    <iframe 
                      src={filePath} 
                      className="w-full h-full"
                      title={title}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <a href={filePath} target="_blank" rel="noopener noreferrer" download>
                      <Button>
                        <Download className="mr-2" size={16} />
                        Télécharger
                      </Button>
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
              <a href={filePath} target="_blank" rel="noopener noreferrer" download>
                <Button size="sm">
                  <Download className="mr-2" size={16} />
                  Télécharger
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}