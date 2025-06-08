import React, { useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import BranchMonthHeader from 'components/branch-month-header';
import EditableRowTable from 'components/EditableRowTable';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import { getSearchData } from 'firebase/api';
import { formatIncomeSummary, getColumns, incomeSummarySumKeys, titles } from './api';
import { showWarn } from 'functions';
import { TableSummary } from 'api/Table';
import { h } from 'api';
import { firstKey } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { Checkbox } from 'elements';

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(getColumns(dayjs().format('YYYY-MM')));
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [valOnly, setValueOnly] = useState(false);

  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    month: dayjs().format('YYYY-MM')
  });

  const _onValuesChange = async val => {
    //  showLog({ val });
    if (firstKey(val) === 'month') {
      setMonth(val['month']);
      setColumns(getColumns(val['month']));
    }
    searchValues.current = { ...searchValues.current, ...val };
    setData([]);
  };

  const _onUpdate = async () => {
    try {
      //  showLog({ val });
      let mth = searchValues.current.month;
      setLoading(true);
      //   let sData = [];
      let sData = await getSearchData('sections/account/incomes', {
        ...searchValues.current
      });

      let fData = await formatIncomeSummary(
        sData.filter(l => !l.deleted),
        mth
      );
      setData(fData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const _checked = () => setValueOnly(v => !v);

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
                    title="สรุปรายรับ"
                    subtitle="รายงาน - บัญชี"
                    // steps={CommonSteps}
                    activeStep={0}
                    isRange={values.isRange}
                    monthLabel="ประจำเดือน"
                    extraComponent={
                      <Button onClick={_onUpdate} disabled={loading} type="primary" icon={<Check />} loading={loading}>
                        {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                      </Button>
                    }
                    disabled={loading}
                    onlyUserBranch={user.branch}
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
      <Checkbox onChange={_checked} checked={valOnly} className="m-2">
        แสดงเฉพาะที่มีรายรับ
      </Checkbox>
      <EditableRowTable
        dataSource={valOnly ? data.filter(l => !!l.total) : data}
        columns={mColumns}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={mColumns.length}
            startAt={0}
            sumKeys={incomeSummarySumKeys(month)}
            align="center"
          />
        )}
        pagination={{ pageSize: 100 }}
        scroll={{ y: h(80) }}
        rowClassName={(record, index) => {
          //   showLog({ record });
          return record?.incomeTitle && titles.includes(record.incomeTitle) ? 'selected-row' : 'editable-row';
        }}
      />
      {/* <Cover info="อยู่ในระหว่างเก็บรวบรวมข้อมูล" /> */}
    </Container>
  );
};
