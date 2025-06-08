import { Form } from 'antd';
import { getRules } from 'api/Table';
import ArrayInput from 'components/ArrayInput';
import DocSelector from 'components/DocSelector';
import { giveAwayInputColumns } from 'data/Constant';
import { Input } from 'elements';
import { InputGroup } from 'elements';
import { checkDoc } from 'firebase/api';
import { checkCollection } from 'firebase/api';
import { showLog } from 'functions';
import moment from 'moment';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

export const getInitialValues = user => {
  return {
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    date: moment(),
    docNo: null,
    transferType: 'transfer',
    fromOrigin: null,
    productCode: null,
    vehicleNo: null,
    engineNo: null,
    peripheralNo: null,
    pressureBladeNo: null,
    bucketNo: null,
    sugarcanePickerNo: null,
    giveaways: [],
    remark: null
  };
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
  },
  {
    title: 'ประเภทการรับสินค้า',
    dataIndex: 'transferType',
    align: 'center'
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'fromOrigin'
  },
  {
    title: 'รุ่นรถ',
    dataIndex: 'productCode'
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
    title: 'หมายเลขอุปกรณ์ต่อพ่วง',
    dataIndex: 'peripheralNo'
  },
  {
    title: 'เลขใบดัน',
    dataIndex: 'pressureBladeNo'
  },
  {
    title: 'หมายเลขบุ้งกี๋',
    dataIndex: 'bucketNo'
  },
  {
    title: 'หมายเลขคีบอ้อย',
    dataIndex: 'sugarcanePickerNo'
  },
  {
    title: 'ของแถม',
    dataIndex: 'giveaways'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const renderInput = (values, form) => {
  showLog('searchValues', values);
  const isTransfer = values.transferType === 'transfer';
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="docNo" rules={getRules(['required'])} label="เลขที่เอกสาร">
            <DocSelector
              collection={`sections/stocks/${isTransfer ? 'transferOut' : 'importVehicles'}`}
              orderBy="docNo"
              wheres={
                isTransfer
                  ? [
                      ['toDestination', '==', values.branchCode],
                      ['transferType', '==', 'transfer'],
                      ['deleted', '==', false],
                      ['completed', '==', false]
                    ]
                  : [['branchCode', '==', values.branchCode]]
              }
              size="small"
              hasKeywords={isTransfer}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item
            name="fromOrigin"
            rules={[
              {
                required: true,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
            <InputGroup
              spans={[10, 14]}
              addonBefore={isTransfer ? 'สาขาต้นทาง' : 'รับสินค้าจาก'}
              {...(isTransfer && { branch: true })}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item
            name="productCode"
            rules={[
              {
                required: true,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
            <InputGroup spans={[10, 14]} addonBefore="รุ่นรถ" primary vehicle placeholder="รุ่นรถ" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="vehicleNo">
            <InputGroup spans={[10, 14]} addonBefore="เลขรถ" placeholder="เลขรถ" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="engineNo">
            <InputGroup spans={[10, 14]} addonBefore="เลขเครื่อง" placeholder="เลขเครื่อง" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="peripheralNo">
            <InputGroup spans={[10, 14]} addonBefore="หมายเลขอุปกรณ์ต่อพ่วง" placeholder="หมายเลขอุปกรณ์ต่อพ่วง" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="pressureBladeNo">
            <InputGroup spans={[10, 14]} addonBefore="เลขใบดัน" placeholder="เลขใบดัน" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="bucketNo">
            <InputGroup spans={[10, 14]} addonBefore="หมายเลขบุ้งกี๋" placeholder="หมายเลขบุ้งกี๋" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="sugarcanePickerNo">
            <InputGroup spans={[10, 14]} addonBefore="หมายเลขคีบอ้อย" placeholder="หมายเลขคีบอ้อย" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item label="ของแถม">
            <ArrayInput name="giveaways" columns={giveAwayInputColumns} form={form} />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="remark" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </CardBody>
  );
};

export const getValuesFromDoc = (val, transferType, form, branch) =>
  new Promise(async (r, j) => {
    try {
      if (transferType === 'transfer') {
        const sSnap = await checkCollection('sections/stocks/transferOut', [
          ['docNo', '==', val],
          ['transferType', '==', 'transfer'],
          ['toDestination', '==', branch],
          ['deleted', '==', false]
        ]);
        if (sSnap) {
          sSnap.forEach(doc => {
            const {
              bucketNo,
              engineNo,
              giveaways,
              peripheralNo,
              pressureBladeNo,
              remark,
              sugarcanePickerNo,
              productCode,
              vehicleNo
            } = doc.data();
            form.setFieldsValue({
              bucketNo,
              engineNo,
              giveaways,
              peripheralNo,
              pressureBladeNo,
              remark,
              sugarcanePickerNo,
              productCode,
              vehicleNo,
              fromOrigin: doc.data().branchCode
            });
          });
        }
      } else {
        const sDoc = await checkDoc('sections', `stocks/importVehicles/${val}`);
        if (sDoc) {
          const doc = sDoc.data();
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

export const updateTransferOutOrigin = (docNo, api) =>
  new Promise(async (r, j) => {
    try {
      const sSnap = await checkCollection('sections/stocks/transferOut', [
        ['docNo', '==', docNo],
        ['transferType', '==', 'transfer'],
        ['deleted', '==', false]
      ]);
      if (sSnap) {
        let uKey = null;
        sSnap.forEach(doc => {
          uKey = doc.id;
        });
        if (uKey) {
          await api.updateItem(
            {
              completed: true
            },
            'sections/stocks/transferOut',
            uKey
          );
        }
      }
      r(true);
    } catch (e) {
      j(e);
    }
  });
