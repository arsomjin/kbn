import React, { useCallback, useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';

import BankList from './BankList';
import MainContainer from './MainContainer';

const AccountSettings = ({ onSelect, toggleMain, hideMain }) => {
  const { user } = useSelector(state => state.auth);
  const [showBanks, setShowBanks] = useState(false);

  const grantBank = user.isDev || (user.permissions && user.permissions.permission602);

  const _onBankSelect = useCallback(() => {
    //  showLog('bank_select');
    setShowBanks(true);
  }, []);

  const _onBanksBack = useCallback(() => {
    //  showLog('bank_back');
    setShowBanks(false);
  }, []);

  return (
    <MainContainer>
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <Row
            style={{
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <h6 className="m-0 mr-3 ml-3">บัญชี</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            <ListGroupItem action onClick={() => _onBankSelect()} disabled={!grantBank}>
              บัญชีธนาคาร
            </ListGroupItem>
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
          <Button theme="light" onClick={() => setShowBanks(true)}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter> */}

        {showBanks && (
          <Slide
            triggerOnce
            direction="right"
            duration={500}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 20
              // backgroundColor: theme.colors.surface,
            }}
          >
            <BankList onBack={_onBanksBack} />
          </Slide>
        )}
      </Card>
    </MainContainer>
  );
};
export default AccountSettings;
