import React, { useRef, useState } from 'react';
import { Button, Upload, Table, Modal, Select, message } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

interface ExcelColumn {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

interface ExcelImportExportProps {
  columns: ExcelColumn[];
  data?: any[];
  onImport?: (data: any[]) => void;
  importFormats?: string[];
  exportFormats?: string[];
  templateDownload?: boolean;
  previewRows?: number;
}

const ExcelImportExport: React.FC<ExcelImportExportProps> = ({
  columns,
  data = [],
  onImport,
  importFormats = ['.xlsx', '.csv'],
  exportFormats = ['xlsx', 'csv'],
  templateDownload = false,
  previewRows = 10
}) => {
  const { t } = useTranslation('common');
  const [importedData, setImportedData] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [exportType, setExportType] = useState(exportFormats[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setImportedData(jsonData);
      setPreviewVisible(true);
      if (onImport) onImport(jsonData);
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export handler
  const handleExport = () => {
    if (!data || data.length === 0) {
      message.warning(t('excelImportExport.noDataToExport'));
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data, { header: columns.map(c => c.dataIndex) });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const fileType = exportType === 'csv' ? 'csv' : 'xlsx';
    XLSX.writeFile(wb, `export.${fileType}`);
  };

  // Template download
  const handleTemplateDownload = () => {
    const ws = XLSX.utils.json_to_sheet([], { header: columns.map(c => c.dataIndex) });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template.xlsx');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type='file'
          accept={importFormats.map(f => `application/${f.replace('.', '')},${f}`).join(',')}
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
          {t('excelImportExport.importExcel')}
        </Button>
        <Select
          value={exportType}
          onChange={setExportType}
          style={{ width: 100 }}
          options={exportFormats.map(f => ({ label: f.toUpperCase(), value: f }))}
          size='large'
        />
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          {t('excelImportExport.exportExcel')}
        </Button>
        {templateDownload && (
          <Button icon={<DownloadOutlined />} onClick={handleTemplateDownload}>
            {t('excelImportExport.downloadTemplate')}
          </Button>
        )}
        {importedData.length > 0 && (
          <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
            {t('excelImportExport.previewImport')}
          </Button>
        )}
      </div>
      <Modal
        open={previewVisible}
        title={t('excelImportExport.previewImportedData')}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={columns}
          dataSource={importedData.slice(0, previewRows)}
          rowKey={(_, i) => String(i)}
          pagination={importedData.length > previewRows ? { pageSize: previewRows } : false}
          scroll={{ x: true }}
        />
      </Modal>
    </div>
  );
};

export default ExcelImportExport;
