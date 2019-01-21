import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ReactGA from 'react-ga';


ReactDOM.render(<App />, document.getElementById('root'));
ReactGA.initialize('UA-93148506-2');
ReactGA.pageview(window.location.pathname + window.location.search);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();



if (module.hot)
	module.hot.accept()