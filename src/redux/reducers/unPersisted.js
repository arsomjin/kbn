import getSidebarNavItems from 'data/sidebar-nav-items';

import {
  GET_ORIENTATION_SUCCESS,
  CONNECTION_OFFLINE,
  CONNECTION_ONLINE,
  TOGGLE_SIDEBAR,
  TOGGLE_SIDEBAR_DROPDOWN,
  OPEN_KEYS,
  SELECTED_KEYS
} from '../actions/unPersisted';

// Check if we're on mobile to determine initial sidebar state
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

const initialState = {
  isPortrait: false,
  screenHeight: 719,
  screenWidth: 414,
  isOnline: true,
  menuVisible: !isMobileDevice(), // Show sidebar by default on desktop, hide on mobile
  navItems: getSidebarNavItems(),
  openKeys: [],
  selectedKeys: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_ORIENTATION_SUCCESS:
      return {
        ...state,
        screenWidth: action.screenWidth,
        screenHeight: action.screenHeight,
        isPortrait: action.isPortrait
      };
    case CONNECTION_ONLINE:
      return {
        ...state,
        isOnline: true
      };
    case CONNECTION_OFFLINE:
      return {
        ...state,
        isOnline: false
      };
    case TOGGLE_SIDEBAR:
      return {
        ...state,
        menuVisible: action.menuVisible
      };
    case OPEN_KEYS:
      return {
        ...state,
        openKeys: action.openKeys
      };
    case SELECTED_KEYS:
      return {
        ...state,
        selectedKeys: action.selectedKeys
      };
    case TOGGLE_SIDEBAR_DROPDOWN:
      const newStore = { ...state };

      let navGroupIdx = null;
      let navItemIdx = null;

      newStore.navItems.forEach((navItem, _idx) => {
        const __idx = navItem.items.indexOf(action.item);
        if (__idx !== -1) {
          navGroupIdx = _idx;
          navItemIdx = __idx;
        }
      });

      newStore.navItems[navGroupIdx].items[navItemIdx].open = !newStore.navItems[navGroupIdx].items[navItemIdx].open;

      newStore.navItems = newStore.navItems.map(i => {
        i.items = i.items.map((_i, idx) => {
          if (idx !== navItemIdx) {
            _i.open = false;
          }
          return _i;
        });
        return i;
      });
      return newStore;

    default:
      return state;
  }
};
