import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface Program {
  id: number;
  name: string;
  fullName?: string;
  isTroncCommun?: boolean;
}

interface Department {
  id: number;
  name: string;
  fullName: string;
  programs: Program[];
}

interface Entity {
  id: number;
  name: string;
  fullName: string;
  departments: Department[];
}

interface EntityAccordionProps {
  entity: Entity;
}

export function EntityAccordion({ entity }: EntityAccordionProps) {
  const [openDepartments, setOpenDepartments] = useState<string[]>([]);

  const toggleDepartment = (deptId: string) => {
    setOpenDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId]
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-heading font-semibold text-xl mb-3">{entity.name}</h3>
        <p className="text-muted-foreground mb-5">{entity.fullName}</p>
        
        <div className="space-y-3">
          {entity.departments.map((dept) => (
            <div key={dept.id} className="border rounded-lg">
              <button
                className="w-full p-3 text-left flex justify-between items-center hover:bg-accent/50 transition-colors rounded-lg"
                onClick={() => toggleDepartment(dept.id.toString())}
              >
                <span className="font-medium">{dept.name} ({dept.fullName})</span>
                {openDepartments.includes(dept.id.toString()) ? (
                  <ChevronUp className="text-muted-foreground" size={18} />
                ) : (
                  <ChevronDown className="text-muted-foreground" size={18} />
                )}
              </button>
              {openDepartments.includes(dept.id.toString()) && (
                <div className="p-3 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    {dept.programs.map((program) => (
                      <Link 
                        key={program.id} 
                        href={`/documents?entityId=${entity.id}&departmentId=${dept.id}&programId=${program.id}`}
                      >
                        <a className="text-primary hover:underline">
                          {program.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
