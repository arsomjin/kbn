import React from 'react';
import PropTypes from 'prop-types';
import { addErrorLogs } from 'firebase/api';
import { Container } from 'shards-react';
import { Button } from 'elements';
import { RefreshOutlined } from '@material-ui/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    addErrorLogs(error);
    this.setState({ error, errorInfo });
    console.warn({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container fluid className="main-content-container px-4 pb-4">
          <div className="error">
            <div className="error__content">
              {/* <h2>500</h2> */}
              <h3>Something went wrong!</h3>
              {this.state.error && (
                <div className="p-3">
                  <h4>Error:</h4>
                  <p style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <div className="p-3">
                  <h4>Component Stack:</h4>
                  <p style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {this.state.errorInfo.componentStack}
                  </p>
                </div>
              )}
              <Button
                type="primary"
                shape="round"
                icon={<RefreshOutlined />}
                onClick={() => window.location.reload()}
                className="m-3"
              >
                โหลดใหม่อีกครั้ง
              </Button>
            </div>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
