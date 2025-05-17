import React, { useCallback, useState } from "react";
import { Select, Modal, Form, Input } from "antd";
import { default as EInput } from "elements/Input";
import PrefixAnt from "../PrefixAnt";
import BankNameSelector from "../BankNameSelector";
import { Provinces } from "data/thaiTambol";
import { getAmphoesFromProvince } from "data/thaiTambol";
import { getTambols } from "data/thaiTambol";
import { getPostcodeFromProvince } from "data/thaiTambol";
import { getPostcodeFromProvinceAndAmphoe } from "data/thaiTambol";
import { showConfirm } from "utils/functions";
import DealerSelector from ".";
import { useSelector } from "react-redux";
import { ThaiTambol } from "data/thaiTambol";
import type { SelectProps } from "antd";

const { Option } = Select;

export interface DealerFormValues {
  dealerPrefix: string | null;
  dealerName: string | null;
  dealerCode: string | null;
  dealerId: string | null;
  dealerType: "dealer" | "receiver";
  dealerHeadOffice: number;
  dealerTaxNumber: string | null;
  dealerAddress: string | null;
  dealerTambol: string | null;
  dealerAmphoe: string | null;
  dealerProvince: string | null;
  dealerPostcode: string | null;
  dealerBank: string | null;
  dealerBankName: string | null;
  dealerBankType: "saving" | "current";
  dealerBankAccNo: string | null;
  dealerLastName?: string | null;
}

interface DealerDetailsProps {
  onOk: (values: DealerFormValues, type: "add" | "edit" | "delete") => void;
  onCancel: () => void;
  visible: boolean;
}

const initialValues: DealerFormValues = {
  dealerPrefix: null,
  dealerName: null,
  dealerCode: null,
  dealerId: null,
  dealerType: "dealer",
  dealerHeadOffice: 0,
  dealerTaxNumber: null,
  dealerAddress: null,
  dealerTambol: null,
  dealerAmphoe: null,
  dealerProvince: null,
  dealerPostcode: null,
  dealerBank: null,
  dealerBankName: null,
  dealerBankType: "saving",
  dealerBankAccNo: null
};

