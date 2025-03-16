"use client";

import { Assignment, AssignmentSubmission } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AssignmentWithDetails = Assignment & {
  subject: {
    name: string;
    class: {
      grade: string;
      section: string;
    };
  };
  submissions: (AssignmentSubmission & {
    student: {
      user: {
        firstName: string | null;
        lastName: string | null;
      };
    };
  })[];
};

interface AssignmentListProps {
  assignments: AssignmentWithDetails[];
  subjectId?: string;
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  const getSubmissionStats = (submissions: AssignmentWithDetails["submissions"]) => {
    const total = submissions.length;
    const submitted = submissions.filter((s) => s.status === "SUBMITTED").length;
    const graded = submissions.filter((s) => s.status === "GRADED").length;
    const pending = submissions.filter((s) => s.status === "PENDING").length;
    
    return { total, submitted, graded, pending };
  };

  const getStatusColor = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) {
      return "text-red-500";
    }
    if (now.getTime() + 24 * 60 * 60 * 1000 > due.getTime()) {
      return "text-yellow-500";
    }
    return "text-green-500";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => {
        const stats = getSubmissionStats(assignment.submissions);
        const statusColor = getStatusColor(new Date(assignment.dueDate));
        
        return (
          <Card key={assignment.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg line-clamp-1" title={assignment.title}>
                  {assignment.title}
                </CardTitle>
                <Badge variant="outline">
                  {assignment.subject.name} ({assignment.subject.class.grade}-
                  {assignment.subject.class.section})
                </Badge>
              </div>
              <CardDescription className={statusColor}>
                Due: {format(new Date(assignment.dueDate), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2" title={assignment.description}>
                    {assignment.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Pending: {stats.pending}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Not submitted yet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>Submitted: {stats.submitted}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Awaiting grading</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Graded: {stats.graded}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Graded submissions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>Total: {stats.total}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total students</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Link
                href={`/assignments/${assignment.id}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 