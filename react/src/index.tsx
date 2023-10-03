import React from "react";
import {createRoot} from "react-dom/client";
import queryString from "query-string";

import {App} from "./App";

import "./main.scss";

const search = queryString.parse(window.location.search);
const token_str = search.token instanceof Array ? search.token[0] : search.token;
const token = token_str ? Number(token_str) : undefined;
const room_name = (search.room instanceof Array ? search.room[0] : search.room) ?? undefined;

const container = document.getElementById("root");
const root = container ? createRoot(container) : null;
root?.render(<App token={token} room_name={room_name} />);
