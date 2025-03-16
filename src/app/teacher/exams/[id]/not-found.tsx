import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function ExamNotFound() {
  return (
    <div className="container py-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Exam Not Found</h2>
        <p className="text-muted-foreground text-center max-w-[500px]">
          The exam you are looking for does not exist or you do not have permission to view it.
        </p>
        <Button asChild>
          <Link href="/teacher/dashboard">
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
} 