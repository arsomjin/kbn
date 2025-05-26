import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import systemOverviewEn from '../in-app-docs/systemOverview.en';
import systemOverviewTh from '../in-app-docs/systemOverview.th';

const SystemOverview: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const content = lang.startsWith('th') ? systemOverviewTh : systemOverviewEn;

  return (
    <div className="p-6">
      <Card>
        <div className="mb-8">{content.overview}</div>
        <div className="mb-8">{content.instruction}</div>
        <div className="mb-8">{content.flow}</div>
        <div className="mb-8">{content.logic}</div>
      </Card>
    </div>
  );
};

export default SystemOverview;
