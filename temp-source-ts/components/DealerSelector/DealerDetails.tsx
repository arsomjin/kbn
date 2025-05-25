import React, { useCallback, useState } from 'react';
import { Select, Modal, Form, Input } from 'antd';
import { Input as EInput } from 'elements';
import PrefixAnt from 'components/PrefixAnt';
import BankNameSelector from 'components/BankNameSelector';
import { Provinces } from 'data/thaiTambol';
import { getAmphoesFromProvince } from 'data/thaiTambol';
import { getTambols } from 'data/thaiTambol';
import { getPostcodeFromProvince } from 'data/thaiTambol';
import { getPostcodeFromProvinceAndAmphoe } from 'data/thaiTambol';
import DealerSelector from './DealerSelector';
import { useSelector } from 'react-redux';
import { Dealer, DealerDetailsProps } from 'types/dealer';
import { useModal } from 'contexts/ModalContext';

const { Option } = Select;

const initialValues: Partial<Dealer> = {
  dealerPrefix: undefined,
  dealerName: undefined,
  dealerCode: undefined,
  dealerId: undefined,
  dealerType: 'dealer',
  dealerHeadOffice: 0,
  dealerTaxNumber: undefined,
  dealerAddress: undefined,
  dealerTambol: undefined,
  dealerAmphoe: undefined,
  dealerProvince: undefined,
  dealerPostcode: undefined,
  dealerBank: undefined,
  dealerBankName: undefined,
  dealerBankType: 'saving',
  dealerBankAccNo: undefined
};

export type DealerFormValues = typeof initialValues & Dealer;

