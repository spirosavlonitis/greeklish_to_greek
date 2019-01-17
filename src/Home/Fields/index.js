import React, { Component } from 'react'
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';


export default class Fields extends Component {

	constructor(props) {
		super(props);

		this.state = {
			cached_words: {},
			current_char: "",
			current_word: "",
			greek_text: ""
		}

		this.convert_letter = this.convert_letter.bind(this)
	}

	convert_letter(e) {
		const {current_word, greek_text} = this.state;
		let current_char = ""
		
		if (e.KeyCode)
			current_char = String.fromCharCode(e.KeyCode)
		else if (e.which)
			current_char = String.fromCharCode(e.which)
		console.log(e.which)
		this.setState({
			greek_text: greek_text+current_char
		})
	}

	get_backspace = (e) => {
		const {current_word, greek_text} = this.state;
		if (e.KeyCode != 8 && e.which != 8)
			return


		this.setState({
			greek_text: greek_text.slice(0, greek_text.length-1)
		})
	}



	render() {
		const {cached_words, greek_text} = this.state;

		return (
			<div className="container">
				<div className="row">
					<div className="col-md-12">
						<div className="col-md-4">
							<FormGroup 
								controlId="formControlsTextarea"
								onKeyPress= {this.convert_letter}
								onKeyDown=	{this.get_backspace}
							>
      							<ControlLabel>Greeklish</ControlLabel>
      							<FormControl componentClass="textarea" placeholder="textarea" />
							</FormGroup>
						</div>
						<div className="col-md-4">
							options
						</div>
						<div className="col-md-4">
							<FormGroup controlId="formControlsTextarea">
      							<ControlLabel>Greek</ControlLabel>
      							<FormControl
      							 componentClass="textarea" 
      							 placeholder="textarea"
      							 value={greek_text}
      							/>
							</FormGroup>
						</div>
					</div>
				</div>
			</div>
		)
	}
}