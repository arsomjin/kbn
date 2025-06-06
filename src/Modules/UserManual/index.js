import React, { useEffect, useState } from 'react';
import { UserManualItems } from 'data/Constant';
import { showLog } from 'functions';
import { useRouteMatch } from 'react-router-dom';
import * as PDF_FILES from 'pdf';
import PDFViewer from 'components/PDFViewer';

const Settings = () => {
  const [title, setTitle] = useState(UserManualItems.account);

  let match = useRouteMatch();
  showLog('match', match);

  useEffect(() => {
    switch (match.path) {
      case '/user-manual/account':
        setTitle(UserManualItems.account);
        break;
      case '/user-manual/sale':
        setTitle(UserManualItems.sale);
        break;
      case '/user-manual/service':
        setTitle(UserManualItems.service);
        break;
      case '/user-manual/warehouse':
        setTitle(UserManualItems.warehouse);
        break;
      case '/user-manual/credit':
        setTitle(UserManualItems.credit);
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let pdf = PDF_FILES.Account;

  switch (title) {
    case UserManualItems.account:
      pdf = PDF_FILES.Account;
      break;
    case UserManualItems.sale:
      pdf = PDF_FILES.Sale;
      break;
    case UserManualItems.service:
      pdf = PDF_FILES.Service;
      break;
    case UserManualItems.warehouse:
      pdf = PDF_FILES.Inventory;
      break;
    case UserManualItems.credit:
      pdf = PDF_FILES.Credit;
      break;

    default:
      pdf = PDF_FILES.Account;
      break;
  }

  return <PDFViewer pdf={pdf} singlePage />;
};

export default Settings;
