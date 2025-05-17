export const styles = {
    modal: {
      position: 'absolute',
      display: 'flex',
      left: 0,
      top: 0,
      width: '100%',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.2)',
      zIndex: 200
    },
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    centered: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    },
    fill: {
      display: 'flex',
      width: '100%',
      height: '100%'
    },
    middle: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    iconImage: {
      width: 42,
      height: 32
    },
    errorTxt: {
      color: '#f50057',
      margin: 5,
      fontSize: '14px'
    }
  };
  