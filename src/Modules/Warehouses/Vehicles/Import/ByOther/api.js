import { Form } from 'antd';
import Text from 'antd/lib/typography/Text';
import { TableSummary } from 'api/Table';
import { getRules } from 'api/Table';
import CommonSelector from 'components/CommonSelector';
import DocSelector from 'components/DocSelector';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import Toggles from 'components/Toggles';
import { OtherVehicleImportType } from 'data/Constant';
import { DatePicker } from 'elements';
import { Input, InputGroup } from 'elements';
import { getItemId } from 'Modules/Account/api';
import dayjs from 'dayjs';
import React from 'react';
import { Row, Col } from 'shards-react';
import ImportItems from './ImportItems';

export const InitItem = {
  vehicleType: null,
  vehicleItemType: 'vehicle',
  productName: '',
  productCode: '',
  vehicleNo: [],
  peripheralNo: [],
  engineNo: [],
  detail: '',
  completed: null,
  rejected: null,
  cancelled: null,
  deleted: null,
  toDestination: null,
  year: undefined,
  model: null,
  workHours: null,
  unitPrice: 0,
  qty: 1,
  total: 0
};

export const getInitialItems = (order, branchCode) => [
  {
    ...InitItem,
    importItemId: getItemId('WH-VH'),
    importId: order?.importId,
    origin: null,
    branchCode,
    toDestination: branchCode,
    isUsed: order?.isUsed || false
  }
];

const InitValue = {
  importDate: dayjs().format('YYYY-MM-DD'),
  docNo: null,
  transferType: 'other',
  subType: null,
  origin: null,
  toDestination: null,
  deliveredBy: null,
  deliveredDate: undefined,
  recordedBy: null,
  recordedDate: undefined,
  verifiedBy: null,
  verifiedDate: undefined,
  approvedBy: null,
  approvedDate: undefined,
  receivedBy: null,
  receivedDate: undefined,
  remark: null,
  isUsed: false,
  saleNo: null,
  saleId: null,
  customer: null,
  customerId: null
};

export const getInitialValues = (user, order) => {
  if (order && order.created) {
    return {
      ...InitValue,
      ...order
    };
  }
  let mBranch = order && order.toDestination ? order.toDestination : user.branch || '0450';
  return {
    ...InitValue,
    importId: order?.importId,
    items: getInitialItems(order, mBranch),
    toDestination: mBranch
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
    dataIndex: 'importDate',
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
    title: 'ประเภทการรับเข้า',
    dataIndex: 'subType',
    align: 'center',
    width: 120
    // editable: true,
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'origin',
    align: 'center',
    width: 180
    // editable: true,
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'toDestination',
    align: 'center'
    // editable: true,
  },
  {
    title: 'จ่ายสินค้าโดย',
    dataIndex: 'recordedBy',
    ellipsis: true
    // editable: true,
  },
  {
    title: 'ตรวจสอบสินค้าโดย',
    dataIndex: 'verifiedBy',
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
              name="origin"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore={'ต้นทาง'} rules={getRules(['required'])} />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="toDestination" rules={getRules(['required'])}>
              <InputGroup spans={[10, 14]} addonBefore="สาขาที่รับเข้า" branch />
            </Form.Item>
          </Col>
        </Row>
        <Row form>
          <Col md="4">
            <Form.Item name="isUsed" label="ประภทสินค้า">
              <Toggles
                buttons={[
                  { label: 'ใหม่', value: false },
                  { label: 'มือสอง', value: true }
                ]}
              />
            </Form.Item>
          </Col>
          <Col md="4">
            <Form.Item name="subType" rules={getRules(['required'])} label="ประเภทการรับ">
              <CommonSelector
                optionData={OtherVehicleImportType}
                placeholder="ประเภทการรับรถ"
                className="text-primary"
              />
            </Form.Item>
          </Col>
        </Row>
        {['turnOver'].includes(values.subType) && (
          <Row>
            <Col md="8">
              <Form.Item
                name="saleNo"
                label={
                  <span role="img" aria-label="search">
                    🔍 <Text className="ml-2">เลขที่ใบขาย / ชื่อลูกค้า</Text>
                  </span>
                }
              >
                <DocSelector
                  collection="sections/sales/vehicles"
                  orderBy={['saleNo', 'firstName']}
                  labels={['saleNo', 'firstName', 'lastName']}
                  size="small"
                  hasKeywords
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </div>
      <ImportItems
        items={values.items}
        importId={values.importId}
        onChange={dat => form.setFieldsValue({ items: dat })}
        grant={true}
      />
      <div className="px-3 bg-white border mt-3 pt-4">
        <Row>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="recordedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้ออกบิล"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="recordedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่ออกบิล" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="verifiedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้ตรวจสินค้า"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="verifiedDate" rules={getRules(['required'])}>
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
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้รับสินค้า"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
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
    title: 'ลำดับที่',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType',
    // editable: grant && !readOnly,
    // required: true,
    width: 140
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
    // editable: grant && !readOnly,
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    // editable: grant && !readOnly,
    width: 180,
    ellipsis: true
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    // editable: grant && !readOnly,
    // required: true,
    number: true,
    align: 'right'
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    number: true,
    // editable: grant && !readOnly,
    // required: true,
    align: 'center'
  },
  {
    title: 'ราคา',
    dataIndex: 'total',
    editable: false,
    // required: true,
    number: true,
    align: 'right'
  },
  {
    title: 'ปี',
    dataIndex: 'year',
    // editable: grant && !readOnly,
    width: 100,
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    // editable: grant && !readOnly,
    width: 140,
    align: 'center'
  },
  {
    title: 'ชั่วโมงการทำงาน',
    dataIndex: 'workHours',
    // editable: grant && !readOnly,
    width: 100,
    number: true,
    align: 'center'
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo',
    // editable: grant && !readOnly,
    // required: true,
    ellipsis: true,
    width: 160,
    align: 'center'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo',
    // editable: grant && !readOnly,
    // required: true,
    width: 160,
    align: 'center'
  },
  {
    title: 'เลขอุปกรณ์ต่อพ่วง',
    dataIndex: 'peripheralNo',
    // editable: grant && !readOnly,
    // required: true,
    ellipsis: true,
    width: 160,
    align: 'center'
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
        <TableSummary pageData={pageData} dataLength={listColumns.length} startAt={4} sumKeys={['qty', 'total']} />
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
