import React, { useCallback, useState } from 'react';
import { Select, Modal, Form, Input } from 'antd';
import { Input as EInput } from 'elements';
import PrefixAnt from './PrefixAnt';
import BankNameSelector from './BankNameSelector';
import { Provinces } from 'constants/thaiTambol';
import { getAmphoesFromProvince } from 'constants/thaiTambol';
import { getTambols } from 'constants/thaiTambol';
import { getPostcodeFromProvince } from 'constants/thaiTambol';
import { getPostcodeFromProvinceAndAmphoe } from 'constants/thaiTambol';
import { showConfirm } from 'utils/functions';
import DealerSelector from './DealerSelector';
import { useSelector } from 'react-redux';
const { Option } = Select;

const initialValues = {
  dealerPrefix: null,
  dealerName: null,
  dealerCode: null,
  dealerId: null,
  dealerType: 'dealer',
  dealerHeadOffice: 0,
  dealerTaxNumber: null,
  dealerAddress: null,
  dealerTambol: null,
  dealerAmphoe: null,
  dealerProvince: null,
  dealerPostcode: null,
  dealerBank: null,
  dealerBankName: null,
  dealerBankType: 'saving',
  dealerBankAccNo: null,
};

const DealerDetails = ({ onOk, onCancel, visible, ...props }) => {
  const { dealers } = useSelector((state) => state.data);
  const [localPrefix, setLocalPrefix] = useState(null);
  const [localProvince, setLocalProvince] = useState(null);
  const [amphoes, setAmphoes] = useState([]);
  const [tambols, setTambols] = useState([]);
  const [postcodes, setPostcodes] = useState([]);
  const [type, setType] = useState('add');

  const [dealerForm] = Form.useForm();

  const onConfirm = useCallback(
    (values) => {
      //  showLog({ values });
      dealerForm.resetFields();
      onOk && onOk(values, type);
    },
    [dealerForm, onOk, type],
  );

  const onPreConfirm = useCallback(
    (values) => {
      showConfirm(
        () => onConfirm(values),
        `${type === 'add' ? 'สร้าง' : 'บันทึก'}รายชื่อผู้จำหน่าย/ผู้รับเงิน ${values.dealerName}`,
      );
    },
    [onConfirm, type],
  );

  const onPrefixChange = (pf) => {
    //  showLog({ pf });
    setLocalPrefix(pf);
    dealerForm.setFieldsValue({ dealerPrefix: pf });
  };

  const onProvinceChange = (pv) => {
    //  showLog({ pv });
    dealerForm.setFieldsValue({ dealerProvince: pv });
    setLocalProvince(pv);
    let fAmphoes = getAmphoesFromProvince(pv);
    setAmphoes(fAmphoes);
    let pc = getPostcodeFromProvince(pv);
    setPostcodes(pc);
  };

  const onAmphoeChange = (ap) => {
    //  showLog({ ap });
    dealerForm.setFieldsValue({ dealerAmphoe: ap });
    let fTambols = getTambols(ap);
    setTambols(fTambols);
    let pc = getPostcodeFromProvinceAndAmphoe(localProvince, ap);
    setPostcodes(pc);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const onSelect = (dl) => {
    //  showLog({ dl });
    const dealer = { ...initialValues, ...dealers[dl] };
    dealerForm.setFieldsValue(dealer);
    setLocalPrefix(dealer.dealerPrefix);
  };

  const ProvinceOptions = Provinces().map((p) => (
    <Option key={p.p} value={p.p}>
      {p.p}
    </Option>
  ));

  const AmphoeOptions = amphoes.map((p) => (
    <Option key={p.a} value={p.a}>
      {p.a}
    </Option>
  ));

  const TambolOptions = tambols.map((p) => (
    <Option key={p.d} value={p.d}>
      {p.d}
    </Option>
  ));

  const PostcodeOptions = postcodes.map((p) => (
    <Option key={p.z} value={p.z}>
      {p.z}
    </Option>
  ));

  const isInstitution = ['หจก.', 'บจก.', 'บมจ.', 'ร้าน'].includes(localPrefix);

  return (
    <Modal
      title="ผู้จำหน่าย/ผู้รับเงิน"
      visible={visible}
      onOk={() => {
        dealerForm
          .validateFields()
          .then((values) => {
            onPreConfirm(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText={type === 'add' ? 'สร้างรายชื่อ' : type === 'edit' ? 'บันทึก' : 'ลบ'}
      cancelText="ยกเลิก"
      okType={type === 'delete' ? 'danger' : 'primary'}
    >
      <Form form={dealerForm} layout="horizontal" initialValues={initialValues}>
        <Form.Item name="dealerId" noStyle>
          <EInput type="hidden" />
        </Form.Item>
        {/* <Radio.Group value={type} onChange={handleTypeChange} className="mb-3">
          <Radio.Button value="add">เพิ่ม</Radio.Button>
          <Radio.Button value="edit">แก้ไข</Radio.Button>
          <Radio.Button value="delete">ลบ</Radio.Button>
        </Radio.Group> */}
        <Input.Group compact>
          <Form.Item
            name="dealerCode"
            rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
            style={{ width: '60%' }}
          >
            {type === 'add' ? (
              <EInput placeholder="รหัสผู้จำหน่าย" />
            ) : (
              <DealerSelector onChange={onSelect} noAddable />
            )}
          </Form.Item>
          <Form.Item name="dealerType" style={{ width: '40%' }}>
            <Select placeholder="ประเภท">
              <Option key="dealer" value="dealer">
                ผู้จำหน่าย
              </Option>
              <Option key="receiver" value="receiver">
                ผู้รับเงิน
              </Option>
            </Select>
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <Form.Item
            name="dealerPrefix"
            // rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
            style={{ width: '25%' }}
          >
            <PrefixAnt placeholder="คำนำหน้า" onChange={onPrefixChange} />
          </Form.Item>
          <Form.Item
            name="dealerName"
            rules={[{ required: true, message: 'กรุณาป้อนชื่อผู้จำหน่าย' }]}
            style={{ width: isInstitution ? '75%' : '35%' }}
          >
            <EInput placeholder="ขื่อ" />
          </Form.Item>
          {!isInstitution && (
            <Form.Item
              name="dealerLastName"
              // rules={[
              //   { required: !isInstitution, message: 'กรุณาป้อนนามสกุล' },
              // ]}
              style={{ width: '40%' }}
            >
              <EInput placeholder="นามสกุล" />
            </Form.Item>
          )}
        </Input.Group>
        <Input.Group compact>
          <Form.Item
            name="dealerTaxNumber"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  let tVal = value.replace(/(\r\n|\n|\r| |-)/g, '');
                  if (tVal.length === 13) {
                    return Promise.resolve();
                  }
                  return Promise.reject('เลขประจำตัวผู้เสียภาษี 13 หลัก');
                },
              }),
            ]}
            style={{ width: '60%' }}
          >
            <EInput placeholder="เลขประจำตัวผู้เสียภาษี" />
          </Form.Item>
          <Form.Item name="dealerHeadOffice" style={{ width: '40%' }}>
            <Select placeholder="สำนักงาน/สาขาเลขที่">
              <Option key="0" value={0}>
                สำนักงานใหญ่ (0)
              </Option>
              <Option key="1" value={1}>
                สาขา (1)
              </Option>
            </Select>
          </Form.Item>
        </Input.Group>
        <label>บัญชีธนาคาร</label>
        <Input.Group compact>
          <Form.Item name="dealerBank" style={{ width: '30%' }}>
            <BankNameSelector />
          </Form.Item>
          <Form.Item name="dealerBankType" style={{ width: '30%' }}>
            <Select placeholder="สำนักงาน/สาขาเลขที่">
              <Option key="saving" value="saving">
                ออมทรัพย์
              </Option>
              <Option key="current" value="current">
                ฝากประจำ
              </Option>
            </Select>
          </Form.Item>
          <Form.Item name="dealerBankAccNo" style={{ width: '40%' }}>
            <EInput placeholder="กรุณาป้อน เลขบัญชีธนาคาร" />
          </Form.Item>
        </Input.Group>
        <Form.Item name="dealerBankName">
          <EInput placeholder="ชื่อบัญชี" />
        </Form.Item>
        <label>ที่อยู่</label>
        <Form.Item name="dealerAddress">
          <EInput placeholder="ที่อยู่" />
        </Form.Item>
        <Input.Group compact>
          <Form.Item name="dealerProvince" style={{ width: '50%' }}>
            <Select
              showSearch
              placeholder={'จังหวัด'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              onChange={onProvinceChange}
            >
              <Option key="นครราชสีมา1" value="นครราชสีมา">
                นครราชสีมา
              </Option>
              {ProvinceOptions}
            </Select>
          </Form.Item>
          <Form.Item name="dealerAmphoe" style={{ width: '50%' }}>
            <Select
              showSearch
              placeholder={'อำเภอ/เขต'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              onChange={onAmphoeChange}
            >
              {AmphoeOptions}
            </Select>
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <Form.Item name="dealerTambol" style={{ width: '50%' }}>
            <Select
              showSearch
              placeholder={'ตำบล/แขวง'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {TambolOptions}
            </Select>
          </Form.Item>
          <Form.Item name="dealerPostcode" style={{ width: '50%' }}>
            <Select
              showSearch
              placeholder={'รหัสไปรษณีย์'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {PostcodeOptions}
            </Select>
          </Form.Item>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default DealerDetails;
