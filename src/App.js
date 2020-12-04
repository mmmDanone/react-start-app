import React from 'react';
import logo from './logo.svg';
import style from './App.module.less';

function App() {
	return (
		<div className={style['App']}>
			<header className={style['App-header']}>
				<img src={logo} alt="logo" className={style['App-logo']} />
				<p>Edit <code>src/App.js</code> and save to reload.</p>
				<a href="https://reactjs.org" target="_blank" className={style['App-link']}>Learn React</a>
			</header>
		</div>
	);
}

export default App;