import React from 'react';
import ReactExport from 'react-data-export';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const dataSet1 = [
  {
    name: 'Johson',
    amount: 30000,
    sex: 'M',
    is_married: true
  },
  {
    name: 'Monika',
    amount: 355000,
    sex: 'F',
    is_married: false
  },
  {
    name: 'John',
    amount: 250000,
    sex: 'M',
    is_married: false
  },
  {
    name: 'Josef',
    amount: 450500,
    sex: 'M',
    is_married: true
  }
];

const dataSet2 = [
  {
    name: 'Johnson',
    total: 25,
    remainig: 16
  },
  {
    name: 'Josef',
    total: 25,
    remainig: 7
  }
];

const ExcelExport01 = () => {
  return (
    <ExcelFile element={<button>Export Data to Excel File</button>}>
      <ExcelSheet data={dataSet1} name="Employees">
        <ExcelColumn label="Name" value="name" />
        <ExcelColumn label="Wallet Money" value="amount" />
        <ExcelColumn label="Gender" value="sex" />
        <ExcelColumn label="Marital Status" value={col => (col.is_married ? 'Married' : 'Single')} />
      </ExcelSheet>
      <ExcelSheet data={dataSet2} name="Leaves">
        <ExcelColumn label="Name" value="name" />
        <ExcelColumn label="Total Leaves" value="total" />
        <ExcelColumn label="Remaining Leaves" value="remaining" />
      </ExcelSheet>
    </ExcelFile>
  );
};

export default ExcelExport01;
