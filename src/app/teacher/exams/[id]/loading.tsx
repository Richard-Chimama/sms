import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExamLoading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <Skeleton className="h-4 w-[100px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 