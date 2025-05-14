import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { Form } from 'antd';
import { showLog, showWarn } from 'functions';
import {
  columns,
  renderHeader,
} from './helper';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import InputDataModal from './InputDataModal';
import { useMergeState } from 'api/CustomHooks';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { cleanValuesBeforeSave } from 'functions';
import Payments from 'components/Payments';
import MTable from 'components/Table'


export default () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [selectedData, setSelectedData] = useMergeState({ record: {}, visible: false });
  const [form] = Form.useForm();
  const activeStep = 0;

  const initSearchValue = {
    incomeSubCategory: 'vehicles',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    branchCode: user.branch || "0450",
  };

  const searchValuesRef = useRef(initSearchValue);

  const _getData = useCallback(async (sValues) => {
    try {
      setLoading(true);
      const { branchCode, startDate, endDate, incomeSubCategory } = sValues
      let mData = [];
      let data = await getSearchData(
        'sections/account/incomes',
        { branchCode, startDate, endDate, incomeSubCategory, hasPLoan: true },
      );
      searchValuesRef.current = sValues;
      data.filter(l => !l.deleted).forEach((itm, id) => {
        const { incomeId, incomeNo, customerId, prefix, firstName, lastName, phoneNumber, hasPLoan, payments, kbnReceipt, receiverEmployee, total, date, incomeSubCategory, incomeType, items, pLoanPayments, refDoc, pLoanPaid } = itm
        let item = []
        if (items || refDoc) {
          (items || ((refDoc || {})?.doc || {}).items).forEach(obj => {
            item.push(obj.item || obj.productName)
          })
        }
        const cValues = cleanValuesBeforeSave({ id, key: id, incomeId, incomeNo: kbnReceipt || incomeNo, customerId, branchCode, incomeDate: date || moment().format('YYYY-MM-DD'), hasPLoan, prefix, firstName, lastName, phoneNumber, totalLoan: total, payments, pLoanPayments: pLoanPayments || [], receiverEmployee, incomeType, incomeSubCategory, item })
        mData.push(cValues)
      });
      showLog({ mData, sValues, data });
      setData(mData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    _getData(searchValuesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (searchValues) => {
    searchValuesRef.current = { ...searchValuesRef.current, ...searchValues }
  };

  const handleSelect = async (record, dataIndex, rowIndex) => {
    try {
      showLog({ record, rowIndex })
      setSelectedData({ record: { ...record, rowIndex }, visible: true });
    } catch (e) {
      showWarn(e);
    }
  };

  const onOk = (pLoanPayments) => {
    _getData(searchValuesRef.current);
    setSelectedData({ record: {}, visible: false })
  };

  const handleUpdate = () => {
    _getData(searchValuesRef.current);
  }

  const expandedRowRender = (record) => {
    return (
      <div className="bg-light px-3 pb-3">
        <Row>
          <Col md="10">
            <Payments value={record.payments} disabled />
          </Col>
        </Row>
      </div>
    );
  };


  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle
          sm="4"
          title="รับเงิน - สินเชื่อส่วนบุคคล"
          subtitle="บัญชี"
          className="text-sm-left"
        />
        <Col>
          <Stepper
            className="bg-light"
            steps={CommonSteps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <Row style={{ alignItems: 'center' }}>
      </Row>
      <Form
        form={form}
        initialValues={searchValuesRef.current}
        onValuesChange={onSearch}
        layout="vertical"
      >
        {(values) => {
          showLog({ values });
          return (
            <>
              {renderHeader({ handleUpdate, loading })}
              <MTable
                dataSource={data}
                columns={columns}
                // reset={reset}
                canEdit={handleSelect}
                tableProps={{
                  expandable: {
                    expandedRowRender,
                    rowExpandable: (record) => (record.payments || []).length > 0,
                  },
                  rowClassName: (record, index) =>
                    record?.deleted
                      ? 'deleted-row'
                      : (record?.pLoanPayments || []).length === 0
                        ? 'incompleted-row'
                        : 'completed-row',
                  loading

                }}
              />
            </>
          );
        }}
      </Form>
      {selectedData.visible && (
        <InputDataModal
          visible
          {...selectedData}
          onOk={onOk}
          onCancel={() => setSelectedData({ visible: false })}
          title="รับเงิน - สินเชื่อส่วนบุคคล"
        />
      )}
    </Container>
  );
};
