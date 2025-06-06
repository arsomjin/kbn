import React, { useCallback, useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';

import GiveawayList from './GiveawayList';
import MainContainer from './MainContainer';

const PromotionSettings = ({ onSelect, toggleMain, hideMain }) => {
  const { user } = useSelector(state => state.auth);
  const [showGiveaways, setShowGiveaways] = useState(false);

  const grantPromotion = user.isDev || (user.permissions && user.permissions.permission602);

  const _onGiveawaySelect = useCallback(() => {
    //  showLog('bank_select');
    setShowGiveaways(true);
  }, []);

  const _onGiveawaysBack = useCallback(() => {
    //  showLog('bank_back');
    setShowGiveaways(false);
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
            <h6 className="m-0 mr-3 ml-3">โปรโมชั่น</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            <ListGroupItem action onClick={_onGiveawaySelect} disabled={!grantPromotion}>
              ของแถม
            </ListGroupItem>
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
          <Button theme="light" onClick={() => setShowGiveaways(true)}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter> */}

        {showGiveaways && (
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
            <GiveawayList onBack={_onGiveawaysBack} />
          </Slide>
        )}
      </Card>
    </MainContainer>
  );
};
export default PromotionSettings;
