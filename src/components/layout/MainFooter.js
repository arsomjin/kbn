import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Nav, NavItem, NavLink } from 'shards-react';
import { useHistory } from 'react-router-dom';

const MainFooter = ({ contained, menuItems, copyright }) => {
  const history = useHistory();
  const _onClick = path => history.push(path);
  return (
    <footer className="main-footer d-flex p-2 px-3 bg-white border-top">
      <Container fluid={contained}>
        <Row>
          <Nav>
            {menuItems.map((item, idx) => (
              <NavItem key={idx}>
                <NavLink onClick={() => _onClick(item.to)}>
                  {/* <NavLink tag={Link} to={item.to}> */}
                  {item.title}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <span className="copyright ml-auto my-auto mr-2">{copyright}</span>
        </Row>
      </Container>
    </footer>
  );
};

MainFooter.propTypes = {
  /**
   * Whether the content is contained, or not.
   */
  contained: PropTypes.bool,
  /**
   * The menu items array.
   */
  menuItems: PropTypes.array,
  /**
   * The copyright info.
   */
  copyright: PropTypes.string
};

MainFooter.defaultProps = {
  contained: false,
      copyright: 'Copyright © 2020 KBN',
  menuItems: [
    {
      title: 'Home',
      to: '/overview'
    },
    {
      title: 'Services',
      to: '#'
    },
    {
      title: 'About',
      to: '/about'
    },
    {
      title: 'Products',
      to: '#'
    },
    {
      title: 'Blog',
      to: '#'
    }
  ]
};

export default MainFooter;
