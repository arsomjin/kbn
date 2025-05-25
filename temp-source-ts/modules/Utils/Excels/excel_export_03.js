import React from 'react';
import ReactExport from 'react-data-export';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const multiDataSet = [
  {
    columns: [{ title: 'Name' }, { title: 'Salary' }, { title: 'Sex' }],
    data: [
      ['Johnson', 30000, 'Male'],
      ['Monika', 355000, 'Female'],
      ['Konstantina', 20000, 'Female'],
      ['John', 250000, 'Male'],
      ['Josef', 450500, 'Male']
    ]
  },
  {
    xSteps: 1, // Will start putting cell with 1 empty cell on left most
    ySteps: 5, //will put space of 5 rows,
    columns: [{ title: 'Name' }, { title: 'Department' }],
    data: [
      ['Johnson', 'Finance'],
      ['Monika', 'IT'],
      ['Konstantina', 'IT Billing'],
      ['John', 'HR'],
      ['Josef', 'Testing']
    ]
  }
];

const ExcelExport03 = () => {
  return (
    <ExcelFile>
      <ExcelSheet dataSet={multiDataSet} name='Organization' />
    </ExcelFile>
  );
};

export default ExcelExport03;
