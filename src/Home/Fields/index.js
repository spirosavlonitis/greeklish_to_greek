import React, { Component } from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import axios from 'axios';
import greek_capital_words from './Greek_capital.dic';

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

		this.state = {
			cached_words: {},
			en_input: "",
			greek_text: ""
		};
		this.convert_char = this.convert_char.bind(this);
	}

	handle_special(temp_text) {
		return temp_text.replace(/Πσ([αεηιοωυ])/g, 'ψ'.toUpperCase()+'$1')
						.replace(/Τη([αεηιοωυ])/g, 'θ'.toUpperCase()+'$1')
						.replace(/Κσ([αεηιοωυ])/g, 'ξ'.toUpperCase()+'$1')
						.replace(/πσ([αεηιοωυ])/g, 'ψ$1')
						.replace(/τη([αεηιοωυ])/g, 'θ$1')
						.replace(/κσ([αεηιοωυ])/g, 'ξ$1')
	}

	tone_word(word, word_list, retry=false) {
     	const toned_chars = { "ά": "α", "ή": "η", "έ": "ε", "ί": "ι", "ό": "ο", "ύ": "υ", "ώ": "ω" };
		
		let best_match = "";
		let dic_word = "";
		let dif_letters = "";
		let temp_word = "";
		
		for (let i = 0; i < word_list.length; i++) {
			dic_word = word_list[i];
			if (dic_word[i] !== word[i]){		// check if the letter is a toned letter
				if (Object.keys(toned_chars).includes(dic_word[0].toLowerCase()) === false  || toned_chars[dic_word[0].toLowerCase()] !== word[0])	// and if its the toned word letter
					continue;
			}else if (dic_word[0] > word[0]) {
				break;
			}
			
			if (dic_word.length !== word.length)			// unequal words
				continue;

			dif_letters = "";
			temp_word = word.toLowerCase();
			for (let j in word)
				if (dic_word[j].toLowerCase() === word[j].toLowerCase())
					temp_word = temp_word.replace(word[j].toLowerCase(), '');
				else
					dif_letters += dic_word[j].toLowerCase();

			/* one different character and it's a toned vowel */
			if (dif_letters.length === 1 && toned_chars[dif_letters] === temp_word)
				return dic_word;
		}
		return word;
	}

	handle_non_apla(c) {
		const {greek_text} = this.state

		if (c === ' ' || c === '\n')
			axios.get(greek_capital_words).then(res => {
				let text_array = this.handle_special((greek_text+c).replace(/σ /, 'ς ')).split(' ');
				
				let word = this.tone_word(text_array[text_array.length-2], res.data.split('\n'));
				console.log(word)
				this.setState({
					greek_text: (text_array.slice(0,text_array.length-2).join(' ')+' '+word+' ').trimStart()
				});

			})
		else 
			this.setState({
				greek_text: greek_text+c
			});
	}

	isupper = (c) =>
		(c >= 'A' && c <= 'Z');

	isalpha = (c) =>
		(this.isupper(c) || (c >= 'a' && c <= 'z'));	

	convert_char(e) {
		const {greek_text,} = this.state;
		let c = "";
		
	    const chars = {
	        "a": "α", "b": "β", "c": "ψ", "d": "δ", "e": "ε", "f": "φ",
	        "g": "γ", "h": "η", "i": "ι", "j": "ξ", "k": "κ", "l": "λ",
	        "m": "μ", "n": "ν", "o": "ο", "p": "π", "q": "ς", "r": "ρ",
	        "s": "σ", "t": "τ", "u": "υ", "v": "β", "w": "ω", "x": "χ",
	        "y": "υ","z": "ζ"
	    };
		
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
		});
	}

	get_backspace = (e) => {
		const {greek_text} = this.state;
		if (e.KeyCode !== 8 && e.which !== 8)
			return
		this.setState({
			greek_text: greek_text.length > 0 ?  greek_text.slice(0, greek_text.length-1) : "",
		})
	}

	render() {
		const {greek_text} = this.state;

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