const DealerDetails: React.FC<DealerDetailsProps> = ({ onOk, onCancel, visible }) => {
  const { dealers } = useSelector((state: any) => state.data);
  const [localPrefix, setLocalPrefix] = useState<string | null>(null);
  const [localProvince, setLocalProvince] = useState<string | null>(null);
  const [amphoes, setAmphoes] = useState<ThaiTambol[]>([]);
  const [tambols, setTambols] = useState<ThaiTambol[]>([]);
  const [postcodes, setPostcodes] = useState<ThaiTambol[]>([]);
  const [type, setType] = useState<"add" | "edit" | "delete">("add");

  const [dealerForm] = Form.useForm<DealerFormValues>();

  const onConfirm = useCallback(
    (values: DealerFormValues) => {
      dealerForm.resetFields();
      onOk && onOk(values, type);
    },
    [dealerForm, onOk, type]
  );

  const onPreConfirm = useCallback(
    (values: DealerFormValues) => {
      showConfirm(
        () => onConfirm(values),
        `${type === "add" ? "สร้าง" : "บันทึก"}รายชื่อผู้จำหน่าย/ผู้รับเงิน ${values.dealerName}`
      );
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
    const fAmphoes = getAmphoesFromProvince(pv);
    setAmphoes(fAmphoes);
    const pc = getPostcodeFromProvince(pv);
    setPostcodes(pc);
  };

  const onAmphoeChange = (ap: string) => {
    dealerForm.setFieldsValue({ dealerAmphoe: ap });
    const fTambols = getTambols(ap);
    setTambols(fTambols);
    const pc = getPostcodeFromProvinceAndAmphoe(localProvince, ap);
    setPostcodes(pc);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as "add" | "edit" | "delete");
  };

  const onSelect = (dl: string | string[]) => {
    if (typeof dl === "string") {
      const dealer = { ...initialValues, ...dealers[dl] };
      dealerForm.setFieldsValue(dealer);
      setLocalPrefix(dealer.dealerPrefix);
    }
  };

  const ProvinceOptions = (Provinces() as unknown as ThaiTambol[]).map((p) => (
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

  const isInstitution = ["หจก.", "บจก.", "บมจ.", "ร้าน"].includes(localPrefix || "");

  const filterOption: SelectProps["filterOption"] = (input, option) => {
    const children = option?.children?.toString().toLowerCase() || '';
    return children.indexOf(input.toLowerCase()) >= 0;
  };

  return (
    <Modal
      title="ผู้จำหน่าย/ผู้รับเงิน"
      open={visible}
      onOk={() => {
        dealerForm
          .validateFields()
          .then((values) => {
            onPreConfirm(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      onCancel={onCancel}
      okText={type === "add" ? "สร้างรายชื่อ" : type === "edit" ? "บันทึก" : "ลบ"}
      cancelText="ยกเลิก"
      okType={type === "delete" ? "danger" : "primary"}
    >
      <Form form={dealerForm} layout="horizontal" initialValues={initialValues}>
        <Form.Item name="dealerId" noStyle>
          <EInput type="hidden" />
        </Form.Item>
        <Input.Group compact>
          <Form.Item
            name="dealerCode"
            rules={[{ required: true, message: "กรุณาป้อนข้อมูล" }]}
            style={{ width: "60%" }}
          >
            {type === "add" ? (
              <EInput placeholder="รหัสผู้จำหน่าย" />
            ) : (
              <DealerSelector onChange={onSelect} noAddable />
            )}
          </Form.Item>
          <Form.Item name="dealerType" style={{ width: "40%" }}>
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
            style={{ width: "25%" }}
          >
            <PrefixAnt placeholder="คำนำหน้า" onChange={onPrefixChange} />
          </Form.Item>
          <Form.Item
            name="dealerName"
            rules={[{ required: true, message: "กรุณาป้อนชื่อผู้จำหน่าย" }]}
            style={{ width: isInstitution ? "75%" : "35%" }}
          >
            <EInput placeholder="ขื่อ" />
          </Form.Item>
          {!isInstitution && (
            <Form.Item
              name="dealerLastName"
              style={{ width: "40%" }}
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
                  const tVal = value.replace(/(\r\n|\n|\r| |-)/g, "");
                  if (tVal.length === 13) {
                    return Promise.resolve();
                  }
                  return Promise.reject("เลขประจำตัวผู้เสียภาษี 13 หลัก");
                }
              })
            ]}
            style={{ width: "60%" }}
          >
            <EInput placeholder="เลขประจำตัวผู้เสียภาษี" />
          </Form.Item>
          <Form.Item name="dealerHeadOffice" style={{ width: "40%" }}>
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
          <Form.Item name="dealerBank" style={{ width: "30%" }}>
            <BankNameSelector />
          </Form.Item>
          <Form.Item name="dealerBankType" style={{ width: "30%" }}>
            <Select placeholder="สำนักงาน/สาขาเลขที่">
              <Option key="saving" value="saving">
                ออมทรัพย์
              </Option>
              <Option key="current" value="current">
                ฝากประจำ
              </Option>
            </Select>
          </Form.Item>
          <Form.Item name="dealerBankAccNo" style={{ width: "40%" }}>
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
          <Form.Item name="dealerProvince" style={{ width: "50%" }}>
            <Select
              showSearch
              placeholder={"จังหวัด"}
              optionFilterProp="children"
              filterOption={filterOption}
              onChange={onProvinceChange}
            >
              <Option key="นครราชสีมา1" value="นครราชสีมา">
                นครราชสีมา
              </Option>
              {ProvinceOptions}
            </Select>
          </Form.Item>
          <Form.Item name="dealerAmphoe" style={{ width: "50%" }}>
            <Select
              showSearch
              placeholder={"อำเภอ/เขต"}
              optionFilterProp="children"
              filterOption={filterOption}
              onChange={onAmphoeChange}
            >
              {AmphoeOptions}
            </Select>
          </Form.Item>
        </Input.Group>
        <Input.Group compact>
          <Form.Item name="dealerTambol" style={{ width: "50%" }}>
            <Select
              showSearch
              placeholder={"ตำบล/แขวง"}
              optionFilterProp="children"
              filterOption={filterOption}
            >
              {TambolOptions}
            </Select>
          </Form.Item>
          <Form.Item name="dealerPostcode" style={{ width: "50%" }}>
            <Select
              showSearch
              placeholder={"รหัสไปรษณีย์"}
              optionFilterProp="children"
              filterOption={filterOption}
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