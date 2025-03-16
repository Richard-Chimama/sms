"use client";

import { useState } from "react";
import { Assignment, AssignmentSubmission } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import AssignmentList from "./AssignmentList";
import AddAssignment from "./AddAssignment";

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

interface AssignmentsViewProps {
  assignments: AssignmentWithDetails[];
  teacherId: string;
}

export default function AssignmentsView({
  assignments,
  teacherId,
}: AssignmentsViewProps) {
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const pendingAssignments = assignments.filter(
    (assignment) =>
      assignment.submissions.some(
        (submission) => submission.status === "SUBMITTED"
      )
  );

  const gradedAssignments = assignments.filter(
    (assignment) =>
      assignment.submissions.every(
        (submission) => submission.status === "GRADED" || !submission
      )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white font-bold">Assignments</h1>
        <Button onClick={() => setIsAddingAssignment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AssignmentList assignments={assignments} />
        </TabsContent>

        <TabsContent value="pending">
          <AssignmentList assignments={pendingAssignments} />
        </TabsContent>

        <TabsContent value="graded">
          <AssignmentList assignments={gradedAssignments} />
        </TabsContent>
      </Tabs>

      {isAddingAssignment && (
        <AddAssignment
          teacherId={teacherId}
          onClose={() => setIsAddingAssignment(false)}
          onSuccess={() => {
            setIsAddingAssignment(false);
            // Refresh assignments
          }}
        />
      )}
    </div>
  );
} 