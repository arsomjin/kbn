import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { Form } from 'antd';
import { showWarn } from 'functions';
import { columns, initSearchValue, renderHeader } from './Components';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import InputDataModal from './Components/InputDataModal';
import { useMergeState } from 'api/CustomHooks';
import { getCreditDataFromSale } from './api';

export default () => {
  const mSearchValues = { ...initSearchValue };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useMergeState({});
  const searchValuesRef = useRef(mSearchValues);
  const [form] = Form.useForm();
  const activeStep = 0;

  const _getData = useCallback(async sValues => {
    try {
      setLoading(true);
      let mData = [];
      if (sValues?.customerId && sValues.customerId !== 'all') {
        mData = await getSearchData('sections/sales/vehicles', { customerId: sValues.customerId }, ['saleNo', 'date']);
      } else if (sValues?.saleNo && sValues.saleNo !== 'all') {
        mData = await getSearchData('sections/sales/vehicles', { saleNo: sValues.saleNo }, ['saleNo', 'date']);
      } else {
        mData = await getSearchData('sections/sales/vehicles', sValues, ['saleNo', 'date']);
      }
      searchValuesRef.current = sValues;
      mData = mData
        .filter(l => !['reservation', 'other'].includes(l.saleType))
        .map((sale, id) => {
          let vehicleNo = [];
          let peripheralNo = [];
          sale?.items &&
            sale.items.map(it => {
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
            id
          };
        });
      setData(mData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    _getData(mSearchValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = searchValues => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  const handleSelect = async saleData => {
    try {
      // showLog({ saleData });
      let creditData = await getCreditDataFromSale(saleData);
      setSelectedData({ selectedData: creditData, saleData });
      setShowModal(true);
    } catch (e) {
      showWarn(e);
    }
  };

  const onOk = val => {
    //  showLog({ val });
    _getData(searchValuesRef.current);
    setShowModal(false);
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="สินเชื่อ" subtitle="บันทึกข้อมูล" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-light"
            steps={CommonSteps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <Form form={form} initialValues={mSearchValues} onValuesChange={onSearch} layout="vertical">
        {values => {
          //  showLog({ values });
          return (
            <>
              {renderHeader()}
              <EditableCellTable
                dataSource={data}
                columns={columns}
                loading={loading}
                // reset={reset}
                handleEdit={handleSelect}
                // onRow={(record, rowIndex) => {
                //   return {
                //     onClick: () => handleSelect(record),
                //   };
                // }}
                hasEdit
                rowClassName={(record, index) =>
                  record?.deleted ? 'deleted-row' : record?.creditRecorded ? 'recorded-row' : 'editable-row'
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
