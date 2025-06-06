import { Socials } from 'components/Footers';
import React from 'react';
import { Container } from 'shards-react';

const About = () => {
  return (
    <Container fluid className="main-content-container px-4 pb-4">
      <div className="error">
        <div className="error__content">
          <img
            id="main-logo"
            className="d-inline-block align-top mr-1"
            style={{
              maxWidth: '128px',
              size: '122px',
              marginBottom: '30px'
            }}
            src={require('images/logo192.png')}
            alt="Kubota Benjapol"
          />
          <h2>KBN</h2>
          <h3>บริษัท คูโบต้าเบญจพล นครราชสีมา จำกัด</h3>
          <p>จำหน่าย รถแทรกเตอร์ รถแมคโคร รถเกี่ยวข้าว รถดำนา รถตัดอ้อย คูโบต้าใหม่และเก่า</p>
          <Socials medium />
        </div>
      </div>
    </Container>
  );
};

export default About;
