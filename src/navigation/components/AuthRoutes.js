import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import Auth from 'Modules/Auth';

export default () => {
  return (
    <div>
      <Route path="/login" component={Auth} />
      <Redirect exact to="/login" from="/" />
    </div>
  );
};
