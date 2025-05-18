import React from "react";
import { Input, InputNumber, Select, DatePicker, Checkbox, Radio } from "antd";
import { TableContext, TableData, EditingCell, CustomColumnType, CustomColumnsType } from "./types";

// Function to generate render columns for the table
export const getRenderColumns = (
  columns: CustomColumnsType<TableData>,
  db: TableContext,
  handleSave: (row: TableData, dataIndex: string, rowIndex: number) => void,
  editingCell: EditingCell | null,
  setEditingCell: (cell: EditingCell | null) => void
): any[] => {
  return columns.map((col) => {
    // Skip if no dataIndex (usually for operation columns)
    if (!('dataIndex' in col) || !col.dataIndex) {
      return col;
    }
    
    // Get column dataIndex as string
    const dataIndex = String(col.dataIndex);

    // Pass through if column has render function already
    if (col.render) {
      return col;
    }

    // Handle special rendering for specific dataIndex values
    if (dataIndex.endsWith('Id')) {
      // Lookup columns (IDs that reference other entities)
      const baseProperty = dataIndex.replace(/Id$/, '');
      
      // Select appropriate lookup table based on property name
      let lookupCollection: Array<{ id: string; name: string }> = [];
      
      if (baseProperty === 'branch') {
        lookupCollection = db.branches;
      } else if (baseProperty === 'department') {
        lookupCollection = db.departments;
      } else if (baseProperty === 'userGroup') {
        lookupCollection = db.userGroups;
      } else if (baseProperty === 'dealer') {
        lookupCollection = db.dealers;
      } else if (baseProperty === 'bank') {
        lookupCollection = db.banks;
      } else if (baseProperty === 'expenseCategory') {
        lookupCollection = db.expenseCategories;
      } else if (baseProperty === 'employee') {
        lookupCollection = db.employees;
      } else if (baseProperty === 'executive') {
        lookupCollection = db.executives;
      } else if (baseProperty === 'expenseAccountName') {
        lookupCollection = db.expenseAccountNames;
      }
      
      // If we have a lookup collection, use it for rendering
      if (lookupCollection?.length > 0) {
        return {
          ...col,
          render: (value: string) => {
            const found = lookupCollection.find(item => item.id === value);
            return found ? found.name : value;
          }
        };
      }
    }

    // Default rendering based on editable property
    if ('editable' in col && col.editable) {
      return {
        ...col,
        onCell: (record: TableData, rowIndex: number) => ({
          record,
          dataIndex,
          title: col.title,
          handleSave,
          editingCell,
          setEditingCell,
          rowKey: record.key,
          rowIndex,
          colIndex: columns.findIndex(c => 
            'dataIndex' in c && c.dataIndex === dataIndex
          )
        })
      };
    }

    return col;
  });
};

// Add the validation rules based on field type
export const getValidationRules = (dataIndex: string): any[] => {
  // Common validation rules
  const rules: any[] = [];
  
  // Add field-specific validation
  if (dataIndex.includes('email')) {
    rules.push({ 
      type: 'email', 
      message: 'Please enter a valid email address' 
    });
  }
  
  if (dataIndex.includes('phone') || dataIndex.includes('mobile')) {
    rules.push({
      pattern: /^[0-9\-+()]*$/,
      message: 'Please enter a valid phone number'
    });
  }

  if (dataIndex.includes('price') || dataIndex.includes('amount') || dataIndex.includes('cost')) {
    rules.push({
      type: 'number',
      message: 'Please enter a valid number',
      transform: (value: string) => {
        if (value === '' || value === undefined || value === null) return undefined;
        return Number(value);
      }
    });
  }
  
  // Return the rules array
  return rules;
}; 