const DealerDetails: React.FC<DealerDetailsProps> = ({ onOk, onCancel, visible }) => {
  const { showConfirm } = useModal();
  const { dealers } = useSelector((state: any) => state.data);
  const [localPrefix, setLocalPrefix] = useState<string | null>(null);
  const [localProvince, setLocalProvince] = useState<string | null>(null);
  const [amphoes, setAmphoes] = useState<Array<{ a: string }>>([]);
  const [tambols, setTambols] = useState<Array<{ d: string }>>([]);
  const [postcodes, setPostcodes] = useState<Array<{ z: string }>>([]);
  const [type, setType] = useState<'add' | 'edit' | 'delete'>('add');

  const [dealerForm] = Form.useForm();

  const onConfirm = useCallback(
    (values: Dealer) => {
      dealerForm.resetFields();
      onOk(values, type);
    },
    [dealerForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: Dealer) => {
      showConfirm({
        onOk: () => onConfirm(values),
        title: `${type === 'add' ? 'สร้าง' : 'บันทึก'}รายชื่อผู้จำหน่าย/ผู้รับเงิน ${values.dealerName}`,
        content: `คุณต้องการ${type === 'add' ? 'สร้าง' : 'บันทึก'}รายชื่อผู้จำหน่าย/ผู้รับเงินนี้หรือไม่?`
      });
    },
    [onConfirm, type]
  );

  const onPrefixChange = (pf: string) => {
    setLocalPrefix(pf);
    dealerForm.setFieldsValue({ dealerPrefix: pf });
  };

  const onProvinceChange = (pv: string) => {
    dealerForm.setFieldsValue({ dealerProvince: pv });
    setLocalProvince(pv);
    let fAmphoes = getAmphoesFromProvince(pv);
    setAmphoes(fAmphoes);
    let pc = getPostcodeFromProvince(pv);
    setPostcodes(pc);
  };

  const onAmphoeChange = (ap: string) => {
    dealerForm.setFieldsValue({ dealerAmphoe: ap });
    let fTambols = getTambols(ap);
    setTambols(fTambols);
    let pc = getPostcodeFromProvinceAndAmphoe(localProvince, ap);
    setPostcodes(pc);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as 'add' | 'edit' | 'delete');
  };

  const onSelect = (value: string | string[]) => {
    const dl = Array.isArray(value) ? value[0] : value;
    const dealer = { ...initialValues, ...dealers[dl] };
    dealerForm.setFieldsValue(dealer);
    setLocalPrefix(dealer.dealerPrefix);
  };

  const ProvinceOptions = (Provinces() as { p: string }[]).map(p => (
    <Option key={p.p} value={p.p}>
      {p.p}
    </Option>
  ));

  const AmphoeOptions = amphoes.map(p => (
    <Option key={p.a} value={p.a}>
      {p.a}
    </Option>
  ));

  const TambolOptions = tambols.map(p => (
    <Option key={p.d} value={p.d}>
      {p.d}
    </Option>
  ));

  const PostcodeOptions = postcodes.map(p => (
    <Option key={p.z} value={p.z}>
      {p.z}
    </Option>
  ));

  const isInstitution = ['หจก.', 'บจก.', 'บมจ.', 'ร้าน'].includes(localPrefix || '');

  return (
    <Modal
      title='ผู้จำหน่าย/ผู้รับเงิน'
      open={visible}
      onOk={() => {
        dealerForm
          .validateFields()
          .then(values => {
            onPreConfirm(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      okText={type === 'add' ? 'สร้างรายชื่อ' : type === 'edit' ? 'บันทึก' : 'ลบ'}
      cancelText='ยกเลิก'
      okType={type === 'delete' ? 'danger' : 'primary'}
    >
      <Form form={dealerForm} layout='horizontal' initialValues={initialValues}>
        <Form.Item name='dealerId' noStyle>
          <EInput type='hidden' />
        </Form.Item>
        <Input.Group compact>
          <Form.Item
            name='dealerCode'
            rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
            style={{ width: '60%' }}
          >
            {type === 'add' ? (
              <EInput placeholder='รหัสผู้จำหน่าย' />
            ) : (
              <DealerSelector onChange={onSelect} noAddable />
            )}
          </Form.Item>
          <Form.Item name='dealerType' style={{ width: '40%' }}>
            <Select placeholder='ประเภท'>
              <Option key='dealer' value='dealer'>
                ผู้จำหน่าย
              </Option>
              <Option key='receiver' value='receiver'>
                ผู้รับเงิน
              </Option>
            </Select>
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <Form.Item name='dealerPrefix' style={{ width: '25%' }}>
            <PrefixAnt placeholder='คำนำหน้า' onChange={onPrefixChange} />
          </Form.Item>
          <Form.Item
            name='dealerName'
            rules={[{ required: true, message: 'กรุณาป้อนชื่อผู้จำหน่าย' }]}
            style={{ width: isInstitution ? '75%' : '35%' }}
          >
            <EInput placeholder='ขื่อ' />
          </Form.Item>
          {!isInstitution && (
            <Form.Item name='dealerLastName' style={{ width: '40%' }}>
              <EInput placeholder='นามสกุล' />
            </Form.Item>
          )}
        </Input.Group>
        <Input.Group compact>
          <Form.Item
            name='dealerTaxNumber'
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
                }
              })
            ]}
            style={{ width: '60%' }}
          >
            <EInput placeholder='เลขประจำตัวผู้เสียภาษี' />
          </Form.Item>
          <Form.Item name='dealerHeadOffice' style={{ width: '40%' }}>
            <Select placeholder='สำนักงาน/สาขาเลขที่'>
              <Option key='0' value={0}>
                สำนักงานใหญ่ (0)
              </Option>
              <Option key='1' value={1}>
                สาขา (1)
              </Option>
            </Select>
          </Form.Item>
        </Input.Group>
        <label>บัญชีธนาคาร</label>
        <Input.Group compact>
          <Form.Item name='dealerBank' style={{ width: '30%' }}>
            <BankNameSelector />
          </Form.Item>
          <Form.Item name='dealerBankType' style={{ width: '30%' }}>
            <Select placeholder='สำนักงาน/สาขาเลขที่'>
              <Option key='saving' value='saving'>
                ออมทรัพย์
              </Option>
              <Option key='current' value='current'>
                ฝากประจำ
              </Option>
            </Select>
          </Form.Item>
          <Form.Item name='dealerBankAccNo' style={{ width: '40%' }}>
            <EInput placeholder='เลขที่บัญชี' />
          </Form.Item>
        </Input.Group>
        <Form.Item name='dealerBankName'>
          <EInput placeholder='ชื่อบัญชี' />
        </Form.Item>
        <label>ที่อยู่</label>
        <Input.Group compact>
          <Form.Item name='dealerAddress' style={{ width: '100%' }}>
            <EInput placeholder='ที่อยู่' />
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <Form.Item name='dealerProvince' style={{ width: '25%' }}>
            <Select placeholder='จังหวัด' onChange={onProvinceChange}>
              {ProvinceOptions}
            </Select>
          </Form.Item>
          <Form.Item name='dealerAmphoe' style={{ width: '25%' }}>
            <Select placeholder='อำเภอ/เขต' onChange={onAmphoeChange}>
              {AmphoeOptions}
            </Select>
          </Form.Item>
          <Form.Item name='dealerTambol' style={{ width: '25%' }}>
            <Select placeholder='ตำบล/แขวง'>{TambolOptions}</Select>
          </Form.Item>
          <Form.Item name='dealerPostcode' style={{ width: '25%' }}>
            <Select placeholder='รหัสไปรษณีย์'>{PostcodeOptions}</Select>
          </Form.Item>
        </Input.Group>
      </Form>
    </Modal>
  );
};

export default DealerDetails;
