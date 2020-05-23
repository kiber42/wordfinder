import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import { App } from './App';

import './main.scss'

const search = queryString.parse(window.location.search);
const token_str = search.token instanceof Array ? search.token[0] : search.token;
const token = token_str ? Number(token_str) : undefined;
const room_name = (search.room instanceof Array ? search.room[0] : search.room) ?? undefined;

ReactDOM.render(
  <App token={token} room_name={room_name}/>
  , document.getElementById('root')
);
