
import { Button } from '@/components/ui/button';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigationProps {
  layoutSettings: any;
  currentPage: number;
  currentPageSettings: any;
  setCurrentPage: (pageIndex: number) => void;
}

export const PageNavigation = ({
  layoutSettings,
  currentPage,
  currentPageSettings,
  setCurrentPage,
}: PageNavigationProps) => {
  if (!layoutSettings.pages || layoutSettings.pages.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4" />
        <span className="text-sm font-medium">Page Navigation</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm px-3 py-1 bg-white rounded border">
          {currentPageSettings.title} ({currentPage + 1}/{layoutSettings.pages.length})
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(layoutSettings.pages.length - 1, currentPage + 1))}
          disabled={currentPage === layoutSettings.pages.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
