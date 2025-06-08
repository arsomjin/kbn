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
import ExportItems from './ExportItems';

export const InitItem = {
  vehicleType: null,
  vehicleItemType: 'vehicle',
  productName: '',
  productCode: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  detail: '',
  qty: 1,
  completed: null,
  rejected: null,
  cancelled: null,
  deleted: null,
  destination: null
};

export const getInitialItems = (order, branchCode) => [
  {
    ...InitItem,
    exportItemId: getItemId('WH-VH'),
    exportId: order?.exportId,
    fromOrigin: branchCode,
    branchCode,
    destination: null,
    isUsed: order?.isUsed || false
  }
];

const InitValue = {
  exportDate: dayjs().format('YYYY-MM-DD'),
  importDate: undefined,
  docNo: null,
  transferType: 'other',
  fromOrigin: null,
  destination: null,
  deliveredBy: null,
  deliveredDate: undefined,
  exportRecordedBy: null,
  exportRecordedDate: undefined,
  exportVerifiedBy: null,
  exportVerifiedDate: undefined,
  approvedBy: null,
  approvedDate: undefined,
  receivedBy: null,
  receivedDate: undefined,
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
  let mBranch = order && order.fromOrigin ? order.fromOrigin : user.branch || '0450';
  return {
    ...InitValue,
    exportId: order?.exportId,
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
    title: 'วันที่',
    dataIndex: 'exportDate',
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
    dataIndex: 'transferType',
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
    dataIndex: 'destination',
    align: 'center',
    width: 180
    // editable: true,
  },
  {
    title: 'จ่ายสินค้าโดย',
    dataIndex: 'exportRecordedBy',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'ตรวจสอบสินค้าโดย',
    dataIndex: 'exportVerifiedBy',
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
    title: 'ผู้รับสินค้า',
    dataIndex: 'receivedBy',
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
            <Form.Item name="destination" rules={getRules(['required'])}>
              <InputGroup spans={[10, 14]} addonBefore="ปลายทาง" />
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
        {['sold'].includes(values.transferType) && (
          <Row>
            <Col md="6">
              <Form.Item name="saleType">
                <InputGroup
                  spans={[10, 14]}
                  addonBefore="ประเภทการขาย"
                  placeholder="ประเภทการขาย"
                  alignRight
                  saleType
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </div>
      <ExportItems
        items={values.items}
        exportId={values.exportId}
        onChange={dat => form.setFieldsValue({ items: dat })}
        grant={true}
      />
      <div className="px-3 bg-white border mt-3 pt-4">
        <Row>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="exportRecordedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้ออกบิล"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="exportRecordedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่ออกบิล" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="exportVerifiedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้ตรวจสินค้า"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="exportVerifiedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่ตรวจสินค้า" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="deliveredBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="พนักงานขนส่ง"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="deliveredDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่ขนส่ง" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="receivedBy" rules={getRules(['required'])}>
                  <InputGroup spans={[10, 14]} addonBefore="ผู้รับสินค้า" />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="receivedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่รับสินค้า" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="remark" label="หมายเหตุ">
              <Input placeholder="หมายเหตุ" />
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
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
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
        <TableSummary pageData={pageData} dataLength={listColumns.length} startAt={6} sumKeys={['qty']} />
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
