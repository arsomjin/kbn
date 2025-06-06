import { Form } from 'antd';
import { TableSummary } from 'api/Table';
import { getRules } from 'api/Table';
import DocSelector from 'components/DocSelector';
import EditableCellTable from 'components/EditableCellTable';
import EmployeeSelector from 'components/EmployeeSelector';
import { DatePicker, Input, InputGroup } from 'elements';
import { checkCollection } from 'firebase/api';
import { checkDoc } from 'firebase/api';
import { getItemId } from 'Modules/Account/api';
import moment from 'moment';
import React from 'react';
import { Row, Col } from 'shards-react';
import ImportList from './ImportList';
import { arrayForEach } from 'functions';
import Toggles from 'components/Toggles';
import { formatValuesBeforeLoad } from 'functions';
import { showLog } from 'functions';
import { queryNonDeletedDocuments } from 'utils';

export const statusSnap = {
  completed: null,
  rejected: null,
  cancelled: null,
  deleted: null
};

export const getInitialItems = (order, branchCode) => [
  {
    transferItemId: getItemId('WH-VEH'),
    transferId: order?.transferId,
    vehicleItemType: 'vehicle',
    productName: '',
    productCode: '',
    vehicleType: null,
    vehicleNo: [],
    peripheralNo: [],
    engineNo: [],
    detail: '',
    qty: 1,
    ...statusSnap,
    _key: '',
    origin: null,
    toDestination: branchCode,
    isUsed: order?.isUsed || false
  }
];

const InitValue = {
  importDate: moment().format('YYYY-MM-DD'),
  exportDate: undefined,
  docNo: null,
  transferType: 'transfer',
  fromOrigin: null,
  toDestination: null,
  deliveredBy: null,
  deliveredDate: undefined,
  importRecordedBy: null,
  importRecordedDate: undefined,
  exportRecordedBy: null,
  exportRecordedDate: undefined,
  importVerifiedBy: null,
  importVerifiedDate: undefined,
  exportVerifiedBy: null,
  exportVerifiedDate: undefined,
  approvedBy: null,
  approvedDate: undefined,
  receivedBy: null,
  receivedDate: undefined,
  remark: null,
  isUsed: false,
  acceptance: true
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
    transferId: order?.transferId,
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
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
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
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'origin',
    align: 'center'
    // editable: true,
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'toDestination',
    align: 'center'
  },
  {
    title: 'รับสินค้าโดย',
    dataIndex: 'importRecordedBy',
    ellipsis: true
  },
  {
    title: 'ตรวจสอบสินค้าโดย',
    dataIndex: 'importVerifiedBy',
    ellipsis: true
  },
  {
    title: 'ส่งสินค้าโดย',
    dataIndex: 'deliveredBy',
    ellipsis: true
  },
  {
    title: 'ผู้รับสินค้า',
    dataIndex: 'receivedBy',
    ellipsis: true
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true
  }
];

