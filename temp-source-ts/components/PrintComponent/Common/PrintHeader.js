import React from 'react';
import { Row, Col, Divider, Image } from 'antd';

export class PrintHeader extends React.PureComponent {
  render() {
    const { title, subtitle, rightData } = this.props;
    return (
      <div>
        <Row gutter={24} style={{ marginTop: 32 }}>
          <Col span={12}>
            <Image width={120} src={require('images/logo192.png')} />
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  flex: 2,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <h4 className='text-primary mt-4'>{title}</h4>
                <h5 className='text-primary'>{subtitle || '(ต้นฉบับ)'}</h5>
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={14}>
            <Row>
              <h5>บริษัท คูโบต้าเบญจพลนครราชสีมา จำกัด</h5>
              <h6 style={{ marginTop: -4 }}>Kubota Benjaphon Nakhonratchasima Co., Ltd.</h6>
              <table
                style={{
                  width: '100%',
                  fontSize: 12
                }}
              >
                <tbody>
                  <tr>
                    <th className='text-left'>สำนักงานใหญ่ :</th>
                    <td className='text-left'>โทร. 044-928997-9</td>
                    <th className='text-left ml-1'>สาขาจักราช :</th>
                    <td className='text-left'>โทร. 044-399086</td>
                  </tr>
                  <tr>
                    <th className='text-left'>สาขาหนองบุญมาก :</th>
                    <td className='text-left'>โทร. 044-490189</td>
                    <th className='text-left ml-1'>สาขาสีดา :</th>
                    <td className='text-left'>โทร. 044-303255</td>
                  </tr>
                  <tr>
                    <th className='text-left'>สาขาบัวใหญ่ :</th>
                    <td className='text-left'>โทร. 044-913581</td>
                    <th className='text-left ml-1'>สาขาโคกกรวด :</th>
                    <td className='text-left'>โทร. 044-466224</td>
                  </tr>
                  <tr>
                    <th className='text-left'>สาขาขามสะแกแสง :</th>
                    <td className='text-left'>โทร. 044-370123</td>
                  </tr>
                </tbody>
              </table>
            </Row>
          </Col>
          <Col span={9} offset={1}>
            <Divider style={{ backgroundColor: 'lightgrey' }} />
            <table
              style={{
                width: '100%'
              }}
            >
              <tbody>
                {rightData.map((it, i) => (
                  <tr key={i}>
                    <th className='text-left text-primary'>{`${it.th} :`}</th>
                    <td className='text-left'>{it.td}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Divider style={{ backgroundColor: 'lightgrey' }} />
          </Col>
        </Row>
      </div>
    );
  }
}

export const PrintHeaderFC = React.forwardRef((props, ref) => {
  // eslint-disable-line max-len
  return <PrintHeader ref={ref} content={props.content} />;
});
