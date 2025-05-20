import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FloatButton, Drawer, Collapse } from 'antd';
import { FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import pageDocs from '../../in-app-docs/pageDocs';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Panel } = Collapse;

type DocType = {
  overview: React.ReactNode;
  instruction: React.ReactNode;
  flow: React.ReactNode;
  logic: React.ReactNode;
};

const PageDoc: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const darkMode = useSelector((state: RootState) => state.theme?.darkMode);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  // Try to match the current path to a doc entry
  // Try exact, then fallback to first segment (e.g. /auth/login -> /auth/login, then /auth)
  const path = location.pathname;
  let doc: DocType | undefined = (pageDocs as Record<string, DocType>)[path];
  if (!doc) {
    // Try to match by first segment (e.g. /admin/users/123 -> /admin/users)
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 1) {
      const base = `/${segments[0]}/${segments[1]}`;
      doc = (pageDocs as Record<string, DocType>)[base];
    } else if (segments.length === 1) {
      doc = (pageDocs as Record<string, DocType>)[`/${segments[0]}`];
    }
  }

  return (
    <>
      <FloatButton
        icon={<FileTextOutlined />}
        onClick={() => setOpen(true)}
        tooltip={t('คู่มือการใช้งาน')}
        style={{ right: 24, bottom: 24, zIndex: 1100 }}
      />
      <Drawer
        title={t('คู่มือสำหรับหน้านี้')}
        placement='right'
        onClose={() => setOpen(false)}
        open={open}
        width={Math.min(window.innerWidth, 400)}
        bodyStyle={{
          padding: 0,
          background: darkMode ? 'var(--color-paper, #23241e)' : 'var(--background, #fff)',
          color: darkMode ? 'var(--color-text, #e9e5dd)' : 'inherit',
          minHeight: '100vh'
        }}
        style={{ zIndex: 1200 }}
        className={darkMode ? 'dark' : ''}
      >
        {/* Mini close button for mobile */}
        {isMobile && (
          <button
            aria-label='Close'
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1300,
              background: darkMode ? '#23241e' : '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: darkMode ? '#e9e5dd' : '#222',
              fontSize: 20
            }}
          >
            <CloseOutlined />
          </button>
        )}
        {doc ? (
          <Collapse
            defaultActiveKey={['overview']}
            bordered={false}
            style={{ background: 'transparent', color: darkMode ? 'var(--color-text, #e9e5dd)' : 'inherit' }}
            className={darkMode ? 'dark' : ''}
          >
            <Panel header={t('ภาพรวม') + ' / Overview'} key='overview'>
              <div style={{ marginBottom: 0 }}>{doc.overview}</div>
            </Panel>
            <Panel header={t('คำแนะนำการใช้งาน') + ' / Instruction'} key='instruction'>
              <div style={{ marginBottom: 0 }}>{doc.instruction}</div>
            </Panel>
            <Panel header={t('ลำดับการทำงาน') + ' / Flow'} key='flow'>
              <div style={{ marginBottom: 0 }}>{doc.flow}</div>
            </Panel>
            <Panel header={t('ระบบงาน') + ' / Business Logic'} key='logic'>
              <div style={{ marginBottom: 0 }}>{doc.logic}</div>
            </Panel>
          </Collapse>
        ) : (
          <div style={{ padding: 24, color: darkMode ? '#b9b5ad' : '#888' }}>{t('ไม่มีคู่มือสำหรับหน้านี้')}</div>
        )}
      </Drawer>
    </>
  );
};

export default PageDoc;
