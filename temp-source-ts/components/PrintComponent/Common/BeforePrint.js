import React from 'react';
import { Row, Checkbox } from 'antd';
import { Button, Modal } from 'elements';

export class BeforePrint extends React.PureComponent {
  render() {
    const { title, docName, onOk, onCancel, visible, onChange } = this.props;
    return (
      <Modal
        title={<h5 className='text-primary'>{title}</h5>}
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        footer={
          <Row
            style={{
              justifyContent: 'flex-end',
              margin: 8
            }}
            form
          >
            <Button key='cancel' onClick={onCancel} style={{ width: 120 }} className='mr-1'>
              ยกเลิก
            </Button>
            <Button
              key='print'
              onClick={onOk}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: 120
              }}
              type='primary'
            >
              พิมพ์
            </Button>
          </Row>
        }
      >
        <div className='d-flex justify-content-center align-items-center'>
          <h6 className='mr-4' style={{ marginTop: 8 }}>
            {docName}
          </h6>
          <Checkbox.Group options={['ต้นฉบับ', 'สำเนา']} defaultValue={['ต้นฉบับ']} onChange={onChange} />
        </div>
      </Modal>
    );
  }
}
