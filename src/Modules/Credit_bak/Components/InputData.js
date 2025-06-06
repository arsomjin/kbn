import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { Form } from 'antd';
import { showWarn } from 'functions';
import { columns, initSearchValue, renderHeader } from '.';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import InputDataModal from './InputDataModal';
import { useMergeState } from 'api/CustomHooks';
import { getSKLCreditDataFromSale } from '../CreditSKL/CreditSKL_Input/api';
import { getBAACreditDataFromSale } from '../CreditBAA/CreditBAA_Input/api';
import { getKBNCreditDataFromSale } from '../CreditKBN/CreditKBN_Input/api';
import { getCashCreditDataFromSale } from '../CreditCash/CreditCash_Input/api';

export default ({ subtitle, saleType }) => {
  const mSearchValues = { ...initSearchValue, saleType };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useMergeState({});
  const searchValuesRef = useRef(mSearchValues);
  const [form] = Form.useForm();
  const activeStep = 0;

  const _getData = useCallback(
    async sValues => {
      try {
        setLoading(true);
        let mData = [];
        if (sValues?.customerId && sValues.customerId !== 'all') {
          mData = await getSearchData(
            'sections/sales/vehicles',
            { customerId: sValues.customerId, saleType: saleType },
            ['saleNo', 'date']
          );
        } else if (sValues?.saleNo && sValues.saleNo !== 'all') {
          mData = await getSearchData('sections/sales/vehicles', { saleNo: sValues.saleNo, saleType: saleType }, [
            'saleNo',
            'date'
          ]);
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
    },
    [saleType]
  );

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
      let creditData;
      switch (saleType) {
        case 'sklLeasing':
          creditData = await getSKLCreditDataFromSale(saleData, {});
          break;
        case 'baac':
          creditData = await getBAACreditDataFromSale(saleData, {});
          break;
        case 'kbnLeasing':
          creditData = await getKBNCreditDataFromSale(saleData, {});
          break;
        case 'cash':
          creditData = await getCashCreditDataFromSale(saleData, {});
          break;

        default:
          break;
      }
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
        <PageTitle sm="4" title={subtitle} subtitle="บันทึกข้อมูลสินเชื่อ" className="text-sm-left" />
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
              {renderHeader(saleType)}
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
