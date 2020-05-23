import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import { App } from './App';

import './main.scss'

const search = queryString.parse(window.location.search);
const token = Number(search.token instanceof Array ? search.token[0] : search.token);
const room_name = search.room instanceof Array ? search.room[0] : search.room;

ReactDOM.render(
  <App token={token} room_name={room_name ?? undefined}/>
  , document.getElementById('root')
);
