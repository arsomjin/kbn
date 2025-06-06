import { Form, Radio } from 'antd';
import Text from 'antd/lib/typography/Text';
import { TableSummary } from 'api/Table';
import { getRules } from 'api/Table';
import DocSelector from 'components/DocSelector';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import { Address } from 'components/NameAddress';
import Toggles from 'components/Toggles';
import { InputGroup } from 'elements';
import { Input, DatePicker } from 'elements';
import { getSearchData } from 'firebase/api';
import { getItemId } from 'Modules/Account/api';
import moment from 'moment';
import React from 'react';
import { Row, Col } from 'shards-react';
import DeliverItems from './DeliverItems';

export const InitItem = {
  vehicleType: null,
  vehicleItemType: 'vehicle',
  productCode: null,
  productName: null,
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  pressureBladeNo: [],
  bucketNo: [],
  sugarcanePickerNo: [],
  giveaways: [],
  remark: null,
  saleNo: null,
  saleId: null,
  completed: null,
  rejected: null,
  cancelled: null,
  deleted: null,
  qty: 1
};

export const getInitialItems = (order, branchCode) => [
  {
    ...InitItem,
    deliverItemId: getItemId('PLAN-CUS'),
    deliverId: order?.deliverId,
    branchCode,
    isUsed: order?.isUsed || false
  }
];

export const InitValue = {
  date: moment().format('YYYY-MM-DD'),
  docNo: null,
  deliverType: 'customerDelivery',
  saleDate: undefined,
  saleId: null,
  saleNo: null,
  saleType: null,
  customerId: null,
  customer: null,
  address: {},
  phoneNumber: null,
  salesPerson: [],
  appointmentTime: undefined,
  arrivalTime: undefined,
  hasCalled: false,
  deliveredBy: null,
  deliveredDate: undefined,
  deliveredTime: undefined,
  recordedBy: null,
  recordedDate: undefined
};

export const getInitialValues = (user, order) => {
  if (order && order.created) {
    return {
      ...InitValue,
      ...order
    };
  }
  let mBranch = order && order.branchCode ? order.branchCode : user.branch || '0450';
  return {
    ...InitValue,
    deliverId: order?.deliverId,
    items: getInitialItems(order, mBranch),
    branchCode: mBranch,
    isUsed: order.isUsed || false
  };
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันทีจัดส่ง',
    dataIndex: 'deliveredDate',
    align: 'center'
    // editable: true,
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'สถานะ',
    dataIndex: 'status',
    align: 'center',
    width: 100,
    render: (text, record) => (
      <label
        className={
          record?.completed ? 'text-success' : record?.rejected || record?.deleted ? 'text-danger' : 'text-warning'
        }
      >
        {text}
      </label>
    )
  },
  {
    title: 'ประเภท',
    dataIndex: 'deliverType',
    align: 'center'
    // editable: true,
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'branchCode',
    align: 'center'
    // editable: true,
  },
  {
    title: 'ลูกค้า',
    dataIndex: 'customer'
    // editable: true,
  },
  {
    title: 'ผู้แจ้ง',
    dataIndex: 'recordedBy',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'พนักงานขนส่ง',
    dataIndex: 'deliveredBy',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true
  }
];

