import React, { useEffect, useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Checkbox, Form } from 'antd';
import BranchMonthHeader from 'components/branch-month-header';
import EditableRowTable from 'components/EditableRowTable';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import { getSearchData } from 'firebase/api';
import { formatExpenseSummary, getColumns, expenseSummarySumKeys, formatCategories } from './api';
import { showLog, showWarn, firstKey } from 'functions';
import { TableSummary } from 'api/Table';
import { h } from 'api';
import { getCollection } from 'firebase/api';
import { useMergeState } from 'api/CustomHooks';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { isMobile } from 'react-device-detect';

const options = [
  {
    label: 'เฉพาะที่มียอด',
    value: 'valOnly'
  },
  {
    label: 'เงินสด',
    value: 'cash'
  },
  {
    label: 'เงินโอน',
    value: 'transfer'
  },
  {
    label: 'สาขาอื่นจ่ายให้',
    value: 'otherPay'
  }
];

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [fData, setFData] = useState([]);
  const [showData, setShowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(getColumns(dayjs().format('YYYY-MM'), []));
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [dbValues, setDB] = useMergeState({
    categories: null,
    names: null
  });
  const [checks, setChecks] = useState(['cash', 'transfer', 'otherPay']);

  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    month: dayjs().format('YYYY-MM')
  });

  const dbValuesRef = useRef({
    categories: null,
    names: null
  });

  const _init = async () => {
    try {
      const categoriesSnap = await getCollection('data/account/expenseCategory', [['deleted', '==', false]]);
      const categories = formatCategories(categoriesSnap);
      const names = await getCollection('data/account/expenseName');
      setDB({ categories, names });
      dbValuesRef.current = { categories, names };
      updateAllData();
      // _onUpdate();
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    _init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAllData = async () => {
    let sData = await getSearchData(
      'sections/account/expenses',
      { month: searchValues.current.month, expenseCategory: 'daily' },
      // { ...searchValues.current, expenseCategory: 'daily' },
      ['date', 'expenseId']
    );
    showLog({
      sData,
      dailyChange: sData.filter(l => l.expenseType === 'dailyChange'),
      hoTransfer: sData.filter(l => l.expenseType === 'headOfficeTransfer')
    });
    setAllData(sData);
  };

  const _onValuesChange = async val => {
    //  showLog({ val });
    searchValues.current = { ...searchValues.current, ...val };
    if (firstKey(val) === 'month') {
      setMonth(val['month']);
      setColumns(getColumns(val['month']), fData);
      updateAllData();
    }
    setData([]);
    setShowData([]);
  };

  const _onUpdate = async () => {
    try {
      //  showLog({ val });
      let mth = searchValues.current.month;
      setLoading(true);

      let fData = await formatExpenseSummary(allData, mth, dbValuesRef.current, searchValues.current.branchCode);
      showLog({ fData });
      setData(fData.result);
      // setShowData(fData.result);
      setFData(fData.data);
      onChange(checks, fData.result);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const onChange = (checkedValues, iData) => {
    console.log('checked = ', checkedValues);
    setChecks(checkedValues);
    let fData = [...iData];
    if (checkedValues.includes('valOnly')) {
      fData = fData.filter(l => !!l.total);
    }
    if (!checkedValues.includes('cash') || !checkedValues.includes('transfer')) {
      if (!checkedValues.includes('cash')) {
        fData = fData.filter(l => l.otherBranchPay || (!!l.expenseType && l.expenseType !== 'dailyChange'));
      }
      if (!checkedValues.includes('transfer')) {
        fData = fData.filter(l => l.otherBranchPay || (!!l.expenseType && l.expenseType !== 'headOfficeTransfer'));
      }
    }
    if (!checkedValues.includes('otherPay')) {
      fData = fData.filter(l => !l.otherBranchPay);
    }
    setShowData(fData);
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          isRange: false,
          month: dayjs(),
          monthRange: [dayjs().subtract(1, 'month'), dayjs()]
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="serviceId" /> */}
              <Row>
                <Col md="12">
                  <BranchMonthHeader
                    title="สรุปรายจ่าย"
                    subtitle="รายงาน - บัญชี"
                    // steps={CommonSteps}
                    activeStep={0}
                    isRange={values.isRange}
                    monthLabel="ประจำเดือน"
                    onlyUserBranch={user.branch}
                    extraComponent={
                      <Button onClick={_onUpdate} disabled={loading} type="primary" icon={<Check />} loading={loading}>
                        {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                      </Button>
                    }
                    disabled={loading}
                  />
                </Col>
              </Row>
              {/* <label className="text-warning">
                หมายเหตุ: อยู่ในระหว่างเก็บรวบรวมและทดสอบความถูกต้องของข้อมูล *
              </label> */}
            </div>
          );
        }}
      </Form>
      <div
        className="p-2 my-2 border bg-light"
        style={{
          width: isMobile ? '100%' : '50%'
        }}
      >
        <Checkbox.Group defaultValue={checks} onChange={chks => onChange(chks, data)} style={{ width: '100%' }}>
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
        dataSource={showData}
        columns={mColumns}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={mColumns.length}
            startAt={1}
            sumKeys={expenseSummarySumKeys(month)}
            align="center"
          />
        )}
        pagination={{ pageSize: 200 }}
        scroll={{ y: h(80) }}
        rowClassName={(record, index) => {
          //   showLog({ record });
          return record?.expenseTitle && record.isSection
            ? 'selected-row'
            : record?.otherBranchPay
              ? 'incompleted-row'
              : !!record.expenseType && record.expenseType !== 'dailyChange'
                ? 'completed-row'
                : 'editable-row';
        }}
      />
      {/* <Cover info="อยู่ในระหว่างเก็บรวบรวมข้อมูล" /> */}
    </Container>
  );
};
