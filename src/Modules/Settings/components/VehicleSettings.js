import React, { useCallback } from 'react';
import { CardHeader, Container } from 'shards-react';
import { useSelector } from 'react-redux';

import { List, Avatar, Button } from 'antd';
import { useHistory } from 'react-router-dom';

const data = [
  {
    title: 'รายการรุ่นรถ',
    description: 'รายละเอียด รุ่นรถ, ชื่อ, รหัส ฯลฯ'
  }
  // {
  //   title: 'รายการอุปกรณ์',
  //   description: 'รายละเอียด อุปกรณ์, ชื่อ, รหัส ฯลฯ',
  // },
];

const VehicleSettings = ({ onSelect, toggleMain, hideMain }) => {
  const { theme } = useSelector(state => state.global);

  let history = useHistory();

  const _onSelect = useCallback(
    item => {
      //  showLog('select', item);
      switch (item.title) {
        case 'รายการรุ่นรถ':
          history.push('/setting-vehicle-model');
          break;

        default:
          break;
      }
    },
    [history]
  );

  return (
    <Container fluid className="main-content-container px-2 py-2">
      <CardHeader className="border-bottom">
        <h6>เกี่ยวกับรถ</h6>
      </CardHeader>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item
            className="px-2"
            style={{ backgroundColor: theme.colors.surface }}
            actions={[
              <Button type="primary" shape="round" onClick={() => _onSelect(item)}>
                รายละเอียด
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={require('../../../images/logo192.png')} />}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Container>
  );
};
export default VehicleSettings;
