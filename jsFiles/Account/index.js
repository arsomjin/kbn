import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import Income from './screens/Income';
import Expense from './screens/Expense';

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
      component = <Income />;
      break;
    case 'expense':
      component = <Expense />;
      break;

    default:
      break;
  }
  return <div>{component}</div>;
}

export default Accounts;
