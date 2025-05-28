import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Drawer, Typography, Divider, Button, Tooltip, Space } from 'antd';
import { QuestionCircleOutlined, CloseOutlined, BookOutlined } from '@ant-design/icons';
import pageDocs, { routeMatcher } from '../../in-app-docs/pageDocs';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;

const PageDoc = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { userProfile } = useAuth();

  // Extract route parameters from the current path
  const extractRouteParams = (path) => {
    const segments = path.split('/').filter(Boolean);
    const params = {};

    // Common parameter patterns
    if (segments.length >= 1 && segments[0] !== 'admin' && segments[0] !== 'auth') {
      params.provinceId = segments[0];
    }
    if (segments.length >= 2 && segments[1] !== 'admin') {
      params.branchCode = segments[1];
    }

    return params;
  };

  // Get documentation for current route
  const getPageDocumentation = () => {
    const currentPath = location.pathname;
    const userRole = userProfile?.role;
    const routeParams = extractRouteParams(currentPath);

    // Debug logging in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // console.log('[PageDoc] Processing route:', currentPath);
      // console.log('[PageDoc] User role:', userRole);
      // console.log('[PageDoc] Route params:', routeParams);
      // console.log('[PageDoc] Available routes:', Object.keys(pageDocs));
    }

    // Use the enhanced route matcher
    let doc = null;

    // Try to find role-specific documentation first
    if (userRole && routeMatcher && routeMatcher.getRoleSpecificDoc) {
      doc = routeMatcher.getRoleSpecificDoc(currentPath, userRole, pageDocs);
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // console.log('[PageDoc] Role-specific doc found:', !!doc);
      }
    }

    // Fallback to regular route matching
    if (!doc && routeMatcher && routeMatcher.findDoc) {
      doc = routeMatcher.findDoc(currentPath, pageDocs);
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // console.log('[PageDoc] Regular route doc found:', !!doc);
      }
    }

    // Final fallback to direct lookup
    if (!doc) {
      doc = pageDocs[currentPath];
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // console.log('[PageDoc] Direct lookup doc found:', !!doc);
      }
    }

    // Add route parameters to the documentation context
    if (doc && Object.keys(routeParams).length > 0) {
      doc = { ...doc, routeParams };
    }

    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // console.log('[PageDoc] Final doc result:', !!doc);
    }

    return doc;
  };

  const pageDoc = getPageDocumentation();

  // Don't show the help button if there's no documentation for this page
  if (!pageDoc) {
    // Debug logging in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // console.log('[PageDoc] No documentation found for route:', location.pathname);
      // console.log('[PageDoc] Available routes:', Object.keys(pageDocs));
    }
    return null;
  }

  // Render dynamic content if available
  const renderDynamicContent = (content, routeParams) => {
    if (typeof content === 'function') {
      try {
        return content(routeParams);
      } catch (error) {
        console.warn('Error rendering dynamic content:', error);
        return null;
      }
    }
    return content;
  };

  // Render content section with role-specific and dynamic support
  const renderSection = (title, content, routeParams) => {
    if (!content) return null;

    const renderedContent = renderDynamicContent(content, routeParams);
    if (!renderedContent) return null;

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#2d4739', marginBottom: 16 }}>
          {title}
        </Title>
        <div style={{ lineHeight: '1.6' }}>{renderedContent}</div>
        <Divider style={{ margin: '16px 0' }} />
      </div>
    );
  };

  const openDrawer = () => {
    setIsVisible(true);
  };

  const closeDrawer = () => {
    setIsVisible(false);
  };

  // Check if we're in development mode
  const isDevelopment =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('dev'));

  return (
    <>
      {/* Help Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Tooltip title="คู่มือการใช้งาน">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<QuestionCircleOutlined />}
            onClick={openDrawer}
            style={{
              backgroundColor: '#2d4739',
              borderColor: '#2d4739',
              boxShadow: '0 4px 12px rgba(45, 71, 57, 0.3)',
            }}
          />
        </Tooltip>
      </div>

      {/* Documentation Drawer */}
      <Drawer
        title={
          <Space align="center">
            <BookOutlined style={{ color: '#2d4739' }} />
            <span style={{ color: '#2d4739' }}>คู่มือการใช้งาน</span>
            {pageDoc.routeParams && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                (
                {Object.entries(pageDoc.routeParams)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
                )
              </Text>
            )}
          </Space>
        }
        placement="right"
        onClose={closeDrawer}
        open={isVisible}
        width={640}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={closeDrawer}
            style={{ color: '#2d4739' }}
          />
        }
        bodyStyle={{
          padding: '24px',
          backgroundColor: '#f8f9fa',
        }}
        headerStyle={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e8f5e8',
        }}
      >
        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {/* Role indicator */}
          {userProfile?.role && (
            <div
              style={{
                background: '#e3f2fd',
                padding: 8,
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              <b>👤 บทบาทปัจจุบัน:</b> {userProfile.role}
              {pageDoc.baseDoc && (
                <span style={{ color: '#666', marginLeft: 8 }}>
                  (เนื้อหาที่ปรับให้เหมาะกับบทบาท)
                </span>
              )}
            </div>
          )}

          {/* Dynamic route parameters display */}
          {pageDoc.routeParams && Object.keys(pageDoc.routeParams).length > 0 && (
            <div
              style={{
                background: '#fff3cd',
                padding: 8,
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              <b>📍 พารามิเตอร์เส้นทาง:</b>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {Object.entries(pageDoc.routeParams).map(([key, value]) => (
                  <li key={key}>
                    {key}: <code>{value}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overview Section */}
          {renderSection('ภาพรวม', pageDoc.overview, pageDoc.routeParams)}

          {/* Dynamic Content Section (if available) */}
          {pageDoc.dynamicContent &&
            renderSection('ข้อมูลเส้นทางปัจจุบัน', pageDoc.dynamicContent, pageDoc.routeParams)}

          {/* Instructions Section */}
          {renderSection('วิธีใช้งาน', pageDoc.instruction, pageDoc.routeParams)}

          {/* Flow Section */}
          {renderSection('ขั้นตอนการทำงาน', pageDoc.flow, pageDoc.routeParams)}

          {/* Logic Section */}
          {renderSection('ระบบงานและสิทธิ์', pageDoc.logic, pageDoc.routeParams)}

          {/* Additional role-specific sections */}
          {pageDoc.additionalSections &&
            Object.entries(pageDoc.additionalSections).map(([key, content]) =>
              renderSection(key, content, pageDoc.routeParams),
            )}

          {/* Show base documentation link if this is role-specific */}
          {pageDoc.baseDoc && (
            <div
              style={{
                background: '#f0f0f0',
                padding: 12,
                borderRadius: 6,
                marginTop: 16,
                fontSize: 12,
              }}
            >
              <Text type="secondary">
                💡 <b>หมายเหตุ:</b> เนื้อหานี้ได้รับการปรับแต่งตามบทบาทของคุณ
                หากต้องการดูเนื้อหาทั่วไป สามารถขอสิทธิ์จากผู้ดูแลระบบ
              </Text>
            </div>
          )}

          {/* Debug info in development */}
          {isDevelopment && (
            <div
              style={{
                background: '#f5f5f5',
                padding: 8,
                borderRadius: 4,
                marginTop: 16,
                fontSize: 11,
                color: '#666',
              }}
            >
              <b>🔧 Debug Info:</b>
              <br />
              Route: {location.pathname}
              <br />
              Match Type: {pageDoc.matchType || 'static'}
              <br />
              Has Role Specific: {pageDoc.baseDoc ? 'Yes' : 'No'}
              <br />
              Route Params: {JSON.stringify(pageDoc.routeParams || {})}
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default PageDoc;
