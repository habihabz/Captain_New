import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class DataTableStructure {

  constructor() { }

  getDatatableStructure(data: any[]): ColDef[] {
    if (!data?.length) return [];

    const decimalFormatKeys = [
      'price', 'amount', 'value', 'rate', 'cost',
      'commission', 'fee', 'profit', 'due', 'vat', 'net'
    ];
    const centerKeys = ['id', 'no', 'qty', 'check', 'active', 'status', 'yn', 'on', 'date'];

    return Object.keys(data[0]).map(key => {
      const fieldName = key.toLowerCase();
      const shouldFormatDecimal = decimalFormatKeys.some(k => fieldName.includes(k));
      const shouldCenter = centerKeys.some(k => fieldName.includes(k));
      const isTotal = key.toLowerCase() === 'total' || key.toLowerCase().includes('amount');

      return {
        headerName: this.toTitleCase(key.replace(/_/g, ' ')),
        field: key,
        pinned: fieldName === 'id' ? 'left' : undefined,
        headerClass: shouldCenter ? 'text-center' : (isTotal ? 'text-end' : 'text-start'),
        cellClass: (params: any) => {
          let classes = '';
          if (shouldCenter) classes += 'text-center ';
          if (isTotal) classes += 'text-end fw-bold ';
          if (fieldName === 'id') classes += 'fw-bold text-muted ';
          return classes.trim();
        },
        valueFormatter: (params: any) => {
          const v = params.value;
          if (v === null || v === undefined || v === '' || typeof v === 'object' || Number.isNaN(v)) {
            return '';
          }

          if (shouldFormatDecimal && !isNaN(v)) {
            return "₹ " + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          }

          if (fieldName.includes('date') && !isNaN(Date.parse(v))) {
             return new Date(v).toLocaleDateString('en-GB');
          }

          return v;
        }
      };
    });
  }



  getTotalRowData(data: any[]): any {
    
    if (!data?.length) return {};
    
    const totalRow: any = { id: 'Total' }; // Use a unique identifier
    Object.keys(data[0]).forEach((key) => {
      const lowerKey = key.toLowerCase();

      if (lowerKey.includes('avg') || lowerKey.includes('average')) {
        totalRow[key] = ''; // or '' if you prefer
      } else if (this.isNumericColumn(data, key) && key != 'Serial No') {

        totalRow[key] = Number(data.reduce((sum, row) => sum + (row[key] || 0), 0).toFixed(2));
        
      } else {
        totalRow[key] = 'Total';
      }
    });

    return totalRow;
  }

  private toTitleCase(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private isNumericColumn(data: any[], key: string): boolean {
    return data.every(row => !isNaN(parseFloat(row[key])) && isFinite(row[key]));
  }

  decimalFormatter(params: any): string {
    const value = parseFloat(params.value);
    return isNaN(value) ? '' : value.toFixed(2);
  }


  getDatatableStructureV2(data: any[]): ColDef[] {
    if (!data?.length) return [];

    const noFitColumns = ['Sku', 'Make', 'Model', 'Category', 'Grade', 'Hard Disk', 'Ram', 'Processor', 'Daily Avg', 'Total Qty'];
    const isDateColumn = (key: string) => /^\d{4}-\d{2}-\d{2}$/.test(key);

    return Object.keys(data[0]).map(key => {
      const noFit = noFitColumns.includes(key);
      const isDate = isDateColumn(key);

      return {
        headerName: this.toTitleCase(key.replace(/_/g, ' ')),
        field: key,

        suppressSizeToFit: noFit,
        wrapHeaderText: noFit,
        autoHeaderHeight: noFit,

        minWidth: isDate ? 46 : noFit ? 80 : 60,

        // ✅ FIXED
        cellStyle: () => ({
          fontSize: isDate ? '10px' : '10px',
          ...(isDate && {
            textAlign: 'center',
            fontWeight: '500'
          })
        }),

        aggFunc: this.isNumericColumn(data, key) ? 'sum' : undefined
      };
    });
  }
}
