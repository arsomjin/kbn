import React, { forwardRef, memo } from 'react';
import { Row, FormCheckbox, Col } from 'shards-react';
import { useSelector } from 'react-redux';

const SettingAccountPermissions = forwardRef((props, ref) => {
  const { theme } = useSelector(state => state.global);
  const { handleChange } = props;
  return (
    <Row
      form
      style={{
        backgroundColor: theme.colors.background,
        padding: '10px'
      }}
    >
      <Col sm="12" md="4" className="mb-3">
        <strong className="text-primary d-block mb-2">บัญชีรายรับ</strong>
        <fieldset>
          <FormCheckbox toggle small>
            ดูรายการ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked>
            เพิ่ม/แก้ไข/ลบ
          </FormCheckbox>
          <FormCheckbox toggle small disabled>
            ตรวจสอบ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked disabled>
            อนุมัติ
          </FormCheckbox>
        </fieldset>
      </Col>
      <Col sm="12" md="4" className="mb-3">
        <strong className="text-primary d-block mb-2">บัญชีรายจ่าย</strong>
        <fieldset>
          <FormCheckbox toggle small checked>
            ดูรายการ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked>
            เพิ่ม/แก้ไข/ลบ
          </FormCheckbox>
          <FormCheckbox toggle small disabled>
            ตรวจสอบ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked disabled>
            อนุมัติ
          </FormCheckbox>
        </fieldset>
      </Col>
      <Col sm="12" md="4" className="mb-3">
        <strong className="text-primary d-block mb-2">อื่นๆ</strong>
        <fieldset>
          <FormCheckbox toggle small>
            ดูรายการ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked>
            เพิ่ม/แก้ไข/ลบ
          </FormCheckbox>
          <FormCheckbox toggle small disabled>
            ตรวจสอบ
          </FormCheckbox>
          <FormCheckbox toggle small defaultChecked disabled>
            อนุมัติ
          </FormCheckbox>
        </fieldset>
      </Col>
    </Row>
  );
});

export default memo(SettingAccountPermissions);
