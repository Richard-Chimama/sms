'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { QuestionType } from '@prisma/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const questionFormSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1, 'Answer is required'),
  marks: z.coerce.number().min(1, 'Marks must be at least 1'),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface AddQuestionProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddQuestion({ examId, onClose, onSuccess }: AddQuestionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: '',
      type: QuestionType.SHORT_ANSWER,
      options: [],
      answer: '',
      marks: 1,
    },
  });

  const questionType = form.watch('type');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        options: questionType === QuestionType.MULTIPLE_CHOICE ? options : undefined,
      };

      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to add question');

      toast.success('Question added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter your question" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={QuestionType.SHORT_ANSWER}>Short Answer</SelectItem>
                      <SelectItem value={QuestionType.LONG_ANSWER}>Long Answer</SelectItem>
                      <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === QuestionType.MULTIPLE_CHOICE && (
              <div className="space-y-4">
                <FormLabel>Options</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Enter an option"
                  />
                  <Button type="button" onClick={addOption}>
                    Add
                  </Button>
                </div>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={option} readOnly />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    {questionType === QuestionType.LONG_ANSWER ? (
                      <Textarea {...field} placeholder="Enter the answer" />
                    ) : (
                      <Input {...field} placeholder="Enter the answer" />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Question'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 