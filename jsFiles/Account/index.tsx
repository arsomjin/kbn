import React from 'react';
import { Switch, Route, useRouteMatch, useParams } from 'react-router-dom';
import Income from './screens/Income';
import Expense from './screens/Expense';

/**
 * Main Account router component
 */
const Accounts: React.FC = () => {
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

/**
 * Account component that renders different modules based on route parameter
 */
const Account: React.FC = () => {
  // Using TypeScript's type system to ensure accountId is a string
  let { accountId } = useParams<{ accountId: string }>();
  let component: React.ReactNode;
  
  switch (accountId) {
    case 'income':
      component = <Income />;
      break;
    case 'expense':
      component = <Expense />;
      break;
    default:
      component = null;
      break;
  }
  
  return <div>{component}</div>;
}

export default Accounts;