export const renderHeader = (values, form) => {
  return (
    <div className="bg-white">
      <div className="">
        <Row>
          <Col md="9">
            <Form.Item
              name="saleNo"
              // label="🔍  เลขที่ใบขายสินค้า/ชื่อลูกค้า"
              label={
                <span role="img" aria-label="search">
                  🔍 <Text className="ml-2">เลขที่ใบขายสินค้า/ชื่อลูกค้า</Text>
                </span>
              }
              rules={getRules(['required'])}
            >
              <DocSelector
                collection="sections/sales/vehicles"
                orderBy={['saleNo', 'firstName']}
                labels={['saleNo', 'firstName', 'lastName']}
                wheres={[
                  ['ivAdjusted', '==', false],
                  ['branchCode', '==', values.branchCode]
                ]}
                size="small"
                hasKeywords
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {/* <Col md="4">
            <Form.Item name="date" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="วันที่เอกสาร"
                inputComponent={(props) => <DatePicker {...props} />}
              />
            </Form.Item>
          </Col> */}
          <Col md="4">
            <Form.Item name="docNo" rules={getRules(['required'])}>
              <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item
              name="branchCode"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore={'สาขาต้นทาง'} branch disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <Form.Item name="customer" rules={getRules(['required'])}>
              <InputGroup spans={[10, 14]} addonBefore={'ลูกค้า'} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="phoneNumber" label="เบอร์โทร" rules={getRules(['required', 'mobileNumber'])}>
              <Input mask="111-1111111" placeholder="012-3456789" />
            </Form.Item>
          </Col>
        </Row>
        <div className="px-3 pt-3 bg-light mb-3">
          <Address address={values.address} />
        </div>
        <Row form>
          <Col md="4">
            <Form.Item name="saleType">
              <InputGroup spans={[10, 14]} addonBefore="ประเภทการขาย" placeholder="ประเภทการขาย" saleType disabled />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="isUsed">
              <InputGroup
                spans={[10, 14]}
                addonBefore="ประเภทสินค้า"
                placeholder="ประเภทสินค้า"
                inputComponent={props => (
                  <Toggles
                    buttons={[
                      { label: 'ใหม่', value: false },
                      { label: 'มือสอง', value: true }
                    ]}
                    disabled
                    {...props}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <DeliverItems
        items={values.items}
        deliverId={values.deliverId}
        onChange={dat => form.setFieldsValue({ items: dat })}
        grant={false}
      />
      <div className="border mt-3 p-3 bg-light">
        <label className="text-muted">ข้อมูลการนัดหมาย</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item name="branchCode">
              <InputGroup spans={[10, 14]} addonBefore="สาขา" branch />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="deliveredBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="พนักงานขนส่ง"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col md="3">
            <Form.Item
              name="deliveredDate"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="วันที่จัดส่ง"
                placeholder="วันที่จัดส่ง"
                inputComponent={props => <DatePicker {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item
              name="deliveredTime"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลาจัดส่ง"
                placeholder="เวลาจัดส่ง"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="arrivalTime">
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลาถึง"
                placeholder="เวลาถึง"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="appointmentTime">
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลานัดหมาย"
                placeholder="เวลานัดหมาย"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="hasCalled" className="border">
              <InputGroup
                spans={[10, 14]}
                addonBefore="โทรนัดหมาย"
                inputComponent={props => (
                  <Radio.Group className="px-3" {...props}>
                    <Radio value={true}>โทรแล้ว</Radio>
                    <Radio value={false}>ยังไม่โทร</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="recordedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้แจ้ง"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="recordedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่แจ้ง" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="remark" label="หมายเหตุ" className="d-flex flex-row">
              <Input placeholder="หมายเหตุ" className="ml-3" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const listColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType'
    // editable: true,
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
    // editable: true,
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
    // editable: true,
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo'
    // editable: true,
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo'
    // editable: true,
  },
  {
    title: 'เลขอุปกรณ์ต่อพ่วง',
    dataIndex: 'peripheralNo'
    // editable: true,
  },
  {
    title: 'เลขใบดัน',
    dataIndex: 'pressureBladeNo'
    // editable: true,
  },
  {
    title: 'หมายเลขบุ้งกี๋',
    dataIndex: 'bucketNo'
    // editable: true,
  },
  {
    title: 'หมายเลขคีบอ้อย',
    dataIndex: 'sugarcanePickerNo'
    // editable: true,
  }
];

export const ExpandedRowRender = (record, onUpdate) => {
  const _onUpdate = async row => {
    let mRow = { ...row };
    let mRecord = { ...record };
    let mItems = [...mRecord.items];
    const index = mItems.findIndex(item => mRow.key === item.key);
    const item = mItems[index];
    mItems.splice(index, 1, { ...item, ...mRow });
    mRecord.items = mItems;
    onUpdate(mRecord);
  };

  return (
    <EditableCellTable
      columns={listColumns}
      dataSource={record.items}
      onUpdate={_onUpdate}
      summary={pageData => (
        <TableSummary pageData={pageData} dataLength={listColumns.length} startAt={3} sumKeys={['qty']} />
      )}
      pagination={false}
      disabled
      readOnly
      rowClassName={(record, index) => {
        //  showLog({ record });
        return record?.deleted
          ? 'deleted-row'
          : record?.completed
            ? 'recorded-row'
            : record?.rejected
              ? 'rejected-row'
              : 'editable-row';
      }}
    />
  );
};

export const getValues = (saleNo, branch, date, form, setItems) =>
  new Promise(async (r, j) => {
    try {
      let mData = await getSearchData('sections/sales/vehicles', { saleNo, branchCode: branch }, ['saleNo', 'date']);
      mData = mData.filter(l => !l.deleted);
      if (mData.length > 0) {
        if (mData[0]?.items && mData[0].items.length > 0) {
          let deliverId = form.getFieldValue('deliverId');
          setItems(mData[0].items);
          let arr = mData[0].items.map((it, id) => {
            if (!it.ivAdjusted) {
              return {
                ...InitItem,
                vehicleType: it.vehicleType || null,
                vehicleItemType: it.vehicleItemType || null,
                giveaways: it.giveaways || [],
                remark: it.remark || null,
                completed: typeof it.completed !== 'undefined' ? it.completed : null,
                rejected: typeof it.rejected !== 'undefined' ? it.rejected : null,
                cancelled: typeof it.cancelled !== 'undefined' ? it.cancelled : null,
                deleted: typeof it.deleted !== 'undefined' ? it.deleted : null,
                productCode: it.productCode,
                productName: it.productName,
                vehicleNo: it?.vehicleNo ? (Array.isArray(it.vehicleNo) ? it.vehicleNo : it.vehicleNo.split(',')) : [],
                peripheralNo: it?.peripheralNo
                  ? Array.isArray(it.peripheralNo)
                    ? it.peripheralNo
                    : it.peripheralNo.split(',')
                  : [],
                engineNo: it?.engineNo ? (Array.isArray(it.engineNo) ? it.engineNo : it.engineNo.split(',')) : [],
                pressureBladeNo: it?.pressureBladeNo
                  ? Array.isArray(it.pressureBladeNo)
                    ? it.pressureBladeNo
                    : it.pressureBladeNo.split(',')
                  : [],
                bucketNo: it?.bucketNo ? (Array.isArray(it.bucketNo) ? it.bucketNo : it.bucketNo.split(',')) : [],
                sugarcanePickerNo: it?.sugarcanePickerNo
                  ? Array.isArray(it.sugarcanePickerNo)
                    ? it.sugarcanePickerNo
                    : it.sugarcanePickerNo.split(',')
                  : [],
                saleNo: it.saleNo,
                saleId: it.saleId,
                saleItemId: it.saleItemId,
                qty: it.qty,
                id,
                key: id,
                deliverItemId: getItemId('PLAN-CUS'),
                deliverId,
                branchCode: branch,
                isUsed: it?.isUsed || false
              };
            }
            return null;
          });
          form.setFieldsValue({
            ...InitValue,
            saleDate: mData[0].date,
            saleId: mData[0].saleId,
            saleNo: mData[0].saleNo,
            saleType: mData[0].saleType,
            customerId: mData[0].customerId,
            customer: mData[0].customer || `${mData[0].prefix}${mData[0].firstName} ${mData[0].lastName}`.trim(),
            address: mData[0].address || {},
            phoneNumber: mData[0].phoneNumber || null,
            salesPerson: mData[0].salesPerson,
            isUsed: mData[0].isUsed || false,
            items: arr,
            date
          });
          // setData(arr);
        }
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });
