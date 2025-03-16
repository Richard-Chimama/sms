'use client';

import { useState } from 'react';
import { Class, Student, FeePayment, User } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus } from 'lucide-react';

type StudentWithUser = Student & {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  feePayments: FeePayment[];
};

type ClassWithStudents = Class & {
  students: StudentWithUser[];
};

interface FeesManagementProps {
  classes: ClassWithStudents[];
}

export default function FeesManagement({ classes }: FeesManagementProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const handleCreateFee = async () => {
    if (!selectedClass || !selectedStudent || !amount || !description || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          amount: parseFloat(amount),
          description,
          dueDate: dueDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create fee');
      }

      toast.success('Fee created successfully');
      setIsAddingFee(false);
      setAmount('');
      setDescription('');
      setDueDate(undefined);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error creating fee:', error);
      toast.error('Failed to create fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (feeId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/fees/${feeId}/pay`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      toast.success('Payment recorded successfully');
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((class_) => (
              <SelectItem key={class_.id} value={class_.id}>
                Grade {class_.grade}-{class_.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddingFee(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fee
        </Button>
      </div>

      {selectedClassData && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedClassData.students.flatMap((student) =>
              student.feePayments.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    {student.user.firstName} {student.user.lastName}
                  </TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell>₹{fee.amount}</TableCell>
                  <TableCell>{format(new Date(fee.dueDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        fee.status === 'PAID'
                          ? 'default'
                          : fee.status === 'OVERDUE'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {fee.status !== 'PAID' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecordPayment(fee.id)}
                        disabled={isSubmitting}
                      >
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAddingFee} onOpenChange={setIsAddingFee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
            <DialogDescription>
              Create a new fee for a student. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {selectedClassData?.students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.user.firstName} {student.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter fee description"
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingFee(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFee} disabled={isSubmitting}>
              Create Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

