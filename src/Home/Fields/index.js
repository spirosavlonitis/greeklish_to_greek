import React, { Component } from 'react'
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';


export default class Fields extends Component {

	constructor(props) {
		super(props);

		this.lower_chars = [
	        "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
	        "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ",  "ω",
	        "ά", "ή" ,"έ", "ί", "ό", "ύ", "ώ"
    	];

    	this.atonoi = [ "α", "η", "ε", "ι", "ο", "υ", "ω" ];
    	this.tonoi =  [ "ά", "ή", "έ", "ί", "ό", "ύ", "ώ" ];
    	this.toned_chars = { "ά": "α", "ή": "η", "έ": "ε", "ί": "ι", "ό": "ο", "ύ": "υ", "ώ": "ω" };

		this.state = {
			cached_words: {},
			en_input: "",
			sigma: "",
			current_word: "",
			greek_text: ""
		};
		this.convert_char = this.convert_char.bind(this);
	}

	handle_special(temp_text) {
		return temp_text.replace(/Πσ([αεηιοωυ])/g, 'ψ'.toUpperCase()+'$1')
						.replace(/Τη([αεηιοωυ])/g, 'θ'.toUpperCase()+'$1')
						.replace(/Κσ([αεηιοωυ])/g, 'ξ'.toUpperCase()+'$1')
						.replace(/πσ([αεηιοωυ])/g, 'ψ'+'$1')
						.replace(/τη([αεηιοωυ])/g, 'θ'+'$1')
						.replace(/κσ([αεηιοωυ])/g, 'ξ'+'$1')
	}

	handle_non_apla(c) {
		const {greek_text, sigma} = this.state

		if (c === ' ' && sigma )
			this.setState({
				greek_text: (greek_text+c).replace(/σ /, 'ς '),
				sigma: false
			});
		else
			this.setState({
				greek_text: greek_text+c,
				sigma: false
			});
	}

	isupper = (c) =>
		(c >= 'A' && c <= 'Z');

	isalpha = (c) =>
		(this.isupper(c) || (c >= 'a' && c <= 'z'));	

	convert_char(e) {
		const {
			current_word, greek_text, sigma,
		} = this.state;
		let c = "";
		
	    const chars = {
	        "a": "α", "b": "β", "c": "ψ", "d": "δ", "e": "ε", "f": "φ",
	        "g": "γ", "h": "η", "i": "ι", "j": "ξ", "k": "κ", "l": "λ",
	        "m": "μ", "n": "ν", "o": "ο", "p": "π", "q": "ς", "r": "ρ",
	        "s": "σ", "t": "τ", "u": "υ", "v": "β", "w": "ω", "x": "χ",
	        "y": "υ","z": "ζ"
	    };
	    const vowels = ["a", "e", "h", "i", "o", "u", "y", "w"];
		
		if (e.KeyCode)
		 	c = String.fromCharCode(e.KeyCode);
		else if (e.which)
			c = String.fromCharCode(e.which);

		if (this.isalpha(c) === false) {
			this.handle_non_apla(c);
			return
		}

		if (this.isupper(c))
			c = chars[c.toLowerCase()].toUpperCase();
		else
			c = chars[c];
		
		this.setState({
			greek_text: this.handle_special(greek_text+c),
			sigma: c === "σ",
		});
	}

	get_backspace = (e) => {
		const {current_word, greek_text} = this.state;
		if (e.KeyCode !== 8 && e.which !== 8)
			return
		this.setState({
			greek_text: greek_text.length > 0 ?  greek_text.slice(0, greek_text.length-1) : ""
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
								onKeyPress= {this.convert_char}
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