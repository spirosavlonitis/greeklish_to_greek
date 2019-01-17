import React from 'react';
import Navbar from 'react-bootstrap/lib/Navbar';

export default () => {
	return (
		<Navbar inverse>
			<Navbar.Header>
				<Navbar.Brand>
					<a href="#Home" >Greeklish To Greek</a>
				</Navbar.Brand>
			</Navbar.Header>
		</Navbar>
	)
}