import { Form } from 'antd';
import { TableSummary } from 'api/Table';
import { getRules } from 'api/Table';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import Toggles from 'components/Toggles';
import { DatePicker } from 'elements';
import { Input, InputGroup } from 'elements';
import { getItemId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import React from 'react';
import { Row, Col } from 'shards-react';
import TransferItems from './TransferItems';

export const InitItem = {
  vehicleType: null,
  vehicleItemType: 'vehicle',
  productName: '',
  productCode: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  pressureBladeNo: [],
  bucketNo: [],
  sugarcanePickerNo: [],
  giveaways: [],
  detail: '',
  qty: 1,
  completed: null,
  rejected: null,
  cancelled: null,
  deleted: null,
  toDestination: null
};

export const getInitialItems = (order, branchCode) => [
  {
    ...InitItem,
    deliverItemId: getItemId('WH-VH'),
    deliverId: order?.deliverId,
    fromOrigin: branchCode,
    branchCode,
    toDestination: null,
    isUsed: order?.isUsed || false
  }
];

const InitValue = {
  date: dayjs().format('YYYY-MM-DD'),
  docNo: null,
  deliverType: 'branchDelivery',
  fromOrigin: null,
  toDestination: null,
  deliveredBy: null,
  deliveredDate: undefined,
  recordedBy: null,
  recordedDate: undefined,
  remark: null,
  isUsed: false
};

export const getInitialValues = (user, order) => {
  if (order && order.created) {
    return {
      ...InitValue,
      ...order
    };
  }
  let mBranch = order && order.fromOrigin ? order.fromOrigin : user.homeBranch || (user?.allowedBranches?.[0]) || '0450';
  return {
    ...InitValue,
    deliverId: order?.deliverId,
    items: getInitialItems(order, mBranch),
    fromOrigin: mBranch,
    branchCode: mBranch
  };
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่ส่งสินค้า',
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
    dataIndex: 'fromOrigin',
    align: 'center'
    // editable: true,
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'toDestination',
    align: 'center'
    // editable: true,
  },
  {
    title: 'ผู้แจ้ง',
    dataIndex: 'recordedBy',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'ส่งสินค้าโดย',
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

export const renderInput = (values, form) => {
  return (
    <div className="bg-white">
      <div className="px-3 bg-white border mb-3 pt-4">
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
              name="fromOrigin"
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
          <Col md="4">
            <Form.Item
              name="toDestination"
              rules={[
                {
                  required: ['sold', 'deliver'].includes(values.deliverType),
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore={'สาขาปลายทาง'} branch />
            </Form.Item>
          </Col>
        </Row>
        <Row form>
          <Col md="2">
            <h6>ประเภทสินค้า</h6>
          </Col>
          <Col md="4">
            <Form.Item name="isUsed">
              <Toggles
                buttons={[
                  { label: 'ใหม่', value: false },
                  { label: 'มือสอง', value: true }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <TransferItems
        items={values.items}
        deliverId={values.deliverId}
        onChange={dat => form.setFieldsValue({ items: dat })}
        grant={true}
      />
      <div className="border mt-3 p-3 bg-light">
        <label className="text-muted">ข้อมูลการนัดหมาย</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item name="fromOrigin">
              <InputGroup spans={[10, 14]} addonBefore="สาขา" branch />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="deliveredBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้ส่งสินค้า"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col md="6">
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
