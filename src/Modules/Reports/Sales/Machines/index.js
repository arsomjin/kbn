import React, { useEffect, useState } from 'react';
import { Form, Modal, Button } from 'antd';
import { columns, saleColumns, modelColumns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { showLog } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import { showWarn } from 'functions';
import { checkDoc } from 'firebase/api';
import SaleViewer from 'Modules/Sales/Vehicles/SaleViewer';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import SaleTypeSelector from 'components/SaleTypeSelector';
import CommonSelector from 'components/CommonSelector';
import { VehicleType } from 'data/Constant';

export default ({ saleArr, saleItems, salesPerson, saleModels, onSaleSelected }) => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [initItems] = useState(
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

  const _getData = (searches, arr, items) => {
    setLoading(true);
    let mItems = [];
    let mData = [];
    if (searches.saleType === 'all') {
      mItems = searches.vehicleType !== 'all' ? items.filter(l => l.vehicleType === searches.vehicleType) : items;
      mData = arr;
    } else {
      mItems =
        searches.vehicleType !== 'all'
          ? items.filter(l => l.vehicleType === searches.vehicleType && l.saleType === searches.saleType)
          : items.filter(l => l.saleType === searches.saleType);
      mData = arr.filter(l => l.saleType === searches.saleType);
    }

    mData = mData.map((l, id) => ({
      ...l,
      customerName: `${l.firstName} ${l.lastName}`,
      id,
      key: id
    }));
    mItems = mItems.map((l, id) => ({
      ...l,
      id,
      key: id
    }));
    setItems(mItems);
    setData(mData);
    setLoading(false);
  };

  useEffect(() => {
    _getData(searchValues, saleArr, initItems);
  }, [initItems, saleArr, searchValues]);

  const _onValuesChange = val => {
    setSearchValues(val);
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
    modelData = modelData
      .filter(l => l.vehicleType === searchValues.vehicleType)
      .map((l, n) => ({
        ...l,
        key: n,
        id: n
      }));
    // salesData = salesData
    //   .filter((l) => l.vehicleType === searchValues.vehicleType)
    //   .map((l, n) => ({
    //     ...l,
    //     key: n,
    //     id: n,
    //   }));
  }

  return (
    <div>
      <div className="d-flex justify-content-center pt-3">
        <Form.Item label="ประเภทการขาย ">
          <SaleTypeSelector
            placeholder="ประเภทการขาย"
            hasAll
            onChange={saleType => _onValuesChange({ ...searchValues, saleType })}
            defaultValue="all"
            style={{ width: 160 }}
          />
        </Form.Item>
      </div>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        // onUpdate={onUpdate}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={3}
            sumKeys={['qty', 'amtFull', 'total']}
          />
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
      <div className="px-3 bg-white d-flex justify-content-center">
        <Form.Item label="ประเภทสินค้า">
          <CommonSelector
            placeholder="รถ"
            optionData={VehicleType}
            defaultValue="all"
            hasAll
            onChange={vehicleType => _onValuesChange({ ...searchValues, vehicleType })}
            style={{ width: 160 }}
          />
        </Form.Item>
      </div>
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
        <SaleViewer
          {...{
            sale: saleModal.sale,
            grant: true,
            readOnly: true,
            editables: { saleType: true, address: true, amtReceived: true }
          }}
        />
      </Modal>
    </div>
  );
};
