import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Nav, Collapse } from 'shards-react';

import MenuItem from './MenuItem';
import { useSelector } from 'react-redux';

const HeaderNavbar = forwardRef((props, ref) => {
  const { menuVisible } = useSelector(state => state.unPersisted);

  const { items } = props;
  return (
    <Collapse className="header-navbar d-lg-flex p-0 bg-white border-top" open={menuVisible}>
      <Container>
        <Row>
          <Col>
            <Nav tabs className="border-0 flex-column flex-lg-row">
              {items.map((item, idx) => (
                <MenuItem key={idx} item={item} />
              ))}
            </Nav>
          </Col>
        </Row>
      </Container>
    </Collapse>
  );
});

HeaderNavbar.displayName = 'HeaderNavbar';

HeaderNavbar.propTypes = {
  /**
   * The array of header navbar items.
   */
  items: PropTypes.array
};

export default HeaderNavbar;
