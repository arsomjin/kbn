import React, { forwardRef } from 'react';
import { Nav } from 'shards-react';

import SidebarNavItem from './SidebarNavItem';
import { useSelector } from 'react-redux';

const SidebarNavItems = forwardRef((props, ref) => {
  const { navItems: items } = useSelector(state => state.unPersisted);
  return (
    <div className="nav-wrapper">
      {items.map((nav, idx) => (
        <div key={idx}>
          <h6 className="main-sidebar__nav-title">{nav.title}</h6>
          {typeof nav.items !== 'undefined' && nav.items.length && (
            <Nav className="nav--no-borders flex-column">
              {nav.items.map((item, idx) => (
                <SidebarNavItem key={idx} item={item} />
              ))}
            </Nav>
          )}
        </div>
      ))}
    </div>
  );
  // return (
  //   <div className="nav-wrapper">
  //     {items.map((nav, idx) => (
  //       <div key={idx}>
  //         <h6 className="main-sidebar__nav-title">{nav.title}</h6>
  //         {typeof nav.items !== 'undefined' && nav.items.length && (
  //           <Nav className="nav--no-borders flex-column">
  //             {nav.items.map((item, idx) => (
  //               <SidebarNavItem key={idx} item={item} />
  //             ))}
  //           </Nav>
  //         )}
  //       </div>
  //     ))}
  //   </div>
  // );
});

export default SidebarNavItems;
