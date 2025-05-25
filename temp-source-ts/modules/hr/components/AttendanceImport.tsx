import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Steps,
  Table,
  Row,
  Col,
  Typography,
  Alert,
  Progress,
  notification,
  Space,
  Tag,
  Modal,
  Descriptions
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { FingerprintData, HRApiResponse } from 'types/hr';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Step } = Steps;

interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  duplicateRecords: number;
  errorRecords: number;
  errors: string[];
  batchId: string;
}

interface ParsedRecord {
  employeeCode: string;
  employeeName: string;
  timestamp: string;
  deviceId: string;
  rawData: string;
  status: 'valid' | 'duplicate' | 'error';
  error?: string;
}

/**
 * AttendanceImport component for importing fingerprint/attendance data from Excel files
 */
const AttendanceImport: React.FC = () => {
  const { t } = useTranslation();
  const { provinceId } = useParams<{ provinceId: string }>();
  const { userProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const steps = [
    {
      title: t('hr.import.upload'),
      description: t('hr.import.uploadDescription')
    },
    {
      title: t('hr.import.preview'),
      description: t('hr.import.previewDescription')
    },
    {
      title: t('hr.import.import'),
      description: t('hr.import.importDescription')
    },
    {
      title: t('hr.import.complete'),
      description: t('hr.import.completeDescription')
    }
  ];

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        // Parse Excel file
        const data = await parseExcelFile(file);
        setParsedData(data);
        setCurrentStep(1);
        notification.success({
          message: t('hr.import.fileUploadSuccess'),
          description: t('hr.import.recordsParsed', { count: data.length })
        });
      } catch (error) {
        notification.error({
          message: t('hr.import.fileUploadError'),
          description: error instanceof Error ? error.message : t('common.unexpectedError')
        });
      } finally {
        setUploading(false);
      }
    },
    [t]
  );

  const parseExcelFile = async (file: File): Promise<ParsedRecord[]> => {
    // Simulate Excel parsing - in real implementation, use libraries like xlsx
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData: ParsedRecord[] = [
          {
            employeeCode: 'EMP001',
            employeeName: 'John Doe',
            timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            deviceId: 'DEV001',
            rawData: 'fingerprint_data_1',
            status: 'valid'
          },
          {
            employeeCode: 'EMP002',
            employeeName: 'Jane Smith',
            timestamp: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
            deviceId: 'DEV001',
            rawData: 'fingerprint_data_2',
            status: 'valid'
          }
        ];
        resolve(mockData);
      }, 1000);
    });
  };

  const handleImport = useCallback(async () => {
    setImporting(true);
    setCurrentStep(2);

    try {
      let importedCount = 0;
      const total = parsedData.length;

      // Simulate import process
      for (let i = 0; i < total; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        importedCount++;
        setProgress((importedCount / total) * 100);
      }

      const result: ImportResult = {
        success: true,
        totalRecords: total,
        importedRecords: importedCount,
        duplicateRecords: 0,
        errorRecords: 0,
        errors: [],
        batchId: `BATCH_${Date.now()}`
      };

      setImportResult(result);
      setCurrentStep(3);

      notification.success({
        message: t('hr.import.importSuccess'),
        description: t('hr.import.recordsImported', { count: importedCount })
      });
    } catch (error) {
      notification.error({
        message: t('hr.import.importError'),
        description: error instanceof Error ? error.message : t('common.unexpectedError')
      });
    } finally {
      setImporting(false);
    }
  }, [parsedData, t]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setParsedData([]);
    setImportResult(null);
    setProgress(0);
  }, []);

  const previewColumns = [
    {
      title: t('hr.employeeCode'),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120
    },
    {
      title: t('hr.employeeName'),
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150
    },
    {
      title: t('hr.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: t('hr.deviceId'),
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 100
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          valid: 'green',
          duplicate: 'orange',
          error: 'red'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{t(`hr.import.${status}`)}</Tag>;
      }
    }
  ];

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file: File) => {
      handleFileUpload(file);
      return false; // Prevent automatic upload
    },
    showUploadList: false
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={3}>
              <FileExcelOutlined /> {t('hr.import.title')}
            </Title>
            <Text type='secondary'>{t('hr.import.description')}</Text>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Steps current={currentStep} size='small'>
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={currentStep === index && (importing || uploading) ? <InfoCircleOutlined spin /> : undefined}
                />
              ))}
            </Steps>
          </Col>
        </Row>

        {/* Step 0: File Upload */}
        {currentStep === 0 && (
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Alert
                message={t('hr.import.requirements')}
                description={
                  <ul>
                    <li>{t('hr.import.requirement1')}</li>
                    <li>{t('hr.import.requirement2')}</li>
                    <li>{t('hr.import.requirement3')}</li>
                  </ul>
                }
                type='info'
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Dragger {...uploadProps} style={{ minHeight: 200 }}>
                <p className='ant-upload-drag-icon'>
                  <UploadOutlined />
                </p>
                <p className='ant-upload-text'>{t('hr.import.dragOrClick')}</p>
                <p className='ant-upload-hint'>{t('hr.import.supportedFormats')}</p>
              </Dragger>
            </Col>
          </Row>
        )}

        {/* Step 1: Preview Data */}
        {currentStep === 1 && (
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Space style={{ marginBottom: 16 }}>
                <Button type='primary' onClick={handleImport} disabled={parsedData.length === 0}>
                  {t('hr.import.startImport')}
                </Button>
                <Button onClick={handleReset}>{t('common.reset')}</Button>
                <Button icon={<DownloadOutlined />} onClick={() => setPreviewVisible(true)}>
                  {t('hr.import.previewAll')}
                </Button>
              </Space>

              <Table
                columns={previewColumns}
                dataSource={parsedData.slice(0, 10)}
                pagination={false}
                size='small'
                scroll={{ x: 800 }}
              />

              {parsedData.length > 10 && (
                <Text type='secondary' style={{ marginTop: 8, display: 'block' }}>
                  {t('hr.import.showingFirst10', { total: parsedData.length })}
                </Text>
              )}
            </Col>
          </Row>
        )}

        {/* Step 2: Import Progress */}
        {currentStep === 2 && (
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Progress
                percent={Math.round(progress)}
                status={importing ? 'active' : 'success'}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              />
              <Text type='secondary' style={{ marginTop: 16, display: 'block' }}>
                {t('hr.import.importingRecords')}
              </Text>
            </Col>
          </Row>
        )}

        {/* Step 3: Import Complete */}
        {currentStep === 3 && importResult && (
          <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Alert
                message={t('hr.import.importComplete')}
                description={t('hr.import.importSuccessMessage')}
                type='success'
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginBottom: 24 }}
              />

              <Descriptions bordered column={2}>
                <Descriptions.Item label={t('hr.import.totalRecords')}>{importResult.totalRecords}</Descriptions.Item>
                <Descriptions.Item label={t('hr.import.importedRecords')}>
                  <Text type='success'>{importResult.importedRecords}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('hr.import.duplicateRecords')}>
                  <Text type='warning'>{importResult.duplicateRecords}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('hr.import.errorRecords')}>
                  <Text type='danger'>{importResult.errorRecords}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('hr.import.batchId')}>
                  <Text code>{importResult.batchId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('hr.import.importedBy')}>
                  {userProfile?.displayName || userProfile?.email}
                </Descriptions.Item>
              </Descriptions>

              <Space style={{ marginTop: 24 }}>
                <Button type='primary' onClick={handleReset}>
                  {t('hr.import.importMore')}
                </Button>
                <Button href='/hr/attendance/records'>{t('hr.import.viewRecords')}</Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        title={t('hr.import.previewAll')}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={previewColumns}
          dataSource={parsedData}
          pagination={{ pageSize: 20 }}
          size='small'
          scroll={{ x: 800, y: 400 }}
        />
      </Modal>
    </div>
  );
};

export default AttendanceImport;
