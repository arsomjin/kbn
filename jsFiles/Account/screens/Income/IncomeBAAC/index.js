import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'shards-react';
import { Form } from 'antd';
import { showWarn } from 'functions';
import {
  columns,
  getBAACAccountDataFromSale,
  initSearchValue,
  renderHeader,
} from './api';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { Stepper } from 'elements';
import { CommonSteps } from 'data/Constant';
import PageTitle from 'components/common/PageTitle';
import InputDataModal from './InputDataModal';
import { useMergeState } from 'api/CustomHooks';
import { showWarning } from 'functions';

export default () => {
  const mSearchValues = { ...initSearchValue, saleType: 'baac' };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useMergeState({});
  const searchValuesRef = useRef(mSearchValues);
  const [form] = Form.useForm();
  const activeStep = 0;

  const _getData = useCallback(async (sValues) => {
    try {
      setLoading(true);
      let mData = [];
      if (sValues?.saleNo && sValues.saleNo !== 'all') {
        mData = await getSearchData(
          'sections/sales/vehicles',
          { saleNo: sValues.saleNo, saleType: sValues.saleType },
          ['saleNo', 'date']
        );
      } else if (sValues?.customerId && sValues.customerId !== 'all') {
        mData = await getSearchData(
          'sections/sales/vehicles',
          { customerId: sValues.customerId, saleType: sValues.saleType },
          ['saleNo', 'date']
        );
      } else {
        mData = await getSearchData('sections/sales/vehicles', sValues, [
          'saleNo',
          'date',
        ]);
      }
      searchValuesRef.current = sValues;
      mData = mData
        .filter((l) => !['reservation', 'other'].includes(l.saleType))
        .map((item, id) => {
          let vehicleNo = [];
          let peripheralNo = [];
          item?.items &&
            item.items.map((it) => {
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
            ...item,
            vehicleNo,
            peripheralNo,
            productCode: item?.items ? item.items[0]?.productCode || '' : '',
            id,
          };
        });
      //  showLog({ mData, sValues });
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

  const onSearch = (searchValues) => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  const handleSelect = async (sale) => {
    try {
      let saleData = { ...sale };
      if (!sale?.creditRecorded) {
        return showWarning(
          `ฝ่ายสินเชื่อยังไม่ได้บันทึกข้อมูล เลขที่ ${sale?.saleNo || ''}`
        );
      }
      if (sale?.creditInfo) {
        saleData = {
          ...saleData,
          ...(sale.creditInfo?.referringDetails && {
            referringDetails: sale.creditInfo.referringDetails,
          }),
        };
      }
      let accountData = await getBAACAccountDataFromSale(saleData, {});
      setSelectedData({ selectedData: accountData, saleData });
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
          title="รับเงิน - ธกส."
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
              {renderHeader(values.saleType)}
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
                  record?.deleted
                    ? 'deleted-row'
                    : !record?.creditRecorded
                    ? 'incompleted-row'
                    : record?.accountRecorded
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
