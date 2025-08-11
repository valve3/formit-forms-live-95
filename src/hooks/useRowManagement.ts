
interface UseRowManagementProps {
  form: any;
  setForm: (form: any) => void;
}

export const useRowManagement = ({ form, setForm }: UseRowManagementProps) => {
  
  const addNewRow = (columns: number = 1) => {
    console.log('useRowManagement: Adding new row with columns:', columns);
    console.log('Current form:', form);
    
    if (!form) {
      console.log('No form available, cannot add row');
      return;
    }
    
    const layoutSettings = form?.layout_settings || { 
      pages: [{ id: 'page_1', title: 'Page 1', columns: 1, rows: [] }], 
      currentPage: 0 
    };
    
    const currentPage = layoutSettings.currentPage || 0;
    const currentPageSettings = layoutSettings.pages?.[currentPage] || { 
      id: 'page_1', 
      title: 'Page 1', 
      columns: 1,
      rows: []
    };
    
    const newRowId = `row_${Date.now()}`;
    const newRow = {
      id: newRowId,
      columns: columns,
      fields: []
    };
    
    console.log('Creating new row:', newRow);
    
    const updatedRows = [...(currentPageSettings.rows || []), newRow];
    const updatedPageSettings = {
      ...currentPageSettings,
      rows: updatedRows
    };
    
    const updatedPages = [...(layoutSettings.pages || [])];
    updatedPages[currentPage] = updatedPageSettings;
    
    const updatedLayoutSettings = {
      ...layoutSettings,
      pages: updatedPages
    };
    
    const updatedForm = {
      ...form,
      layout_settings: updatedLayoutSettings
    };
    
    console.log('Updated form with new row:', updatedForm);
    console.log('Updated layout settings:', updatedLayoutSettings);
    
    setForm(updatedForm);
  };

  return { addNewRow };
};
