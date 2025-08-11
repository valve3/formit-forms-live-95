import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Download, Table2, Grid3X3, Filter, Calendar, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SubmissionsTable } from './SubmissionsTable';
import { SubmissionsChart } from './SubmissionsChart';
import { getFormFields, transformSubmissionData } from '@/utils/submissionUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Submission {
  id: string;
  form_id: string;
  submission_data: any;
  submitted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  forms: {
    title: string;
  };
}

interface FormWithTheme {
  id: string;
  title: string;
  theme_settings?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
  };
}

export const SubmissionsList = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<FormWithTheme[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'charts'>('table');
  const [loading, setLoading] = useState(true);
  const [transformedSubmissions, setTransformedSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [datePreset, setDatePreset] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Get theme colors from selected form or use default
  const currentTheme = forms.find(f => f.id === selectedForm)?.theme_settings || {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    buttonColor: '#3b82f6'
  };

  useEffect(() => {
    fetchForms();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    transformSubmissionsData();
  }, [submissions]);

  useEffect(() => {
    applyFilters();
  }, [transformedSubmissions, dateFrom, dateTo, selectedForm]);

  const applyFilters = () => {
    let filtered = [...transformedSubmissions];

    // Apply form filtering
    if (selectedForm !== 'all') {
      filtered = filtered.filter(submission => 
        submission.form_id === selectedForm
      );
    }

    // Apply date filtering
    if (dateFrom) {
      filtered = filtered.filter(submission => 
        new Date(submission.submitted_at) >= dateFrom
      );
    }

    if (dateTo) {
      // Set end of day for dateTo
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(submission => 
        new Date(submission.submitted_at) <= endOfDay
      );
    }

    setFilteredSubmissions(filtered);
  };

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('id, title, theme_settings')
        .order('title');

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedForms: FormWithTheme[] = (data || []).map(form => ({
        id: form.id,
        title: form.title,
        theme_settings: typeof form.theme_settings === 'object' && form.theme_settings !== null 
          ? form.theme_settings as any
          : undefined
      }));
      
      setForms(transformedForms);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const query = supabase
        .from('form_submissions')
        .select(`
          *,
          forms(title)
        `)
        .order('submitted_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedSubmissions: Submission[] = (data || []).map(submission => ({
        id: submission.id,
        form_id: submission.form_id,
        submission_data: submission.submission_data,
        submitted_at: submission.submitted_at || '',
        ip_address: submission.ip_address ? String(submission.ip_address) : null,
        user_agent: submission.user_agent,
        forms: submission.forms as { title: string },
      }));
      
      setSubmissions(transformedSubmissions);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const transformSubmissionsData = async () => {
    const transformed = await Promise.all(
      submissions.map(async (submission) => {
        const formFields = await getFormFields(submission.form_id);
        const transformedData = transformSubmissionData(submission.submission_data, formFields);
        
        return {
          ...submission,
          submission_data: transformedData
        };
      })
    );
    
    setTransformedSubmissions(transformed);
  };

  const exportSubmissions = (format: 'csv' | 'json' = 'csv') => {
    const dataToExport = filteredSubmissions.length > 0 ? filteredSubmissions : transformedSubmissions;
    if (dataToExport.length === 0) return;

    const exportData = dataToExport.map(submission => ({
      'Form': submission.forms.title,
      'Submitted At': new Date(submission.submitted_at).toLocaleString(),
      'IP Address': submission.ip_address || '',
      ...submission.submission_data,
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    toast({
      title: 'Success',
      description: `Submissions exported as ${format.toUpperCase()} successfully`,
    });
  };

  const getDateRangeFromPreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return { from: weekAgo, to: now };
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return { from: monthAgo, to: now };
      case '3months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return { from: threeMonthsAgo, to: now };
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return { from: sixMonthsAgo, to: now };
      case 'all':
      default:
        return { from: undefined, to: undefined };
    }
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const { from, to } = getDateRangeFromPreset(preset);
    setDateFrom(from);
    setDateTo(to);
  };

  const getPresetDisplayName = (preset: string) => {
    switch (preset) {
      case 'week': return 'Last Week';
      case 'month': return 'Last Month';
      case '3months': return 'Last 3 Months';
      case '6months': return 'Last 6 Months';
      default: return 'All Time';
    }
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setDatePreset('all');
    setSelectedForm('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: currentTheme.primaryColor }}></div>
          <p className="mt-4" style={{ color: currentTheme.textColor }}>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentTheme.backgroundColor, color: currentTheme.textColor }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>Form Submissions</h2>
          <p style={{ color: currentTheme.textColor, opacity: 0.7 }}>View and manage form submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              style={{ 
                backgroundColor: viewMode === 'table' ? currentTheme.primaryColor : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : currentTheme.textColor
              }}
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              style={{ 
                backgroundColor: viewMode === 'cards' ? currentTheme.primaryColor : 'transparent',
                color: viewMode === 'cards' ? '#ffffff' : currentTheme.textColor
              }}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'charts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('charts')}
              style={{ 
                backgroundColor: viewMode === 'charts' ? currentTheme.primaryColor : 'transparent',
                color: viewMode === 'charts' ? '#ffffff' : currentTheme.textColor
              }}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              borderColor: currentTheme.primaryColor,
              color: currentTheme.textColor
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={transformedSubmissions.length === 0}
                style={{ 
                  backgroundColor: currentTheme.buttonColor,
                  color: '#ffffff'
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportSubmissions('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportSubmissions('json')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6" style={{ backgroundColor: currentTheme.backgroundColor }}>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.textColor }}>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="datePreset" style={{ color: currentTheme.textColor }}>Quick Select</Label>
                <Select value={datePreset} onValueChange={handleDatePresetChange}>
                  <SelectTrigger className="w-full" style={{ borderColor: currentTheme.primaryColor }}>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFrom" style={{ color: currentTheme.textColor }}>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                      style={{ 
                        borderColor: currentTheme.primaryColor,
                        color: currentTheme.textColor
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => {
                        setDateFrom(date);
                        setDatePreset('custom');
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="dateTo" style={{ color: currentTheme.textColor }}>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                      style={{ 
                        borderColor: currentTheme.primaryColor,
                        color: currentTheme.textColor
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => {
                        setDateTo(date);
                        setDatePreset('custom');
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  style={{ 
                    borderColor: currentTheme.primaryColor,
                    color: currentTheme.textColor
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
            {(dateFrom || dateTo || selectedForm !== 'all') && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm" style={{ color: currentTheme.textColor }}>
                  Showing {filteredSubmissions.length} of {transformedSubmissions.length} submissions
                  {selectedForm !== 'all' && ` for "${forms.find(f => f.id === selectedForm)?.title}"`}
                  {datePreset !== 'all' && datePreset !== 'custom' && ` - ${getPresetDisplayName(datePreset)}`}
                  {datePreset === 'custom' && dateFrom && ` from ${format(dateFrom, "PPP")}`}
                  {datePreset === 'custom' && dateTo && ` to ${format(dateTo, "PPP")}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'charts' && (
        <div className="mb-6">
          <SubmissionsChart 
            submissions={filteredSubmissions.length > 0 ? filteredSubmissions : submissions} 
            primaryColor={currentTheme.primaryColor}
            timeRange={datePreset !== 'all' ? getPresetDisplayName(datePreset) : 'All time'}
          />
        </div>
      )}

      {transformedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.textColor }}>No submissions yet</h3>
            <p style={{ color: currentTheme.textColor, opacity: 0.7 }} className="text-center">
              Submissions will appear here once users start filling out your forms
            </p>
          </CardContent>
        </Card>
      ) : filteredSubmissions.length === 0 && (dateFrom || dateTo || selectedForm !== 'all') ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.textColor }}>No submissions match the filters</h3>
            <p style={{ color: currentTheme.textColor, opacity: 0.7 }} className="text-center">
              Try adjusting the date range, form selection, or clearing filters
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <SubmissionsTable submissions={filteredSubmissions.length > 0 ? filteredSubmissions : transformedSubmissions} theme={currentTheme} />
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {(filteredSubmissions.length > 0 ? filteredSubmissions : transformedSubmissions).map((submission) => (
            <Card key={submission.id} style={{ backgroundColor: currentTheme.backgroundColor }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg" style={{ color: currentTheme.textColor }}>
                      {submission.forms.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: currentTheme.textColor, opacity: 0.7 }}>
                      <span>
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                      {submission.ip_address && (
                        <Badge variant="outline" style={{ borderColor: currentTheme.primaryColor }}>
                          IP: {submission.ip_address}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(submission.submission_data).map(([key, value]) => (
                    <div key={key}>
                      <dt className="font-medium capitalize" style={{ color: currentTheme.textColor }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="mt-1" style={{ color: currentTheme.textColor, opacity: 0.8 }}>
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </dd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};
