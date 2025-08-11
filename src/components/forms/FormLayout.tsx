
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Layout, Plus, Trash2, Columns2, Columns3, Columns4, Rows2, Rows3, Rows4, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageSettings {
  id: string;
  title: string;
  columns: number;
  columnGap: number;
  rowGap: number;
}

interface LayoutSettings {
  type: 'single' | 'grid';
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  pages: PageSettings[];
  currentPage: number;
}

interface FormLayoutProps {
  layoutSettings?: LayoutSettings;
  onUpdate: (settings: LayoutSettings) => void;
}

const defaultLayout: LayoutSettings = {
  type: 'single',
  columns: 1,
  rows: 1,
  columnGap: 16,
  rowGap: 16,
  breakpoints: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  pages: [
    {
      id: 'page_1',
      title: 'Page 1',
      columns: 1,
      columnGap: 16,
      rowGap: 16,
    }
  ],
  currentPage: 0,
};

const layoutPresets = [
  { icon: Layout, label: 'Single Column', value: { type: 'single' as const, columns: 1, rows: 1 } },
  { icon: Columns2, label: '2 Columns', value: { type: 'grid' as const, columns: 2, rows: 1 } },
  { icon: Columns3, label: '3 Columns', value: { type: 'grid' as const, columns: 3, rows: 1 } },
  { icon: Columns4, label: '4 Columns', value: { type: 'grid' as const, columns: 4, rows: 1 } },
  { icon: Rows2, label: '2 Rows', value: { type: 'grid' as const, columns: 1, rows: 2 } },
  { icon: Rows3, label: '3 Rows', value: { type: 'grid' as const, columns: 1, rows: 3 } },
  { icon: Rows4, label: '4 Rows', value: { type: 'grid' as const, columns: 1, rows: 4 } },
];

export const FormLayout = ({ layoutSettings, onUpdate }: FormLayoutProps) => {
  const [layout, setLayout] = useState<LayoutSettings>({ ...defaultLayout, ...layoutSettings });

  const updateLayout = (updates: Partial<LayoutSettings>) => {
    const newLayout = { ...layout, ...updates };
    setLayout(newLayout);
    onUpdate(newLayout);
  };

  const applyPreset = (preset: typeof layoutPresets[0]) => {
    updateLayout(preset.value);
  };

  const addPage = () => {
    const newPage: PageSettings = {
      id: `page_${Date.now()}`,
      title: `Page ${layout.pages.length + 1}`,
      columns: 1,
      columnGap: 16,
      rowGap: 16,
    };
    
    updateLayout({
      pages: [...layout.pages, newPage]
    });
  };

  const removePage = (pageIndex: number) => {
    if (layout.pages.length <= 1) return;
    
    const newPages = layout.pages.filter((_, index) => index !== pageIndex);
    const newCurrentPage = layout.currentPage >= newPages.length ? newPages.length - 1 : layout.currentPage;
    
    updateLayout({
      pages: newPages,
      currentPage: newCurrentPage
    });
  };

  const updatePage = (pageIndex: number, updates: Partial<PageSettings>) => {
    const newPages = layout.pages.map((page, index) => 
      index === pageIndex ? { ...page, ...updates } : page
    );
    
    updateLayout({ pages: newPages });
  };

  const setCurrentPage = (pageIndex: number) => {
    updateLayout({ currentPage: pageIndex });
  };

  const currentPageSettings = layout.pages[layout.currentPage] || layout.pages[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Layout className="h-5 w-5" />
          <CardTitle>Form Layout</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Pages</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={addPage}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Page</span>
            </Button>
          </div>
          
          {/* Page Navigation */}
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, layout.currentPage - 1))}
              disabled={layout.currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select 
              value={layout.currentPage.toString()} 
              onValueChange={(value) => setCurrentPage(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {layout.pages.map((page, index) => (
                  <SelectItem key={page.id} value={index.toString()}>
                    {page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(layout.pages.length - 1, layout.currentPage + 1))}
              disabled={layout.currentPage === layout.pages.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {layout.pages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePage(layout.currentPage)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Current Page Settings */}
          {currentPageSettings && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <Label>Page Title</Label>
                <Input
                  value={currentPageSettings.title}
                  onChange={(e) => updatePage(layout.currentPage, { title: e.target.value })}
                  placeholder="Enter page title"
                />
              </div>
              
              <div>
                <Label>Columns: {currentPageSettings.columns}</Label>
                <Slider
                  value={[currentPageSettings.columns]}
                  onValueChange={([value]) => updatePage(layout.currentPage, { columns: value })}
                  max={6}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Column Gap: {currentPageSettings.columnGap}px</Label>
                  <Slider
                    value={[currentPageSettings.columnGap]}
                    onValueChange={([value]) => updatePage(layout.currentPage, { columnGap: value })}
                    max={40}
                    min={0}
                    step={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Row Gap: {currentPageSettings.rowGap}px</Label>
                  <Slider
                    value={[currentPageSettings.rowGap]}
                    onValueChange={([value]) => updatePage(layout.currentPage, { rowGap: value })}
                    max={40}
                    min={0}
                    step={4}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Layout Presets */}
        <div>
          <h4 className="text-sm font-medium mb-4">Quick Layouts</h4>
          <div className="grid grid-cols-2 gap-2">
            {layoutPresets.map((preset, index) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center space-x-2 h-16"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{preset.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Custom Layout Settings */}
        <div>
          <h4 className="text-sm font-medium mb-4">Custom Layout</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Layout Type</Label>
              <Select value={layout.type} onValueChange={(value: 'single' | 'grid') => updateLayout({ type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Column</SelectItem>
                  <SelectItem value="grid">Grid Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {layout.type === 'grid' && (
              <>
                <div>
                  <Label>Columns: {layout.columns}</Label>
                  <Slider
                    value={[layout.columns]}
                    onValueChange={([value]) => updateLayout({ columns: value })}
                    max={6}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Spacing */}
        <div>
          <h4 className="text-sm font-medium mb-4">Spacing</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Column Gap: {layout.columnGap}px</Label>
              <Slider
                value={[layout.columnGap]}
                onValueChange={([value]) => updateLayout({ columnGap: value })}
                max={40}
                min={0}
                step={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Row Gap: {layout.rowGap}px</Label>
              <Slider
                value={[layout.rowGap]}
                onValueChange={([value]) => updateLayout({ rowGap: value })}
                max={40}
                min={0}
                step={4}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Responsive Breakpoints */}
        <div>
          <h4 className="text-sm font-medium mb-4">Responsive Breakpoints</h4>
          <div className="space-y-4">
            <div>
              <Label>Mobile Columns: {layout.breakpoints.mobile}</Label>
              <Slider
                value={[layout.breakpoints.mobile]}
                onValueChange={([value]) => updateLayout({ 
                  breakpoints: { ...layout.breakpoints, mobile: value }
                })}
                max={layout.columns}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Tablet Columns: {layout.breakpoints.tablet}</Label>
              <Slider
                value={[layout.breakpoints.tablet]}
                onValueChange={([value]) => updateLayout({ 
                  breakpoints: { ...layout.breakpoints, tablet: value }
                })}
                max={layout.columns}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Desktop Columns: {layout.breakpoints.desktop}</Label>
              <Slider
                value={[layout.breakpoints.desktop]}
                onValueChange={([value]) => updateLayout({ 
                  breakpoints: { ...layout.breakpoints, desktop: value }
                })}
                max={layout.columns}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
