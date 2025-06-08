import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import EditableRowTable from 'components/EditableRowTable';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import { getSearchData } from 'firebase/api';
import { formatIncomeSummary, getColumnsFromRange, incomeSummarySumKeys, titles } from './api';
import { showLog, showWarn, firstKey, dateToThai } from 'functions';
import { TableSummary } from 'api/Table';
import { h } from 'api';
import { Button, Checkbox } from 'elements';
import { Check } from '@material-ui/icons';
import BranchDateHeader from 'components/branch-date-header';
import { isMobile } from 'react-device-detect';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { getBranchName } from 'Modules/Utils';

const IncomeSummaryReport = () => {
  // Initialize date range for the past 7 days
  const initRange = useMemo(
    () => [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    []
  );

  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(getColumnsFromRange(initRange));
  const [valOnly, setValueOnly] = useState(false);

  // Ref to store search parameters without triggering re-renders
  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    date: initRange
  });

  /**
   * Handle form value changes. Updates columns when date changes.
   */
  const handleValuesChange = useCallback(async changedValues => {
    if (firstKey(changedValues) === 'date') {
      showLog({ range: changedValues.date });
      setColumns(getColumnsFromRange(changedValues.date));
    }
    searchValues.current = { ...searchValues.current, ...changedValues };
    setData([]);
  }, []);

  /**
   * Fetch and format the income summary based on current search values.
   */
  const handleUpdate = useCallback(async () => {
    try {
      // showLog({ val: searchValues.current });
      setLoading(true);
      const sValues = {
        branchCode: searchValues.current.branchCode,
        startDate: searchValues.current.date[0],
        endDate: searchValues.current.date[1]
      };
      const sData = await getSearchData('sections/account/incomes', sValues);
      const filteredData = sData.filter(item => !item.deleted);
      const formattedData = await formatIncomeSummary(filteredData, searchValues.current.date);
      showLog({ sData, formattedData });
      setData(formattedData);
    } catch (error) {
      showWarn(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log table changes (pagination, filter, sorter, etc.).
   */
  const handleTableChange = useCallback((pagination, filter, sorter, currentTable) => {
    showLog({ TABLE_CHANGE: { pagination, filter, sorter, currentTable } });
  }, []);

  /**
   * Toggle to filter rows with a non-zero total.
   */
  const toggleValOnly = useCallback(() => {
    setValueOnly(prev => !prev);
  }, []);

  // Filter data based on the "valOnly" flag
  const filteredData = useMemo(() => {
    return valOnly ? data.filter(item => !!item.total) : data;
  }, [data, valOnly]);

  // Build label-value pairs for export from the columns with title 'วันที่'
  const labelValue = useMemo(() => {
    const dateColumn = mColumns.find(col => col.title === 'วันที่');
    const children = dateColumn?.children || [];
    return [
      { label: 'ประเภท', value: 'incomeTitle' },
      ...children.map(child => ({
        label: child.title,
        value: child.dataIndex
      })),
      { label: 'รวม', value: 'total' }
    ];
  }, [mColumns]);

  // Build export columns with a consistent style
  const exportColumns = useMemo(() => {
    const dateColumn = mColumns.find(col => col.title === 'วันที่');
    const children = dateColumn?.children || [];
    const baseStyle = {
      fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
      font: { bold: true }
    };

    return [
      {
        title: 'ประเภท',
        width: { wpx: 220 },
        style: baseStyle
      },
      ...children.map(child => ({
        title: child.title,
        width: { wpx: 80 },
        style: baseStyle
      })),
      {
        title: 'รวม',
        width: { wpx: 100 },
        style: baseStyle
      }
    ];
  }, [mColumns]);

  // Build export data rows based on the label-value mapping
  const exportData = useMemo(() => {
    return filteredData.map(item =>
      labelValue.map(lb => ({
        value: item[lb.value] || 0,
        ...(item.isSection && {
          style: {
            fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } }
          }
        })
      }))
    );
  }, [filteredData, labelValue]);

  // Create the multiDataSet for the Excel export
  const multiDataSet = useMemo(() => {
    return [
      {
        columns: [{ title: 'วันที่' }, { title: 'สาขา' }, { title: 'Export' }],
        data: [
          [
            {
              value: `${dateToThai(searchValues.current.date[0])} - ${dateToThai(searchValues.current.date[1])}`
            },
            { value: getBranchName(searchValues.current.branchCode, true) },
            {
              value: `${dateToThai(dayjs().format('YYYY-MM-DD'))} เวลา ${dayjs().format('HH:mm')}`
            }
          ]
        ]
      },
      { ySteps: 1, columns: exportColumns, data: exportData }
    ];
  }, [exportColumns, exportData]);

  showLog({ filteredData });

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          isRange: true,
          date: initRange
        }}
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
      >
        {({ isRange }) => (
          <div className="px-3 bg-white border-bottom">
            <Row>
              <Col md="12">
                <BranchDateHeader
                  title="สรุปรายรับ"
                  subtitle="รายงาน - บัญชี"
                  activeStep={0}
                  dateLabel="วันที่"
                  extraComponent={
                    <div className={!isMobile ? 'mt-4' : undefined}>
                      <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        type="primary"
                        icon={<Check />}
                        loading={loading}
                        className="mr-2"
                        style={{ width: 120 }}
                        size="middle"
                      >
                        {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                      </Button>
                      <ExcelExport
                        dataSet={multiDataSet}
                        buttonText="Export ข้อมูล"
                        sheetName="สรุปรายรับ"
                        fileName="income_summary"
                        disabled={filteredData.length === 0}
                        style={{ width: 120 }}
                      />
                    </div>
                  }
                  disabled={loading}
                  onlyUserBranch={user.branch}
                  isRange={isRange}
                />
              </Col>
            </Row>
          </div>
        )}
      </Form>
      <Checkbox onChange={toggleValOnly} checked={valOnly} className="m-2">
        แสดงเฉพาะที่มีรายรับ
      </Checkbox>
      <EditableRowTable
        dataSource={filteredData}
        columns={mColumns}
        loading={loading}
        summary={pageData => {
          // showLog({ pageData });
          return (
            <TableSummary
              pageData={pageData}
              dataLength={mColumns.length}
              startAt={0}
              sumKeys={incomeSummarySumKeys(searchValues.current.date).filter(l => !['count'].includes(l))}
              hasSection
              align="center"
            />
          );
        }}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
        scroll={{ y: h(80) }}
        rowClassName={record =>
          record?.incomeTitle && titles.includes(record.incomeTitle) ? 'selected-row' : 'editable-row'
        }
        onChange={handleTableChange}
      />
    </Container>
  );
};

export default IncomeSummaryReport;
