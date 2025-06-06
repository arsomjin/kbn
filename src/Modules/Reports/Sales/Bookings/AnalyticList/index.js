import React, { useEffect, useState } from 'react';
import { Collapse, Form, Modal } from 'antd';
import { columns, saleColumns, modelColumns, asColumns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { showLog } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import BookViewer from 'Modules/Sales/Booking/BookViewer';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { Button } from 'elements';
import { checkDoc } from 'firebase/api';
import { showWarn } from 'functions';
import moment from 'moment';
import { ListItem } from 'elements';
import SaleTypeSelector from 'components/SaleTypeSelector';
import CommonSelector from 'components/CommonSelector';
import { VehicleType } from 'data/Constant';

export default ({ saleItems, salesPerson, saleModels, sales, onSaleSelected }) => {
  showLog({ saleItems });
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
    _getData(searchValues, sales, initItems);
  }, [initItems, sales, searchValues]);

  const _onValuesChange = val => {
    setSearchValues(val);
  };

  const handleSelect = async record => {
    try {
      // Get order by record id.
      // showLog({ record });

      if (record?.deleted) {
        return showLog(`${record.bookId} has been deleted.`);
      }
      const saleDoc = await checkDoc('sections', `sales/bookings/${record.bookId}`);
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

  showLog({ data, salesData, modelData });

  const expandedRowRender = record => {
    if (record.assessment) {
      let assessment = { ...record.assessment };
      delete assessment.editedBy;
      return (
        <div className="bg-light bordered pb-1">
          {Object.keys(assessment).map((k, i) => {
            let label;
            let info = assessment[k];
            switch (k) {
              case 'date':
                label = 'วันที่ประเมิน';
                info = moment(info, 'YYYY-MM-DD').format('DD MMM YYYY');
                break;
              case 'result':
                label = 'ผลการประเมิน';
                info = info ? 'ผ่าน' : 'ไม่ผ่าน';
                break;
              case 'details':
                label = 'เหตุผล';
                break;

              default:
                label = 'เหตุผล';
                break;
            }
            return <ListItem key={i} label={label} info={info} />;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="d-flex justify-content-center pt-3">
        <Form.Item label="ประเภทการขาย">
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
            startAt={4}
            sumKeys={['qty', 'amtReceived', 'amtFull']}
          />
        )}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        hasChevron
      />
      <Collapse className="mb-3">
        <Collapse.Panel header="เรียงตามผลงาน" key="1">
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
        </Collapse.Panel>
      </Collapse>
      <Collapse className="mb-3">
        <Collapse.Panel header="เรียงตามรุ่น" key="1">
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
        </Collapse.Panel>
      </Collapse>
      <Collapse className="mb-3">
        <Collapse.Panel header="ผลการประเมิน" key="1">
          <EditableCellTable
            dataSource={sales}
            columns={asColumns}
            // onUpdate={onUpdate}
            loading={loading}
            expandable={{
              expandedRowRender,
              rowExpandable: record => record.assessmentResult !== 'N/A'
            }}
          />
        </Collapse.Panel>
      </Collapse>
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
        <BookViewer
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
