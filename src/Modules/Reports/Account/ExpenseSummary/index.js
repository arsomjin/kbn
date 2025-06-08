import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Checkbox, Form } from 'antd';
import EditableRowTable from 'components/EditableRowTable';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import { getSearchData, getCollection } from 'firebase/api';
import { formatExpenseSummary, getColumnsFromRange, expenseSummarySumKeys, formatCategories } from './api';
import { showWarn, firstKey, dateToThai } from 'functions';
import { TableSummary } from 'api/Table';
import { h } from 'api';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { isMobile } from 'react-device-detect';
import BranchDateHeader from 'components/branch-date-header';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { getBranchName } from 'Modules/Utils';
import { sortArr } from 'functions';
import { showLog } from 'functions';
import numeral from 'numeral';

const summaryValues = {};

const initRange = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];

const ExpenseSummary = () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(getColumnsFromRange(initRange));
  const [checks, setChecks] = useState(['cash', 'transfer', 'otherPay']);

  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    date: initRange
  });

  // Use a ref to store values fetched from the database.
  const dbValuesRef = useRef({
    categories: null,
    names: null
  });

  // Fetch database values on mount
  const fetchDbValues = useCallback(async () => {
    try {
      const categoriesSnap = await getCollection('data/account/expenseCategory', [['deleted', '==', false]]);
      const categories = formatCategories(categoriesSnap);
      const names = await getCollection('data/account/expenseName');
      dbValuesRef.current = { categories, names };
    } catch (e) {
      showWarn(e);
    }
  }, []);

  useEffect(() => {
    fetchDbValues();
  }, [fetchDbValues]);

  const handleValuesChange = changedValues => {
    searchValues.current = { ...searchValues.current, ...changedValues };

    if (firstKey(changedValues) === 'date') {
      setColumns(getColumnsFromRange(changedValues.date));
    }
    setData([]);
    setFilteredData([]);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { date, branchCode } = searchValues.current;

      const sData = await getSearchData(
        'sections/account/expenses',
        {
          startDate: date[0],
          endDate: date[1],
          expenseCategory: 'daily'
        },
        ['date', 'expenseId']
      );

      const formattedData = await formatExpenseSummary(sData, date, dbValuesRef.current, branchCode);

      setData(formattedData.result);
      // Update filtered data based on current checkboxes.
      handleCheckboxChange(checks, formattedData.result);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const handleCheckboxChange = (checkedValues, sourceData = data) => {
    setChecks(checkedValues);
    let updatedData = [...sourceData];

    if (checkedValues.includes('valOnly')) {
      updatedData = updatedData.filter(item => !!item.total);
    }
    if (!checkedValues.includes('cash') || !checkedValues.includes('transfer')) {
      if (!checkedValues.includes('cash')) {
        updatedData = updatedData.filter(
          item => item.otherBranchPay || (item.expenseType && item.expenseType !== 'dailyChange')
        );
      }
      if (!checkedValues.includes('transfer')) {
        updatedData = updatedData.filter(
          item => item.otherBranchPay || (item.expenseType && item.expenseType !== 'headOfficeTransfer')
        );
      }
    }
    if (!checkedValues.includes('otherPay')) {
      updatedData = updatedData.filter(item => !item.otherBranchPay);
    }
    let arr = sortArr(updatedData, 'expenseCategoryNumber');
    showLog({ CHECK_ARR: arr });
    setFilteredData(arr);
  };

  // Define Excel cell style.
  const eStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } },
    font: { bold: true }
  };

  // Build Excel columns.
  const dateColumn = mColumns.find(col => col.title === 'วันที่');
  const excelColumns = [
    {
      title: 'รายการ',
      dataIndex: 'expenseTitle',
      width: { wpx: isMobile ? 180 : 240 },
      style: eStyle
    },
    {
      title: 'ประเภท',
      dataIndex: 'expenseType',
      width: { wpx: 100 },
      style: eStyle
    },
    ...(dateColumn
      ? dateColumn.children.map(child => ({
          title: child.title,
          dataIndex: child.dataIndex,
          width: { wpx: 80 },
          style: eStyle
        }))
      : []),
    {
      title: 'รวม',
      dataIndex: 'total',
      width: { wpx: 100 },
      style: eStyle
    }
  ];

  // Filter out section rows to avoid double counting
  const detailRows = filteredData.filter(row => !row.isSection);

  // Loop through each column definition
  excelColumns.forEach(col => {
    // Check for numeric columns based on the dataIndex (date columns start with 'D' or are 'total')
    if (col.dataIndex && (col.dataIndex.startsWith('D') || col.dataIndex === 'total')) {
      summaryValues[col.dataIndex] = detailRows.reduce((sum, row) => {
        const value = Number(row[col.dataIndex]) || 0;
        return sum + value;
      }, 0);
    }
  });

  const summaryRow = excelColumns.map(col => {
    if (col.dataIndex === 'expenseTitle') {
      return { value: 'รวม' }; // Label for the first column (e.g. "Grand Total")
    }
    if (col.dataIndex === 'expenseType') {
      return { value: '' };
    }
    if (col.dataIndex && (col.dataIndex.startsWith('D') || col.dataIndex === 'total')) {
      return {
        value: numeral(summaryValues[col.dataIndex]).format('0,0.00'),
        style: { font: { bold: true } }
      };
    }
    return { value: '' };
  });

  // Map filtered data to the format required for Excel export.
  const excelData = filteredData.map(item =>
    excelColumns.map(col => {
      let value = item[col.dataIndex] || '';
      if (col.dataIndex === 'expenseType') {
        if (item.expenseType && !item.isSection && item.total) {
          value = item.otherBranchPay ? 'สาขาอื่นจ่าย' : item.expenseType === 'dailyChange' ? 'เงินสด' : 'เงินโอน';
        } else {
          value = '';
        }
      }
      return {
        value,
        ...(item.isSection && {
          style: {
            fill: { patternType: 'solid', fgColor: { rgb: 'FFCCEEFF' } }
          }
        })
      };
    })
  );

  // Append the final summary row at the end.
  const excelDataWithSummary = [...excelData, summaryRow];

  const multiDataSet = [
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
    { ySteps: 1, columns: excelColumns, data: excelDataWithSummary }
  ];

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
                  title="สรุปรายจ่าย"
                  subtitle="รายงาน - บัญชี"
                  activeStep={0}
                  isRange={isRange}
                  monthLabel="ประจำเดือน"
                  onlyUserBranch={user.branch}
                  extraComponent={
                    <div {...(!isMobile && { className: 'mt-4' })}>
                      <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        type="primary"
                        icon={<Check />}
                        loading={loading}
                        size="middle"
                        style={{ width: 130, marginRight: 10 }}
                      >
                        {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                      </Button>
                      <ExcelExport
                        dataSet={multiDataSet}
                        buttonText="Export ข้อมูล"
                        sheetName="สรุปรายจ่าย"
                        fileName="expense_summary"
                        disabled={filteredData.length === 0}
                        style={{ width: 120 }}
                      />
                    </div>
                  }
                  disabled={loading}
                />
              </Col>
            </Row>
          </div>
        )}
      </Form>
      <div className="p-2 my-2 border bg-light" style={{ width: isMobile ? '100%' : '50%' }}>
        <Checkbox.Group value={checks} onChange={chks => handleCheckboxChange(chks, data)} style={{ width: '100%' }}>
          <Row className="mb-2">
            <Col span={8}>
              <Checkbox value="valOnly">แสดงเฉพาะมียอด</Checkbox>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Checkbox value="cash">เงินสด</Checkbox>
            </Col>
            <Col md="4">
              <Checkbox value="transfer">เงินโอน</Checkbox>
            </Col>
            <Col md="4">
              <Checkbox value="otherPay">สาขาอื่นจ่าย</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </div>
      <EditableRowTable
        dataSource={filteredData}
        columns={mColumns}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={mColumns.length}
            startAt={1}
            sumKeys={expenseSummarySumKeys(searchValues.current.date)}
            align="center"
          />
        )}
        pagination={{ pageSize: 200 }}
        scroll={{ y: h(80) }}
        rowClassName={record => {
          if (record?.expenseTitle && record.isSection) return 'selected-row';
          if (record?.otherBranchPay) return 'incompleted-row';
          if (record?.expenseType && record.expenseType !== 'dailyChange') return 'completed-row';
          return 'editable-row';
        }}
      />
    </Container>
  );
};

export default ExpenseSummary;
