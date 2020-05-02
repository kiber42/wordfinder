import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import App from './App';

const search = queryString.parse(window.location.search);
const token = search.token;
const room_name = search.room_name;

ReactDOM.render(  
  <App token={token} room_name={room_name}/>,
  document.getElementById('root')
);
