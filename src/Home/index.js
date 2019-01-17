import React, { Component } from 'react';
import Bar from './Bar'
import Fields from './Fields'

export default class Home extends Component {

	render() {
		return (
			<div>
				<Bar />
				<Fields />
			</div>
		)
	}
}