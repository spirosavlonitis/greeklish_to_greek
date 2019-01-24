import React, { Component } from 'react';
import Bar from './Bar'
import Fields from './Fields'
import CookieConsent from 'react-cookie-consent'

export default class Home extends Component {

	render() {
		return (
			<div>
				<Bar />
				<Fields />
				<CookieConsent>
				    This website uses cookies to enhance the user experience.
				</CookieConsent>
			</div>
		)
	}
}