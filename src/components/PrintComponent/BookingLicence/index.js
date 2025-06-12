import React, { forwardRef, memo } from 'react';
import { Col, Row, Divider, Card, Typography } from 'antd';
import 'antd/dist/antd.css';
import { PrintContainer } from '../Common/PrintContainer';

const { Title, Text } = Typography;

// 🚧 TEMPORARY PLACEHOLDER - COFFEE-MONSTER ELIMINATED! 
// This component has been temporarily simplified to prevent infinite logging
// We'll build a beautiful new printing system soon! 🎨📄

const BookingLicence = memo(props => {
  const { content, values } = props;

  return (
    <PrintContainer style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px' }}>
      <Card style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Title level={2} style={{ color: '#52c41a', marginBottom: '10px' }}>
          🎯 COFFEE-MONSTER ELIMINATED!
        </Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Temporary Print Component Placeholder
        </Text>
      </Card>
      
      <Card>
        <Title level={3}>{content?.docName || 'Document'}</Title>
        <Divider />
        
        <Row style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Text strong>Document No: </Text>
            <Text>{content?.docNo || '-'}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Customer: </Text>
            <Text>{values?.firstName || '-'} {values?.lastName || ''}</Text>
          </Col>
        </Row>
        
        <div style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          padding: '20px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <Title level={4} style={{ color: '#389e0d', marginBottom: '10px' }}>
            🚀 Coming Soon: Beautiful Document Printing System
          </Title>
          <Text style={{ color: '#666' }}>
            We're building an amazing new printing system with professional layouts,
            beautiful typography, and perfect formatting for your multi-province operations.
          </Text>
        </div>
      </Card>
    </PrintContainer>
  );
});

const BookingLicenceFC = forwardRef((props, ref) => {
  return <BookingLicence {...props} ref={ref} />;
});

BookingLicence.displayName = 'BookingLicence';
BookingLicenceFC.displayName = 'BookingLicenceFC';

export default BookingLicence;
export { BookingLicenceFC };
