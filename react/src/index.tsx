import React from 'react';
import ReactDOM from 'react-dom';
import queryString from 'query-string';

import { App } from './App';
import { TestGameView } from './test/TestGameView';

import './main.scss'

const search = queryString.parse(window.location.search);
const token = Number(search.token instanceof Array ? search.token[0] : search.token);
const room_name = search.room_name instanceof Array ? search.room_name[0] : search.room_name;

const testing = true;

ReactDOM.render(
  testing ?
    <TestGameView state="choosing" role="werewolf" is_mayor={false} /> :
    <App token={token} room_name={room_name ?? undefined}/>
  , document.getElementById('root')
);
