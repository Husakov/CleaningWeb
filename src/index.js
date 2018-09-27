import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'
import '@kemoke/react-select/dist/react-select.css';
import 'react-table/react-table.css'

ReactDOM.render(<App/>, document.getElementById('root'));
//registerServiceWorker();
navigator.serviceWorker.ready.then(sw => sw.unregister());