export const renderInput = (values, form, onSelect, selects) => {
  const isTransfer = values.transferType === 'transfer';
  return (
    <div className="bg-white">
      <div className="px-3 bg-white border mb-3 pt-4">
        <Row>
          <Col md="4">
            {isTransfer && <label className="text-muted">เลขที่เอกสารการโอนสินค้าจากสาขาต้นทาง</label>}
            <Form.Item name="docNo" rules={getRules(['required'])} label="เลขที่เอกสาร">
              <DocSelector
                collection={`sections/stocks/${isTransfer ? 'transfer' : 'vehicles'}`}
                orderBy={['docNo']}
                wheres={
                  isTransfer
                    ? [
                        ['toDestination', '==', values.toDestination],
                        ['transferType', '==', 'transfer'],
                        ['deleted', '==', null],
                        ['completed', '==', null],
                        ['rejected', '==', null]
                      ]
                    : [
                        ['branchCode', '==', values.branchCode],
                        ['deleted', '==', null]
                      ]
                }
                hasKeywords={isTransfer}
                size="small"
                placeholder="เลขที่เอกสารการโอนสินค้าจากสาขาต้นทาง"
              />
            </Form.Item>
          </Col>
          <Col md="4">
            {isTransfer && <label className="text-muted">สาขาต้นทาง</label>}
            <Form.Item name="origin">
              <InputGroup
                spans={[10, 14]}
                addonBefore={isTransfer ? 'สาขา' : 'รับสินค้าจาก'}
                {...(isTransfer && { branch: true })}
                disabled
              />
            </Form.Item>
          </Col>
          <Col md="4">
            <label className="text-muted">{'สาขาปลายทาง'}</label>
            <Form.Item
              name="toDestination"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore={'สาขาปลายทาง'} branch disabled />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <ImportList
        items={values.items}
        onSelect={onSelect}
        // noItemChecked={cState.noItemChecked}
        // reset={reset}
      />
      {/* <TransferItems
        items={values.items}
        transferId={values.transferId}
        onChange={(dat) => form.setFieldsValue({ items: dat })}
        grant={true}
      /> */}
      <div className="px-3 bg-white border mt-3 pt-4">
        <Row form>
          <Col md="2">
            <h6 className="ml-3">การตรวจรับ</h6>
          </Col>
          <Col md="4">
            <Form.Item name="acceptance">
              <Toggles
                buttons={[
                  { label: 'รับสินค้า', value: true },
                  {
                    label: 'ตีกลับ',
                    value: false,
                    ...(!values.acceptance && {
                      style: {
                        backgroundColor: 'red',
                        borderColor: 'red',
                        color: 'white'
                      }
                    })
                  }
                ]}
                disabled={selects.length === 0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="importRecordedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้บันทึก"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="importRecordedDate" rules={getRules(['required'])}>
                  <DatePicker placeholder="วันที่บันทึก" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col md="6">
            <Row>
              <Col md="8">
                <Form.Item name="importVerifiedBy" rules={getRules(['required'])}>
                  <InputGroup
                    spans={[10, 14]}
                    addonBefore="ผู้ตรวจสินค้า"
                    inputComponent={props => <EmployeeSelector {...props} />}
                  />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="importVerifiedDate" rules={getRules(['required'])}>
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
                    disabled
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
    title: '#',
    dataIndex: 'id',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'ประเภทสินค้า',
    dataIndex: 'vehicleType'
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true
  },
  {
    title: 'เลขรถ',
    dataIndex: 'vehicleNo'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo'
  },
  {
    title: 'เลขอุปกรณ์ต่อพ่วง',
    dataIndex: 'peripheralNo'
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
  }
];

export const expandedRowRender = record => {
  return (
    <EditableCellTable
      columns={listColumns}
      dataSource={record.items}
      summary={pageData => (
        <TableSummary pageData={pageData} dataLength={listColumns.length} startAt={6} sumKeys={['qty']} />
      )}
      pagination={false}
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

export const getValuesFromDoc = (val, transferType, form) =>
  new Promise(async (r, j) => {
    try {
      showLog({ val, transferType, form });
      if (transferType === 'transfer') {
        // Use the helper function to query non-deleted documents
        const data = await queryNonDeletedDocuments('sections/stocks/transfer', [
          ['docNo', '==', val],
          ['transferType', '==', 'transfer']
        ]);
        
        showLog({ data });
        if (data.length > 0) {
          let nItems = [];
          // Get item status
          await arrayForEach(data[0]?.items || [], async it => {
            const doc = await checkDoc('sections', `stocks/transferItems/${it.transferItemId}`);
            let mIt = { ...it };
            if (doc) {
              mIt = {
                ...it,
                deleted: doc.data().deleted,
                completed: doc.data().completed,
                rejected: doc.data().rejected,
                cancelled: doc.data().cancelled
              };
            }
            nItems.push(mIt);
          });
          let importDate = form.getFieldValue('importDate');
          let toDestination = form.getFieldValue('toDestination');
          form.setFieldsValue({
            ...formatValuesBeforeLoad(data[0]),
            importDate,
            toDestination,
            items: nItems,
            origin: data[0].fromOrigin
          });
        }
      } else {
        const sDoc = await checkDoc('sections', `stocks/vehicles/${val}`);
        if (sDoc) {
          let doc = sDoc.data();
          doc = formatValuesBeforeLoad(doc);
          form.setFieldsValue({
            peripheralNo: doc.peripheralNo,
            productCode: doc.productCode,
            vehicleNo: doc.vehicleNo
          });
        }
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });
