import React from 'react';
import { Container, Button } from 'shards-react';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router-dom';

const ComingSoon = ({ title, info, details, inProgress, isSection, ...props }) => {
  const history = useHistory();

  if (isSection) {
    return (
      <div className="p-4">
        <div className="error__content">
          {isMobile ? (
            <h3 style={{ fontFamily: 'sans-serif', color: 'lightgrey' }}>
              {title || inProgress ? 'Working in progress...' : 'COMING SOON'}
            </h3>
          ) : (
            <h2>{title || inProgress ? 'Working in progress...' : 'COMING SOON'}</h2>
          )}
          {info && <h3>{info}</h3>}
          {details && <p>{details}</p>}
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="main-content-container px-4 pb-4">
      <div className="error">
        <div className="error__content">
          {isMobile ? (
            <h3 style={{ fontFamily: 'sans-serif', color: 'lightgrey' }}>
              {title || inProgress ? 'Working in progress...' : 'COMING SOON'}
            </h3>
          ) : (
            <h2>{title || inProgress ? 'Working in progress...' : 'COMING SOON'}</h2>
          )}
          {info && <h3>{info}</h3>}
          {details && <p>{details}</p>}
          <Button pill onClick={() => history.goBack()}>
            &larr; Go Back
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ComingSoon;
