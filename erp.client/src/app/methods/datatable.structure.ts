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
      'commission', 'fee', 'profit', 'due', 'vat'
    ];

    return Object.keys(data[0]).map(key => {
      const fieldName = key.toLowerCase();
      const shouldFormatDecimal = decimalFormatKeys.some(k => fieldName.includes(k));

      return {
        headerName: this.toTitleCase(key.replace(/_/g, ' ')),
        field: key,
        aggFunc: this.isNumericColumn(data, key) ? 'sum' : undefined,
        valueFormatter: (params: any) => {
          const v = params.value;

          // ✅ show empty string
          if (
            v === null ||
            v === undefined ||
            v === '' ||
            typeof v === 'object' ||
            Number.isNaN(v)
          ) {
            return '';
          }

          // decimal formatting
          if (shouldFormatDecimal && !isNaN(v)) {
            return Number(Number(v).toFixed(2)  ).toLocaleString(); // format with commas
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
