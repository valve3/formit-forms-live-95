
import { Button } from '@/components/ui/button';

interface ThemeCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  savedThemesCount: number;
}

export const ThemeCategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  savedThemesCount 
}: ThemeCategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategorySelect(category)}
        >
          {category}
          {category === 'Saved' && savedThemesCount > 0 && (
            <span className="ml-1 text-xs">({savedThemesCount})</span>
          )}
        </Button>
      ))}
    </div>
  );
};
