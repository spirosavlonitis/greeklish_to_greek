import React, { Component } from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import axios from 'axios';
import greek_words from './Greek.dic';

export default class Fields extends Component {

	constructor(props) {
		super(props);

		this.state = {
			cached_words: {},
			en_input: "",
			greeklish_text: "",
			greek_text: ""
		};
		this.convert_char = this.convert_char.bind(this);
	}

	is_greek_upper = c =>
		(c >= 'Α' && c <= 'Ω');

	is_greek_alpha = c =>
		( (c >= 'Α' && c <= 'Ω') || (c >= 'α' && c <= 'ω'));

	tone_word(word, word_list, retry=false) {
		const {cached_words,} = this.state;

     	const toned_chars = { "ά": "α", "ή": "η", "έ": "ε", "ί": "ι", "ό": "ο", "ύ": "υ", "ώ": "ω" };
		const lower_chars = [
	      	  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
	        	"ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ",  "ω",
	        	"ά", "ή" ,"έ", "ί", "ό", "ύ", "ώ"
    		];
		let best_match = "";
		let dic_word = "";
		let dif_letters = "";
		let temp_word = "";
		let i = this.is_greek_upper(word[0])	?  558849 : 0		// choose proper dictionary
		for ( ; i < word_list.length; i++) {
			dic_word = word_list[i];

			if (dic_word.charCodeAt(0) < word.charCodeAt(0)				// skip lower dictionary words
				&& (toned_chars[dic_word[0].toLowerCase()] === undefined	// not a vowel
					|| toned_chars[dic_word[0].toLowerCase()] !== word[0].toLowerCase())	// not the same vowel
				)
				continue;
			
			if ( Object.values(toned_chars).includes(word[0].toLowerCase()) === false 	// not a vowel
				&& Object.keys(toned_chars).includes(dic_word[0].toLowerCase()) === false // not a toned vowel
				&& dic_word.charCodeAt(0) > word.charCodeAt(0))
				break;
			
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
			if (dif_letters.length === 1 && toned_chars[dif_letters] === temp_word) {
				cached_words[word] = dic_word;
				best_match = dic_word;
				break;
			}
		}

		 if (best_match.length === 0 && retry === false && lower_chars.includes(word[0]) === false)   // word was not a capital word
		 	best_match = this.tone_word(word.toLowerCase(), word_list, true);
		
		if (best_match.length === 0) 
			return word;
		else
			return best_match;
	}


	handle_non_apla(c) {
		const {greek_text,cached_words } = this.state;

		axios.get(greek_words).then(res => {

			let lines_array = greek_text.split('\r');	// split text into lines
			let words_array = lines_array[lines_array.length-1].split(' ')	// get last line array
			let word = words_array[words_array.length-1];	// get last word

			if (word.length === 0) {		// only new character added
				this.setState({
					greek_text: greek_text+c,
				});
				return;
			}

			const symbols = ['.', ',', '\'', '!', '?'];			
			if (symbols.includes(word[word.length-1])) {		// symbol from previous entry
				this.setState({									// usuall followed by space
					greek_text: greek_text+c,
				});
				return;
			}

			if (cached_words[word] !== undefined) 	// cached word
				word = cached_words[word];
			else {		
				const sigma_exp = new RegExp("σ$");			// ending sigma
				word = word.replace(sigma_exp, "ς");
				word = this.tone_word(word, res.data.split('\n'));
			}
			
			words_array[words_array.length-1] = word;			// replace word
			lines_array[lines_array.length-1] = words_array.join(' ');		// rejoin last line

			/* capitalize lines */
			lines_array[0] = lines_array[0].replace(/^(.{1})/, m => m.toUpperCase()); // capitalize first letter
			let lines = lines_array.join('\r').replace(/[.!?] ?.{1}/gm, m => m.toUpperCase()); // rejoin lines, inline capitalize
			lines = lines.replace(/[.!?]\r.{1}/gm, m => m.toUpperCase()); // capitalize lines

			this.setState({		
				greek_text: lines+c,
			});
		})
	}

	handle_special(temp_text) {
		return temp_text.replace(/Πσ([αεηιοωυ])/g, 'ψ'.toUpperCase()+'$1')
						.replace(/Τη([αεηιοωυ])/g, 'θ'.toUpperCase()+'$1')
						.replace(/Κσ([αεηιοωυ])/g, 'ξ'.toUpperCase()+'$1')
						.replace(/πσ([αεηιοωυ])/g, 'ψ$1')
						.replace(/τη([αεηιοωυ])/g, 'θ$1')
						.replace(/κσ([αεηιοωυ])/g, 'ξ$1')
						.replace(/βατημ([αεηιοωυ])/g, 'βαθμ$1') // βαθμ
	}

	isupper = (c) =>
		(c >= 'A' && c <= 'Z');

	isalpha = (c) =>
		(this.isupper(c) || (c >= 'a' && c <= 'z'));	

	convert_char(e) {
		const {greek_text, greeklish_text} = this.state;
		let c = "";
		
	    const chars = {
	        "a": "α", "b": "β", "c": "ψ", "d": "δ", "e": "ε", "f": "φ",
	        "g": "γ", "h": "η", "i": "ι", "k": "κ", "l": "λ", // "j": "ξ" for delete
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

		let en_c = c;
		if (this.isupper(c))
			c = chars[c.toLowerCase()].toUpperCase();
		else
			c = chars[c];
		
		this.setState({
			greek_text: this.handle_special(greek_text+c),
			greeklish_text: e.target.value + en_c,
		});
	}

	get_backspace = (e) => {
		const {greek_text, greeklish_text} = this.state;
		if (e.KeyCode !== 8 && e.which !== 8)
			return
		
		let adjust = greek_text.match(/[θψξ]/ig);		// adjust for two char letters
		if (adjust === null)
			adjust = 0;
		else
			adjust = adjust.length;
		
		this.setState({
			greek_text: e.target.value.length > 0 ? greek_text.slice(0, e.target.value.length-adjust) : ""
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
								onKeyUp={this.get_backspace}
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