import React from 'react';
import { Form } from 'antd';
import { Row, Col } from 'antd';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import { DatePicker } from 'elements';
import { InputGroup } from 'elements';
import { Button } from 'elements';
import { PrinterFilled } from '@ant-design/icons';
import { showToBeContinue } from 'utils/functions';

const ReferringFooter = ({ isCreditCheck, isAccountCheck, isReport, hasReferrer }) => (
  <div className="px-3 pt-3 mb-3 border bg-white">
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={12} lg={12} className="border-right">
        <label className="text-primary">สาขา</label>

        <Form.Item
          name={['referringDetails', 'forBranch', 'requestBy']}
          rules={
            hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
              ? [...getRules(['required'])]
              : undefined
          }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ผู้เสนอขอโอนค่าแนะนำ"
            inputComponent={(props) => <EmployeeSelector {...props} />}
            disabled={isCreditCheck || isAccountCheck || isReport}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'forBranch', 'branchAccountant']}
          rules={
            hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
              ? [...getRules(['required'])]
              : undefined
          }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="พนักงานบัญชีสาขา"
            inputComponent={(props) => <EmployeeSelector {...props} />}
            disabled={isCreditCheck || isAccountCheck || isReport}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'forBranch', 'branchManager']}
          rules={
            hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
              ? [...getRules(['required'])]
              : undefined
          }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ผู้จัดการสาขา"
            inputComponent={(props) => <EmployeeSelector {...props} />}
            disabled={isCreditCheck || isAccountCheck || isReport}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={12}>
        <label className="text-primary">สำนักงานใหญ่</label>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={16} lg={16}>
            <Form.Item
              name={['referringDetails', 'forHQ', 'creditClerk']}
              // rules={
              //   hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
              //     ? [...getRules(['required'])]
              //     : undefined
              // }
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="สินเชื่อตรวจสอบ"
                inputComponent={(props) => <EmployeeSelector {...props} />}
                disabled={!isCreditCheck}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              name={['referringDetails', 'forHQ', 'creditCheckDate']}
              // rules={
              //   hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
              //     ? [...getRules(['required'])]
              //     : undefined
              // }
            >
              <InputGroup
                spans={[14]}
                inputComponent={(props) => <DatePicker {...props} />}
                disabled={!isCreditCheck}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name={['referringDetails', 'approvedBy']}
          // rules={
          //   hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
          //     ? [...getRules(['required'])]
          //     : undefined
          // }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ผู้บริหาร (อนุมัติค่าแนะนำ)"
            disabled={!isCreditCheck}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'forHQ', 'hqAccountant']}
          // rules={
          //   hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
          //     ? [...getRules(['required'])]
          //     : undefined
          // }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="บัญชีตั้งเบิกค่าแนะนำ"
            inputComponent={(props) => <EmployeeSelector {...props} />}
            disabled={!isCreditCheck}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'forHQ', 'sendTransferDate']}
          // rules={
          //   hasReferrer && !(isCreditCheck || isAccountCheck || isReport)
          //     ? [...getRules(['required'])]
          //     : undefined
          // }
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ส่งโอนรอบวันที่"
            inputComponent={(props) => <DatePicker {...props} />}
            disabled={!isCreditCheck}
          />
        </Form.Item>
        <Form.Item
          name={['referringDetails', 'forHQ', 'actualTransferDate']}
          rules={hasReferrer && isAccountCheck ? [...getRules(['required'])] : undefined}
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="โอนเงินวันที่"
            inputComponent={(props) => <DatePicker {...props} />}
            disabled={!isAccountCheck}
          />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={16} lg={16}>
            <Form.Item
              name={['referringDetails', 'forHQ', 'hqAccountAuditor']}
              rules={hasReferrer && isAccountCheck ? [...getRules(['required'])] : undefined}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="บัญชีตรวจสอบ"
                inputComponent={(props) => <EmployeeSelector {...props} />}
                disabled={!isAccountCheck}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Form.Item
              name={['referringDetails', 'forHQ', 'hqAuditorDate']}
              rules={hasReferrer && isAccountCheck ? [...getRules(['required'])] : undefined}
            >
              <InputGroup
                spans={[14]}
                inputComponent={(props) => <DatePicker {...props} />}
                disabled={!isAccountCheck}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name={['referringDetails', 'forHQ', 'hqAuditor']}
          rules={hasReferrer && isAccountCheck ? [...getRules(['required'])] : undefined}
        >
          <InputGroup
            spans={[10, 14]}
            addonBefore="ผู้ตรวจสอบ"
            inputComponent={(props) => <EmployeeSelector {...props} />}
            disabled={!isAccountCheck}
          />
        </Form.Item>
      </Col>
    </Row>
    {(isAccountCheck || isCreditCheck) && (
      <div className="text-right mb-3">
        <Button size="default" icon={<PrinterFilled />} onClick={() => showToBeContinue()}>
          ใบเบิกค่าแนะนำ
        </Button>
      </div>
    )}
  </div>
);

export default ReferringFooter;
