import React from 'react';
import ReactExport from 'react-data-export';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const ExcelExport = ({ buttonText, buttonIcon, fileName, sheetName, dataSet, labelValue, disabled, size }) => {
  return (
    <ExcelFile
      // element={<button>{buttonText || 'Export to Excel File'}</button>}
      element={
        <Button
          {...(!isMobile && { style: { width: 120 } })}
          type='primary'
          size={size || 'middle'}
          {...(buttonIcon && { icon: buttonIcon })}
          disabled={disabled}
        >
          {buttonText || 'Export to Excel File'}
        </Button>
      }
      filename={fileName}
    >
      {labelValue ? (
        <ExcelSheet data={dataSet || []} name={sheetName || 'sheet1'}>
          {labelValue.map(l => (
            <ExcelColumn label={l.label} value={l.value} />
          ))}
        </ExcelSheet>
      ) : (
        <ExcelSheet dataSet={dataSet || []} name={sheetName || 'sheet1'} />
      )}
    </ExcelFile>
  );
};

export default ExcelExport;
