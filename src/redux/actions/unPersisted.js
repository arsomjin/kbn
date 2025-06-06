export const CONNECTION_ONLINE = 'CONNECTION_ONLINE';
export const CONNECTION_OFFLINE = 'CONNECTION_OFFLINE';
export const GET_ORIENTATION_SUCCESS = 'GET_ORIENTATION_SUCCESS';
export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const TOGGLE_SIDEBAR_DROPDOWN = 'TOGGLE_SIDEBAR_DROPDOWN';
export const OPEN_KEYS = 'OPEN_KEYS';
export const SELECTED_KEYS = 'SELECTED_KEYS';

export function updateOrientation(dimensions) {
  const { isPortrait, screenHeight, screenWidth } = dimensions;
  return {
    type: GET_ORIENTATION_SUCCESS,
    isPortrait,
    screenHeight,
    screenWidth
  };
}

export const goOnline = () => {
  return {
    type: CONNECTION_ONLINE
  };
};

export function goOffline() {
  return {
    type: CONNECTION_OFFLINE
  };
}

export const toggleSidebar = menuVisible => {
  return {
    type: TOGGLE_SIDEBAR,
    menuVisible
  };
};

export const setOpenKeys = openKeys => {
  return {
    type: OPEN_KEYS,
    openKeys
  };
};

export const setSelectedKeys = selectedKeys => {
  return {
    type: SELECTED_KEYS,
    selectedKeys
  };
};

export const toggleSidebarDropdown = item => {
  return {
    type: TOGGLE_SIDEBAR_DROPDOWN,
    item
  };
};
