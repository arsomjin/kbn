import { Form } from "antd";
import { getRules } from "api/Table";
import { InputGroup } from "elements";
import { Row, Col } from "shards-react";
import { Input } from "elements";
import HiddenItem from "components/HiddenItem";
import EmployeeSelector from "components/EmployeeSelector";
import { DatePicker } from "elements";
import SelfBankSelector from "components/SelfBankSelector";
import { DateTime } from "luxon";
import { FormProps } from "antd/lib/form";

export interface BankDepositItem {
  depositId: string | null;
  date: string;
  depositDate: string | undefined;
  branchCode: string | null;
  depositor: string | null; 
  selfBankId: string | null;
  total: number | null;
  remark: string | null;
  deleted: boolean;
  _key?: string;
}

export const initItem: BankDepositItem = {
  depositId: null,
  date: DateTime.now().toFormat("yyyy-MM-dd"),
  depositDate: undefined,
  branchCode: null,
  depositor: null,
  selfBankId: null,
  total: null,
  remark: null,
  deleted: false
};

export const getInitItem = (order: Partial<BankDepositItem>): BankDepositItem => {
  return {
    ...initItem,
    depositId: order?.depositId
  };
};

interface ColumnType {
  title: string;
  dataIndex: string;
  align?: "center" | "left" | "right"; 
  width?: number;
  editable?: boolean;
  required?: boolean;
  ellipsis?: boolean;
  number?: boolean;
}

export const getColumns = (isEdit: boolean): ColumnType[] => [
  {
    title: "ลำดับที่",
    dataIndex: "id",
    align: "center",
    width: 80
  },
  {
    title: "วันที่",
    dataIndex: "depositDate",
    width: 180
  },
  {
    title: "พนักงานผู้นำฝากเงิน",
    dataIndex: "depositor",
    editable: !isEdit,
    required: true,
    ellipsis: true,
    width: 180
  },
  {
    title: "ธนาคาร",
    dataIndex: "selfBankId",
    editable: !isEdit,
    required: true,
    ellipsis: true,
    width: 240
  },
  {
    title: "จำนวนเงิน",
    dataIndex: "total",
    editable: !isEdit,
    required: true,
    number: true
  },
  {
    title: "หมายเหตุ",
    dataIndex: "remark",
    editable: true
  }
];

export const renderInput = (): JSX.Element => {
  return (
    <div className="bg-white">
      <HiddenItem name="depositId" />
      <HiddenItem name="deleted" />
      <Row>
        <Col md="4">
          <Form.Item name="depositDate" rules={getRules(["required"])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="วันที่ฝากเงิน"
              inputComponent={(props: FormProps) => <DatePicker {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="8">
          <Form.Item name="depositor" rules={getRules(["required"])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="พนักงานผู้นำฝากเงิน"
              inputComponent={(props: FormProps) => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="total" rules={getRules(["required"])}>
            <InputGroup 
              spans={[8, 12, 4]} 
              addonBefore="จำนวนเงิน" 
              addonAfter="บาท" 
              alignRight 
              primary 
            />
          </Form.Item>
        </Col>
        <Col md="8">
          <Form.Item name="selfBankId" rules={getRules(["required"])}>
            <InputGroup
              spans={[6, 18]}
              addonBefore="ธนาคาร"
              inputComponent={(props: FormProps) => <SelfBankSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="12" className="d-flex flex-row">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: "90%" }}>
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
