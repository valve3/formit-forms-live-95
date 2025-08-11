
import { useToast } from '@/hooks/use-toast';

export const copyEmbedCode = (form: { id: string; title: string }) => {
  const embedCode = `<iframe 
  src="${window.location.origin}/embed/${form.id}" 
  width="100%" 
  height="600" 
  frameborder="0"
  title="${form.title}">
</iframe>`;
  
  navigator.clipboard.writeText(embedCode);
  const { toast } = useToast();
  toast({
    title: 'Copied!',
    description: 'Embed code copied to clipboard',
  });
};

export const previewForm = (formId: string) => {
  if (!formId || formId === 'undefined' || formId === 'null') {
    const { toast } = useToast();
    toast({
      title: 'Error',
      description: 'Please save the form first before previewing',
      variant: 'destructive',
    });
    return;
  }
  window.open(`/embed/${formId}`, '_blank');
};

export const getStatusBadgeVariant = (status: string) => {
  const variants = {
    draft: 'secondary',
    published: 'default',
    archived: 'outline',
  } as const;

  return variants[status as keyof typeof variants];
};
