import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row } from 'shards-react';
import { Form } from 'antd';
import { showLog, showWarn } from 'functions';
import {
  columns,
  getCreditDataFromSale,
  initSearchValue,
  renderHeader,
} from './api';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import PageTitle from 'components/common/PageTitle';
import InputDataModal from './InputDataModal';
import { useMergeState } from 'api/CustomHooks';
import { showAlert } from 'functions';
import moment from 'moment-timezone';
import { formatValuesBeforeLoad } from 'functions';
import { getNameFromEmployeeCode } from 'Modules/Utils';
import { useSelector } from 'react-redux';

export default ({ subtitle, saleType }) => {
  const { employees } = useSelector((state) => state.data);
  const mSearchValues = { ...initSearchValue, saleType };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useMergeState({});
  const searchValuesRef = useRef(mSearchValues);
  const [form] = Form.useForm();
  const activeStep = 0;

  const _getData = useCallback(
    async (sValues) => {
      showLog({ sValues });
      try {
        setLoading(true);
        let mData = [];
        if (sValues?.saleNo && sValues.saleNo !== 'all') {
          mData = await getSearchData(
            'sections/sales/vehicles',
            { saleNo: sValues.saleNo, saleType: saleType },
            ['saleNo', 'date']
          );
        } else if (sValues?.customerId && sValues.customerId !== 'all') {
          mData = await getSearchData(
            'sections/sales/vehicles',
            { customerId: sValues.customerId, saleType: saleType },
            ['saleNo', 'date']
          );
        } else {
          mData = await getSearchData(
            'sections/sales/vehicles',
            {
              startDate: sValues?.startDate,
              endDate: sValues?.endDate,
              branchCode: sValues.branchCode,
            },
            ['saleNo', 'date']
          );
        }
        searchValuesRef.current = sValues;
        mData = mData
          .filter((l) => !['reservation', 'other'].includes(l.saleType))
          .map((sale, id) => {
            let vehicleNo = [];
            let peripheralNo = [];
            sale?.items &&
              sale.items.map((it) => {
                vehicleNo = !it.vehicleNo
                  ? vehicleNo
                  : Array.isArray(it.vehicleNo)
                  ? [...vehicleNo, ...it.vehicleNo]
                  : [...vehicleNo, it.vehicleNo];
                peripheralNo = !it.peripheralNo
                  ? peripheralNo
                  : Array.isArray(it.peripheralNo)
                  ? [...peripheralNo, ...it.peripheralNo]
                  : [...peripheralNo, it.peripheralNo];
                return it;
              });
            return {
              ...sale,
              salesPerson: sale.salesPerson
                ? Array.isArray(sale.salesPerson)
                  ? sale.salesPerson
                  : [sale.salesPerson]
                : [],
              productCode: sale.items[0].productCode,
              vehicleNo,
              peripheralNo,
              id,
            };
          });
        setData(mData);
        setLoading(false);
      } catch (e) {
        showWarn(e);
        setLoading(false);
      }
    },
    [saleType]
  );

  useEffect(() => {
    _getData(mSearchValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (searchValues) => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  const handleSelect = async (saleData) => {
    try {
      if (!saleData?.referringDetails) {
        return showAlert(
          'ไม่มีข้อมูล',
          `ใบขายเลขที่ ${saleData.saleNo} ไม่มีรายละเอียดค่าแนะนำ`,
          'warning'
        );
      }
      if (
        saleData?.referringDetails &&
        saleData.referringDetails?.forHQ &&
        !saleData.referringDetails.forHQ?.creditClerk &&
        !saleData.referringDetails.forHQ?.creditCheckDate
      ) {
        return showAlert(
          'รอสินเชื่อตรวจสอบ',
          `ใบขายเลขที่ ${saleData.saleNo} ยังไม่ได้ตรวจสอบข้อมูลโดยฝ่ายสินเชื่อ`,
          'warning'
        );
      }
      if (
        saleData?.referringDetails &&
        saleData.referringDetails?.forHQ &&
        !!saleData.referringDetails.forHQ?.hqAccountAuditor &&
        !!saleData.referringDetails.forHQ?.hqAuditorDate
      ) {
        return showAlert(
          'ตรวจสอบแล้ว',
          `ใบขายเลขที่ ${
            saleData.saleNo
          } ตรวจสอบแล้วโดย ${getNameFromEmployeeCode({
            employeeCode: saleData.referringDetails.forHQ?.hqAccountAuditor,
            employees,
          })} เมื่อวันที่ ${moment(
            saleData.referringDetails.forHQ?.hqAuditorDate,
            'YYYY-MM-DD'
          )
            .locale('th')
            .format('D MMM YYYY')}`,
          'success'
        );
      }
      let creditData = await getCreditDataFromSale(saleData);
      creditData = formatValuesBeforeLoad(creditData);
      setSelectedData({ selectedData: creditData, saleData });
      setShowModal(true);
    } catch (e) {
      showWarn(e);
    }
  };

  const onOk = (val) => {
    //  showLog({ val });
    _getData(searchValuesRef.current);
    setShowModal(false);
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle
          sm="4"
          title="ตรวจสอบค่าแนะนำ"
          subtitle="บัญชี"
          className="text-sm-left"
        />
      </Row>
      <Form
        form={form}
        initialValues={mSearchValues}
        onValuesChange={onSearch}
        layout="vertical"
      >
        {(values) => {
          //  showLog({ values });
          return (
            <>
              {renderHeader(saleType)}
              <EditableCellTable
                dataSource={data}
                columns={columns}
                loading={loading}
                // reset={reset}
                handleEdit={handleSelect}
                hasEdit
                rowClassName={(record, index) =>
                  record?.deleted
                    ? 'deleted-row'
                    : record?.accountReferrerChecked
                    ? 'recorded-row'
                    : 'editable-row'
                }
              />
            </>
          );
        }}
      </Form>
      {showModal && (
        <InputDataModal
          visible
          {...selectedData}
          onOk={onOk}
          onCancel={() => setShowModal(false)}
          title={`เลขที่ใบขาย ${selectedData?.selectedData.saleNo}`}
        />
      )}
    </Container>
  );
};
