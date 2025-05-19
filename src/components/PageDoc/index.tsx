import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FloatButton, Drawer, Collapse } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import pageDocs from '../../in-app-docs/pageDocs';

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
        bodyStyle={{ padding: 0, background: 'var(--background, #fff)' }}
        style={{ zIndex: 1200 }}
      >
        {doc ? (
          <Collapse defaultActiveKey={['overview']} bordered={false} style={{ background: 'transparent' }}>
            <Panel header={t('ภาพรวม') + ' / Overview'} key='overview'>
              <div style={{ marginBottom: 0 }}>{doc.overview}</div>
            </Panel>
            <Panel header={t('คำแนะนำการใช้งาน') + ' / Instruction'} key='instruction'>
              <div style={{ marginBottom: 0 }}>{doc.instruction}</div>
            </Panel>
            <Panel header={t('ลำดับการทำงาน') + ' / Flow'} key='flow'>
              <div style={{ marginBottom: 0 }}>{doc.flow}</div>
            </Panel>
            <Panel header={t('ตรรกะธุรกิจ') + ' / Business Logic'} key='logic'>
              <div style={{ marginBottom: 0 }}>{doc.logic}</div>
            </Panel>
          </Collapse>
        ) : (
          <div style={{ padding: 24, color: '#888' }}>{t('ไม่มีคู่มือสำหรับหน้านี้')}</div>
        )}
      </Drawer>
    </>
  );
};

export default PageDoc;
