import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import Income from './screens/Income';
import Expense from './screens/Expense';
import { PermissionGate } from 'components';

const Accounts = () => {
  let match = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route path={`${match.path}/:accountId`}>
          <Account />
        </Route>
        <Route path={match.path}>
          <h3>Please select an account.</h3>
        </Route>
      </Switch>
    </div>
  );
};

function Account() {
  let { accountId } = useParams();
  let component;
  switch (accountId) {
    case 'income':
      component = (
        <PermissionGate permission="accounting.view">
          <Income />
        </PermissionGate>
      );
      break;
    case 'expense':
      component = (
        <PermissionGate permission="accounting.view">
          <Expense />
        </PermissionGate>
      );
      break;

    default:
      break;
  }
  return <div>{component}</div>;
}

export default Accounts;
