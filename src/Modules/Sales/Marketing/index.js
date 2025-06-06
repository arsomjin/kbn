import React, { useCallback, useContext, useEffect } from 'react';
import { CardHeader, Container } from 'shards-react';

import { List, Button } from 'antd';
import { useSelector } from 'react-redux';
import { ArrowForward, PeopleOutline, PeopleAltRounded, PeopleAltTwoTone } from '@material-ui/icons';
import { useHistory } from 'react-router';
import { FirebaseContext } from '../../../firebase';

const data = [
  {
    title: 'บันทึกข้อมูลลูกค้า',
    description: '',
    avatar: <PeopleAltRounded />
  },
  {
    title: 'บันทึกข้อมูลคนแนะนำ',
    description: '',
    avatar: <PeopleAltTwoTone />
  },
  {
    title: 'ข้อมูลลูกค้า',
    description: '',
    avatar: <PeopleOutline />
  }
];

const Marketing = () => {
  const { theme } = useSelector(state => state.global);
  const { equipmentLists, giveaways } = useSelector(state => state.data);
  const { api } = useContext(FirebaseContext);
  const history = useHistory();
  useEffect(() => {
    if (Object.keys(giveaways).length === 0) {
      api.getGiveaways();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onSelect = useCallback(
    item => {
      //  showLog('select', item);
      switch (item.title) {
        case 'บันทึกข้อมูลลูกค้า':
          history.push('/customer-details', {
            params: { selectedCustomer: {} }
          });

          break;
        case 'ข้อมูลลูกค้า':
          history.push('/sale-customer-list');
          break;
        case 'บันทึกข้อมูลคนแนะนำ':
          history.push('/referrer-details', {
            params: { selectedReferrer: {} }
          });
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
        <h6>การตลาด</h6>
      </CardHeader>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item
            className="px-2"
            style={{ backgroundColor: theme.colors.surface }}
            actions={[
              <Button htmlType="button" type="primary" onClick={() => _onSelect(item)}>
                <ArrowForward />
              </Button>
            ]}
          >
            <List.Item.Meta avatar={item.avatar} title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </Container>
  );
};

export default Marketing;
