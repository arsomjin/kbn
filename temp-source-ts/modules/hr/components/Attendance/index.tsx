import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Card, Typography, notification, Col } from 'antd';
import PageTitle from '../../../../components/common/PageTitle';
import { useNavigate, useLocation } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import { initSearchValue, renderHeader, getColumns } from './api';
import EditableCellTable from '../../../../components/EditableCellTable';
import { getSearchData, getLatestData } from '../../../../utils/firestoreSearch';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { getNameFromUid } from '../../../Utils';
import { h } from '../../../../api/Dimension';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord, ImportInfo, SearchFormValues } from './types';
import { createArrOfLength, sortArr, showWarn } from '../../../../utils/functions';

const { Title } = Typography;

// Define column type with proper typing
interface ExtraColumn {
  title: string;
  dataIndex: string;
  align: 'center';
  width: number;
}

// Define a legacy data interface to match the temp-source structure
interface LegacyDataState {
  users?: Record<string, any>;
  employees?: Record<string, any>;
  branches?: Record<string, any>;
  [key: string]: any;
}

// Define an extended RootState for legacy compatibility
interface ExtendedRootState {
  data: LegacyDataState;
  employees?: {
    employees: Record<string, any>;
  };
  [key: string]: any;
}

const eCol: ExtraColumn[] = createArrOfLength(13).map((it: number) => ({
  title: (it + 1).toString(),
  dataIndex: (it + 1).toString(),
  align: 'center' as const,
  width: 60
}));

const getExtraCol = (snap: any): any => {
  let result = { ...snap };
  createArrOfLength(13).map((it: number) => {
    result[(it + 1).toString()] = snap[(it + 1).toString()] || '';
    return it;
  });
  return result;
};

interface AttendancePageProps {}

const AttendancePage: React.FC<AttendancePageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname;
  const [form] = Form.useForm();

  // Use type assertion for legacy compatibility
  const dataState = useSelector((state: ExtendedRootState) => state.data || {});
  const { users = {}, employees = {}, branches = {} } = dataState;

  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [latestImport, setLatest] = useState<ImportInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const searchValuesRef = useRef<SearchFormValues>(initSearchValue);

  const _getData = useCallback(async (sValues: SearchFormValues) => {
    try {
      setLoading(true);
      let filters = { ...sValues };
      let mData = await getSearchData('sections/hr/importFingerPrint', filters, ['employeeCode', 'date']);
      searchValuesRef.current = sValues;
      mData = sortArr(
        mData.filter((l: any) => !!l.employeeCode),
        'employeeCode'
      ).map((it: any, id: number) => ({
        ...getExtraCol(it),
        id,
        key: id.toString() // Convert to string for table compatibility
      }));
      setData(mData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  const _getLatestImport = useCallback(async () => {
    try {
      let latestData = await getLatestData({
        collection: 'sections/hr/importFingerPrint',
        orderBy: 'importTime',
        desc: true
      });
      if (latestData) {
        let importInfo: { by: string; time: any } | null = null;
        latestData.forEach((rec: any) => {
          //  showLog({ rec: rec.data() });
          const recData = rec.data();
          if (recData?.importBy && recData?.importTime) {
            importInfo = { by: recData.importBy, time: recData.importTime };
          }
        });
        if (importInfo) {
          const eName = await getNameFromUid({
            uid: (importInfo as { by: string; time: any }).by,
            users,
            employees
          });
          setLatest({ time: (importInfo as { by: string; time: any }).time, by: eName });
        }
      }
    } catch (e) {
      showWarn(e);
    }
  }, [employees, users]);

  useEffect(() => {
    _getData(initSearchValue);
    _getLatestImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (searchValues: SearchFormValues) => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  return (
    <div className='main-content-container p-3'>
      <Row className='page-header px-3 bg-light'>
        <Col span={24}>
          <PageTitle title={t('attendance.title', 'ข้อมูลสแกนลายนิ้วมือ')} subtitle={t('hr.title', 'งานบุคคล')} />
        </Col>
      </Row>
      <Card>
        <Form form={form} initialValues={initSearchValue} onValuesChange={onSearch} layout='vertical'>
          <Card.Meta
            title={
              <div className='border-bottom border-top pt-3 mt-3'>
                <Button
                  onClick={() =>
                    navigate('/utils/upload-data-from-excel-file', {
                      state: { params: { dataType: 'fingerPrint' } }
                    })
                  }
                  className='mr-2 my-2'
                  icon={<DownloadOutlined />}
                >
                  {t('attendance.upload', 'อัปโหลดข้อมูล สแกนลายนิ้วมือ')}
                </Button>
                {latestImport && (
                  <strong className='text-muted ml-3'>
                    {t('attendance.lastImport', '*นำเข้าข้อมูลล่าสุด {{date}} โดย {{by}}', {
                      date: dayjs(latestImport.time).format('lll'),
                      by: latestImport.by
                    })}
                  </strong>
                )}
              </div>
            }
          />
          {renderHeader()}
          <EditableCellTable
            dataSource={data}
            columns={[...getColumns(data), ...eCol]}
            loading={loading}
            pagination={{ pageSize: 50, hideOnSinglePage: true }}
            scroll={{ y: h(70) }}
          />
        </Form>
      </Card>
    </div>
  );
};

export default AttendancePage;
