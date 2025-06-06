import React, { useEffect, useState } from 'react';
import { Form, Modal, Button } from 'antd';
import { Container } from 'shards-react';
import { columns, saleColumns, modelColumns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { showLog } from 'functions';
import ReportHeader from 'components/report-header';
import { useMergeState } from 'api/CustomHooks';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import SaleViewer from 'Modules/Sales/Vehicles/SaleViewer';
import { isMobile } from 'react-device-detect';
import { w } from 'api';

export default ({ saleArr, saleItems, salesPerson, saleModels, onSaleSelected }) => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState(
    saleItems.map((l, n) => ({
      ...l,
      key: n,
      id: n,
      vehicleType:
        typeof l.vehicleType !== 'undefined'
          ? l.vehicleType === '0'
            ? 'รถแทรคเตอร์'
            : l.vehicleType
          : l?.productType || 'อุปกรณ์ต่อพ่วง'
    }))
  );
  const [loading, setLoading] = useState(false);
  const [searchValues, setSearchValues] = useMergeState({
    saleType: 'all',
    vehicleType: 'all'
  });
  const [saleModal, setSaleModal] = useMergeState({
    sale: {},
    visible: false
  });

  showLog({ saleArr, saleItems, salesPerson, saleModels });

  const [form] = Form.useForm();

  const _getData = (searches, arr) => {
    setLoading(true);
    let mData = [];
    if (searches.saleType === 'all') {
      mData = searches.vehicleType !== 'all' ? arr.filter(l => l.vehicleType === searches.vehicleType) : arr;
    } else {
      mData =
        searches.vehicleType !== 'all'
          ? arr.filter(l => l.vehicleType === searches.vehicleType && l.saleType === searches.saleType)
          : arr.filter(l => l.saleType === searches.saleType);
    }
    let fData = mData.filter(l => l?.vehicleType && l.vehicleType.startsWith('รถ'));
    mData = fData.map((l, id) => ({
      ...l,
      id,
      key: id
    }));
    setData(mData);
    setLoading(false);
  };

  useEffect(() => {
    let arr = saleItems.map((l, n) => ({
      ...l,
      key: n,
      id: n,
      vehicleType:
        typeof l.vehicleType !== 'undefined'
          ? l.vehicleType === '0'
            ? 'รถแทรคเตอร์'
            : l.vehicleType
          : l?.productType || 'อุปกรณ์ต่อพ่วง'
    }));
    setItems(arr);
    _getData(searchValues, arr);
  }, [saleItems, searchValues]);

  const _onValuesChange = val => {
    let mItems = [...items];
    setSearchValues(val);
    _getData({ ...searchValues, ...val }, mItems);
  };

  const handleSelect = async record => {
    try {
      // Get order by record id.
      // showLog({ record });

      if (record?.deleted) {
        return showLog(`${record.saleId} has been deleted.`);
      }
      const saleDoc = await checkDoc('sections', `sales/vehicles/${record.saleId}`);
      if (saleDoc) {
        let sale = { ...saleDoc.data() };
        sale.salesPerson = !!sale.salesPerson
          ? Array.isArray(sale.salesPerson)
            ? sale.salesPerson
            : sale.salesPerson.split(',')
          : [];
        setSaleModal({ sale, visible: true });
      }
    } catch (e) {
      showWarn(e);
    }
  };

  let salesData = salesPerson.map((l, n) => ({
    ...l,
    qty: l.value,
    receiverEmployee: l.title,
    key: n,
    id: n
  }));

  let modelData = saleModels.map((l, n) => ({
    ...l,
    key: n,
    id: n
  }));

  if (searchValues.vehicleType !== 'all') {
    salesData = salesData.filter(l => l.vehicleType === searchValues.vehicleType);
    modelData = modelData.filter(l => l.vehicleType === searchValues.vehicleType);
  }

  return (
    <Container fluid className="main-content-container px-3">
      <Form
        form={form}
        initialValues={searchValues}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="saleId" /> */}
              <ReportHeader title="การขายรถและอุปกรณ์" subtitle="รายงาน" type="sale" />
            </div>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={7} sumKeys={['qty', 'amtFull']} />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        hasChevron
      />
      <h6 className="text-primary">เรียงตามผลงาน</h6>
      <EditableCellTable
        dataSource={salesData}
        columns={saleColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={saleColumns.length} startAt={1} sumKeys={['qty']} />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => onSaleSelected(record)
          };
        }}
        hasChevron
      />
      <h6 className="text-primary">เรียงตามรุ่น</h6>
      <EditableCellTable
        dataSource={modelData}
        columns={modelColumns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={modelColumns.length} startAt={3} sumKeys={['qty']} />
        )}
      />
      <Modal
        visible={saleModal.visible}
        onCancel={() => setSaleModal({ visible: false, sale: {} })}
        footer={[
          <Button key="close" onClick={() => setSaleModal({ visible: false, sale: {} })}>
            ปิด
          </Button>
        ]}
        cancelText="ปิด"
        width={isMobile ? '90vw' : '77vw'}
        style={{ left: isMobile ? 0 : w(7) }}
        destroyOnClose
      >
        <SaleViewer {...{ sale: saleModal.sale, grant: true, readOnly: true }} />
      </Modal>
    </Container>
  );
};
