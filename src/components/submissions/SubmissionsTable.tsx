
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SubmissionsTableProps {
  submissions: any[];
  theme: any;
}

export const SubmissionsTable = ({ submissions, theme }: SubmissionsTableProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  const deleteSubmission = async (submissionId: string) => {
    setDeletingId(submissionId);
    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Submission deleted successfully',
      });

      // Refresh the page to update the submissions list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium mb-2" style={{ color: theme.textColor }}>No submissions yet</h3>
          <p style={{ color: theme.textColor, opacity: 0.7 }}>
            Submissions will appear here once users start filling out your forms
          </p>
        </CardContent>
      </Card>
    );
  }

  // Define preferred field order
  const preferredOrder = ['First Name', 'Last Name', 'Email', 'Anything we need to know'];
  
  // Get all unique field names from submissions
  const allFieldNames = Array.from(
    new Set(
      submissions.flatMap(submission => 
        Object.keys(submission.submission_data)
      )
    )
  );

  // Sort fields according to preferred order
  const sortedFieldNames = [
    ...preferredOrder.filter(field => allFieldNames.includes(field)),
    ...allFieldNames.filter(field => !preferredOrder.includes(field))
  ];

  return (
    <Card style={{ backgroundColor: theme.backgroundColor }}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: theme.primaryColor + '20' }}>
                <TableHead style={{ color: theme.textColor }}>Form</TableHead>
                <TableHead style={{ color: theme.textColor }}>Submitted</TableHead>
                {sortedFieldNames.map(fieldName => (
                  <TableHead key={fieldName} style={{ color: theme.textColor }}>
                    {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </TableHead>
                ))}
                <TableHead style={{ color: theme.textColor }}>IP Address</TableHead>
                {isAdmin && <TableHead style={{ color: theme.textColor }}>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} style={{ borderColor: theme.primaryColor + '10' }}>
                  <TableCell style={{ color: theme.textColor }}>
                    {submission.forms.title}
                  </TableCell>
                  <TableCell style={{ color: theme.textColor }}>
                    {new Date(submission.submitted_at).toLocaleString()}
                  </TableCell>
                  {sortedFieldNames.map(fieldName => (
                    <TableCell key={fieldName} style={{ color: theme.textColor }}>
                      {submission.submission_data[fieldName] ? (
                        Array.isArray(submission.submission_data[fieldName]) 
                          ? submission.submission_data[fieldName].join(', ')
                          : String(submission.submission_data[fieldName])
                      ) : '-'}
                    </TableCell>
                  ))}
                  <TableCell>
                    {submission.ip_address && (
                      <Badge variant="outline" style={{ borderColor: theme.primaryColor }}>
                        {submission.ip_address}
                      </Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingId === submission.id}
                          >
                            {deletingId === submission.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this submission? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSubmission(submission.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
