
import { useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Brain, Loader2, PieChart as PieChartIcon, Calendar, Download } from 'lucide-react';
import { getSubmissionChartData } from '@/utils/submissionUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Submission {
  id: string;
  form_id: string;
  submission_data: any;
  submitted_at: string;
  forms: {
    title: string;
  };
}

interface SubmissionsChartProps {
  submissions: Submission[];
  primaryColor?: string;
  timeRange?: string;
}

export const SubmissionsChart = ({ submissions, primaryColor = '#3b82f6', timeRange }: SubmissionsChartProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analysisStats, setAnalysisStats] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const exportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const chartData = useMemo(() => getSubmissionChartData(submissions), [submissions]);
  
  const uniqueForms = useMemo(() => {
    const forms = new Set(submissions.map(s => s.forms.title));
    return Array.from(forms);
  }, [submissions]);

  const colors = [
    primaryColor,
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316'
  ];

  const chartConfig = useMemo(() => {
    const config: any = {};
    uniqueForms.forEach((form, index) => {
      config[form] = {
        label: form,
        color: colors[index % colors.length],
      };
    });
    return config;
  }, [uniqueForms, colors]);

  const pieData = useMemo(() => {
    return uniqueForms.map((form, index) => ({
      name: form,
      value: submissions.filter(s => s.forms.title === form).length,
      color: colors[index % colors.length]
    }));
  }, [uniqueForms, submissions, colors]);

  const generateAIAnalysis = async () => {
    if (submissions.length === 0) {
      toast({
        title: 'No Data',
        description: 'No submission data available for analysis',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-submissions', {
        body: { submissions, timeRange }
      });

      if (error) throw error;

      setAiAnalysis(data.analysis);
      setAnalysisStats(data.stats);
      toast({
        title: 'Analysis Complete',
        description: 'AI insights generated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to generate AI analysis',
        variant: 'destructive',
      });
      console.error('AI analysis error:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const exportToPDF = async () => {
    if (!aiAnalysis || !analysisStats) {
      toast({
        title: 'Export Failed',
        description: 'Please generate an analysis first before exporting',
        variant: 'destructive',
      });
      return;
    }

    setLoadingExport(true);
    try {
      // Helper function to capture all three chart types
      const captureAllCharts = async () => {
        const originalChartType = chartType;
        let lineChartData = null;
        let barChartData = null;
        let pieChartData = null;

        try {
          // Capture line chart
          setChartType('line');
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          let chartElement = document.querySelector('.recharts-wrapper');
          if (chartElement) {
            const lineCanvas = await html2canvas(chartElement as HTMLElement, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
            });
            lineChartData = lineCanvas.toDataURL('image/png');
          }

          // Capture bar chart
          setChartType('bar');
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          chartElement = document.querySelector('.recharts-wrapper');
          if (chartElement) {
            const barCanvas = await html2canvas(chartElement as HTMLElement, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
            });
            barChartData = barCanvas.toDataURL('image/png');
          }

          // Capture pie chart with better sizing
          setChartType('pie');
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          chartElement = document.querySelector('.recharts-wrapper') || 
                        document.querySelector('[class*="recharts"]');
          
          if (chartElement) {
            const pieCanvas = await html2canvas(chartElement as HTMLElement, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
              width: chartElement.scrollWidth,
              height: chartElement.scrollHeight,
            });
            pieChartData = pieCanvas.toDataURL('image/png');
          }

          // Restore original chart type
          setChartType(originalChartType);
          
        } catch (error) {
          console.warn('Chart capture failed:', error);
          setChartType(originalChartType);
        }

        return { lineChartData, barChartData, pieChartData };
      };

      // Capture all three charts
      const { lineChartData, barChartData, pieChartData } = await captureAllCharts();

      // Create PDF with proper text-based layout
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (neededHeight: number) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to wrap text
      const addWrappedText = (text: string, fontSize: number, maxWidth: number, lineHeight: number = fontSize * 0.3528) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          checkPageBreak(lineHeight + 5);
          pdf.text(lines[i], margin, yPosition);
          yPosition += lineHeight;
        }
        return yPosition;
      };

      // Header
      pdf.setTextColor(60, 90, 150); // Blue color
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Form Submissions Analysis Report', margin, yPosition);
      yPosition += 15;

      // Date and time range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
      yPosition += 8;
      if (timeRange) {
        pdf.text(`Time Range: ${timeRange}`, margin, yPosition);
        yPosition += 8;
      }
      yPosition += 10;

      // Stats Section
      checkPageBreak(40);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Key Statistics', margin, yPosition);
      yPosition += 12;

      // Stats grid
      const statBoxWidth = (contentWidth - 30) / 4;
      const statBoxHeight = 25;
      
      checkPageBreak(statBoxHeight + 10);
      
      // Draw stat boxes
      const stats = [
        { label: 'Total Submissions', value: analysisStats.totalSubmissions.toString() },
        { label: 'Daily Average', value: analysisStats.averageDaily },
        { label: 'Active Forms', value: analysisStats.formCount.toString() },
        { label: 'Top Form', value: analysisStats.topForm.length > 15 ? analysisStats.topForm.substring(0, 12) + '...' : analysisStats.topForm }
      ];

      stats.forEach((stat, index) => {
        const x = margin + (index * (statBoxWidth + 10));
        
        // Draw background
        pdf.setFillColor(245, 247, 250);
        pdf.rect(x, yPosition, statBoxWidth, statBoxHeight, 'F');
        
        // Draw border
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(x, yPosition, statBoxWidth, statBoxHeight, 'S');
        
        // Add value
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 90, 150);
        const valueWidth = pdf.getTextWidth(stat.value);
        pdf.text(stat.value, x + (statBoxWidth - valueWidth) / 2, yPosition + 12);
        
        // Add label
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        const labelWidth = pdf.getTextWidth(stat.label);
        pdf.text(stat.label, x + (statBoxWidth - labelWidth) / 2, yPosition + 20);
      });

      yPosition += statBoxHeight + 20;

      // Line Chart Visualization Section
      if (lineChartData) {
        checkPageBreak(90);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Trend Analysis (Line Chart)', margin, yPosition);
        yPosition += 15;

        // Add line chart image
        const chartWidth = contentWidth;
        const chartHeight = 70;
        
        checkPageBreak(chartHeight + 10);
        pdf.addImage(lineChartData, 'PNG', margin, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 15;
      }

      // Bar Chart Visualization Section
      if (barChartData) {
        checkPageBreak(90);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Form Comparison (Bar Chart)', margin, yPosition);
        yPosition += 15;

        // Add bar chart image
        const chartWidth = contentWidth;
        const chartHeight = 70;
        
        checkPageBreak(chartHeight + 10);
        pdf.addImage(barChartData, 'PNG', margin, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 15;
      }

      // Pie Chart Visualization Section  
      if (pieChartData) {
        checkPageBreak(90);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Distribution Analysis (Pie Chart)', margin, yPosition);
        yPosition += 15;

        // Add pie chart image
        const chartWidth = contentWidth;
        const chartHeight = 70;
        
        checkPageBreak(chartHeight + 10);
        pdf.addImage(pieChartData, 'PNG', margin, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 15;
      }

      // AI Analysis Section
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('AI Analysis & Insights', margin, yPosition);
      yPosition += 15;

      // Analysis content
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      addWrappedText(aiAnalysis, 11, contentWidth, 6);
      yPosition += 10;

      // Form Performance Section
      if (uniqueForms.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text('Form Performance Breakdown', margin, yPosition);
        yPosition += 15;

        // Form performance table
        uniqueForms.forEach((form, index) => {
          checkPageBreak(12);
          const formSubmissions = submissions.filter(s => s.forms.title === form).length;
          const percentage = ((formSubmissions / submissions.length) * 100).toFixed(1);
          
          // Form name
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(40, 40, 40);
          const truncatedForm = form.length > 40 ? form.substring(0, 37) + '...' : form;
          pdf.text(`${index + 1}. ${truncatedForm}`, margin, yPosition);
          
          // Stats
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`${formSubmissions} submissions (${percentage}%)`, margin + 5, yPosition + 6);
          
          yPosition += 14;
        });
      }

      // Footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = pageHeight - 15;
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by Form Analytics Dashboard', margin, footerY);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, footerY);
      }

      // Save the PDF
      const filename = `submissions-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast({
        title: 'Export Successful',
        description: 'Professional analysis report with chart exported as PDF successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export PDF',
        variant: 'destructive',
      });
      console.error('PDF export error:', error);
    } finally {
      setLoadingExport(false);
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No submission data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Brain className="h-5 w-5" style={{ color: primaryColor }} />
              AI Data Insights
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={generateAIAnalysis}
                disabled={loadingAnalysis}
                variant="outline"
                size="sm"
              >
                {loadingAnalysis ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
              {aiAnalysis && (
                <Button 
                  onClick={exportToPDF}
                  disabled={loadingExport}
                  variant="default"
                  size="sm"
                >
                  {loadingExport ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={exportRef}>
            {aiAnalysis ? (
              <div className="space-y-4">
                {analysisStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {analysisStats.totalSubmissions}
                      </div>
                      <div className="text-sm text-gray-600">Total Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {analysisStats.averageDaily}
                      </div>
                      <div className="text-sm text-gray-600">Daily Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {analysisStats.formCount}
                      </div>
                      <div className="text-sm text-gray-600">Active Forms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: primaryColor }}>
                        {analysisStats.topForm}
                      </div>
                      <div className="text-sm text-gray-600">Top Performing</div>
                    </div>
                  </div>
                )}
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Click "Generate Analysis" to get AI-powered insights about your form submissions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Data Visualization</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trend
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Bar
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                Distribution
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartType === 'line' && (
            <div className="space-y-6">
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Submissions', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {uniqueForms.map((form, index) => (
                    <Line
                      key={form}
                      type="monotone"
                      dataKey={form}
                      stroke={colors[index % colors.length]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            </div>
          )}

          {chartType === 'bar' && (
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart 
                data={uniqueForms.map(form => ({
                  form,
                  count: submissions.filter(s => s.forms.title === form).length
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="form" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill={primaryColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}

          {chartType === 'pie' && (
            <div className="flex justify-center">
              <ChartContainer config={chartConfig} className="h-96 w-full max-w-lg">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
