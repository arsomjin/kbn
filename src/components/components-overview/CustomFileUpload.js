import React from 'react';

const CustomFileUpload = ({ fileHandler, fileName }) => (
  <div className="custom-file mb-3">
    <input type="file" className="custom-file-input" id="customFile2" onChange={fileHandler} />
    <label className="custom-file-label" htmlFor="customFile2">
      {fileName || 'เลือกไฟล์...'}
    </label>
  </div>
);

export default CustomFileUpload;
