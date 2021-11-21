import Parser from 'expression-parser';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';
console.log(Parser.evaluate('1.5!'));
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
