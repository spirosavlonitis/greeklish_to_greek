import React, { Component } from 'react';
import TopBarProgress from "react-topbar-progress-indicator";
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Panel from 'react-bootstrap/lib/Panel';
import axios from 'axios';
import greek_words from './Greek.dic';
import cached_mathes from './seen_words';
import suggest_cached_words from './seen_words_suggest_trimmed';
import "./index.css";

TopBarProgress.config({
  barColors: {
    "0": "#f00",
    "1.0": "#ff5050",
  },
  shadowBlur: 5,
});


export default class Fields extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isloading: true,
			first_input: true,
			cached_list: [],
			seen_words: cached_mathes,
			suggest_seen_words: suggest_cached_words,
			raw_input: false,
			suggest: false,
			only_tonoi: false,
			auto_cap: true,
			greek_text: ""
		};

		this.convert_char = this.convert_char.bind(this);
		this.greek_text_change = this.greek_text_change.bind(this);
	}

	isupper = (c) =>
		(c >= 'A' && c <= 'Z');

	isalpha = (c) =>
		(this.isupper(c) || (c >= 'a' && c <= 'z'));

	is_greek_upper = c =>
		(c >= 'Α' && c <= 'Ω');

	is_greek_alpha = c =>
		( (c >= 'Α' && c <= 'Ω') || (c >= 'α' && c <= 'ω'));

	handle_special(temp_text) {
		return temp_text.replace(/Πσ([αεηιοωυ])/g, 'ψ'.toUpperCase()+'$1')
						.replace(/Τη([αεηιοωυ])/g, 'θ'.toUpperCase()+'$1')
						.replace(/Κσ([αεηιοωυ])/g, 'ξ'.toUpperCase()+'$1')
						.replace(/πσ([αεηιοωυ])/g, 'ψ$1')
						.replace(/τη([αεηιοωυρ])/g, 'θ$1')
						.replace(/8([αεηιοωυρ])/g, 'θ$1')
						.replace(/κσ([αεηιοωυ])/g, 'ξ$1')
						.replace(/βατημ([αεηιοωυ])/g, 'βαθμ$1') // βαθμ
	}

	samecase_macthes(lines) {
		const lower_chars = [
	      	  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
	        	"ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ",  "ω",
	        	"ά", "ή" ,"έ", "ί", "ό", "ύ", "ώ"
    		];

    	lines = lines.split('\r');					// split into line array
		let line = lines[lines.length-1].split(' ');	// last line array
		let word = line[line.length-1];					// last word of last line
    													/* for raw input */
    	if (lower_chars.includes(word[0]) === false && this.isalpha(word[0]) === false) {
    		word = word.split('/');
    		word = word.map(s => s[0].toUpperCase() + s.substring(1)).join('/');
    	}
    	/* reasmble the lines */
   		line[line.length-1] = word;		
   		lines[lines.length-1] = line.join(' ');
   		lines = lines.join('\r');			
    	
    	return lines;
	}

	tone_word(word, word_list, retry=false) {
		const {seen_words, suggest, only_tonoi, suggest_seen_words} = this.state;

     	const toned_chars = { "ά": "α", "ή": "η", "έ": "ε", "ί": "ι", "ό": "ο", "ύ": "υ", "ώ": "ω" };
		const lower_chars = [
	      	  "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
	        	"ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ",  "ω",
	        	"ά", "ή" ,"έ", "ί", "ό", "ύ", "ώ"
    		];
		let best_match = [];
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
				if (suggest === false) {
					seen_words[word] = dic_word;
					return dic_word;
				}else 
					best_match.push(dic_word);
			}
		}

		if (best_match.length === 0 && retry === false && lower_chars.includes(word[0]) === false){   // word was not a capital word
		 	if (word.match(/(Τ|τ)ηρ/) && only_tonoi === false){
		 		best_match.push(this.tone_word(word.replace(/(Τ|τ)ηρ/, 'θρ').toLowerCase(), word_list, true));
		 		best_match.push(this.tone_word(word.toLowerCase(), word_list, true));
			 	if (suggest === false)
			 		return best_match.map(s => s[0].toUpperCase() + s.substring(1)).join('/');
		 	}else if(word.match(/(Θ|θ)ρ/) && only_tonoi === false){
		 		best_match.push(this.tone_word(word.replace(/(Θ|θ)ρ/, 'τηρ').toLowerCase(), word_list, true));
		 		best_match.push(this.tone_word(word.toLowerCase(), word_list, true));
			 	if (suggest === false)
			 		return best_match.map(s => s[0].toUpperCase() + s.substring(1)).join('/');
		 	}else
		 		best_match.push(this.tone_word(word.toLowerCase(), word_list, true));

		 	best_match = best_match.flat();		// flatten two dimention array created from array returned
		 	if (suggest === false)
		 		return best_match[0];
		}else if (best_match.length === 0 && retry === false && word.match(/θρ/) && only_tonoi === false){  // maybe τηρ 
			best_match.push(this.tone_word(word.replace(/θρ/, 'τηρ'), word_list, true));
		 	best_match = best_match.flat();
		 	if (suggest === false)
		 		return best_match[0];		
		}

		if (best_match.length === 0) 		// no match found return original word
			return word;
		else {
			if (retry)		// return best match in array form
				return best_match;
			
			if (best_match !== word)		// add only if  a correct word is found
				suggest_seen_words[word] = best_match.join('/');
			
			return best_match.join('/');	// return word and any suggestions
		}
	}

	convert(c, word_list=[]) {
		const {
			greek_text, seen_words, suggest, only_tonoi, auto_cap,
			suggest_seen_words, first_input, cached_list 
		} = this.state;

		if (word_list.length === 0)
			word_list = cached_list
		
		let lines_array = greek_text.split( only_tonoi ? '\n' : '\r');	// split text into lines
		if (only_tonoi && auto_cap)
			lines_array[lines_array.length-1] = lines_array[lines_array.length-1].replace(/([.!?,])(?! )/gm, '$1 ');

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

		const capital_word = this.is_greek_upper(word[0]);  // user entered a capital word
		word = word.replace(new RegExp("σ$"), "ς"); 		// ending sigma

		if (seen_words[word] !== undefined && suggest === false) {
			word = seen_words[word];
		}else if (suggest && (suggest_seen_words[word] !== undefined || seen_words[word] !== undefined)){
			if (suggest_seen_words[word] !== undefined)
				word = suggest_seen_words[word];
			else
				word = seen_words[word];
		}else {		
			word = this.tone_word(word, word_list);
		}
		if (capital_word)
			word = word[0].toUpperCase() + word.substring(1, word.length);
		
		words_array[words_array.length-1] = word;			// replace word
		lines_array[lines_array.length-1] = words_array.join(' ');		// rejoin last line

		/* capitalize lines */
		let lines;
		if (auto_cap) {
			lines_array[0] = lines_array[0].replace(/^(.{1})/, m => m.toUpperCase()); // capitalize first letter
			lines_array = lines_array.map( line => line.trim()); 
			lines = lines_array.join('\r').replace(/[.!?] ?.{1}/gm, m => m.toUpperCase()); // rejoin lines, inline capitalize
			lines = lines.replace(/[.!?]\r.{1}/gm, m => m.toUpperCase()); // capitalize lines
			lines = lines.replace(/([.!?,])(?! )/gm, '$1 '); // canonicalize delimiters
		}else 
			lines = lines_array.join('\r')
		
		if (suggest && (auto_cap || capital_word))
			 lines = this.samecase_macthes(lines);
		

		if (first_input)			// use the loading bar for the first conversion
			this.setState({		
				first_input: false,
				isloading: false,
				cached_list: word_list,
				greek_text: lines+c
			});
		else
			this.setState({		
				greek_text: lines+c,
			});
	}

	handle_non_apla(c) {
		const {first_input, cached_list } = this.state;
		
		if (first_input)
			this.setState({
				isloading:true
			})

		if (cached_list.length === 0)
			axios.get(greek_words).then(res => {
				this.convert(c, res.data.split('\n'))
			})
		else
			this.convert(c, cached_list)
	}

	convert_char(e) {
		const {greek_text, raw_input, auto_cap} = this.state;
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

		if (raw_input) {
			this.setState({
				greek_text: greek_text+c
			})
			return
		}

		if (this.isalpha(c) === false) {			// tone word if space
			this.handle_non_apla(c);
			return
		}
		if (this.isupper(c))
			c = chars[c.toLowerCase()].toUpperCase();
		else
			c = chars[c];
		
		let new_text;
		if (auto_cap)		
			new_text = greek_text.replace(/([.,?!])([^ ])/, '$1 $2'); // canonicalize symbols
		else
			new_text = greek_text;
		this.setState({
			greek_text: this.handle_special(new_text+c),
		});
	}

	greek_text_change(e) {
		const {only_tonoi, cached_list, first_input, greek_text} = this.state;
		const backcpase = greek_text.length > e.target.value.length;
		const paste = e.target.value.length-greek_text.length > 1;
		
		if (only_tonoi === false || backcpase || paste){		// check of user is deleting a char
			this.setState({
				greek_text: e.target.value
			})
			return;
		}

		const c = e.target.value[e.target.value.length-1];
		if (this.is_greek_alpha(c)) {
			this.setState({
				greek_text: e.target.value
			})
			return;
		}

		if (first_input)
			this.setState({
				isloading:true
			})

		if (cached_list.length === 0)
			axios.get(greek_words).then(res => {
				this.convert(c, res.data.split('\n'))
			})
		else
			this.convert(c, cached_list)
	}

	get_backspace = (e) => {
		const {greek_text, } = this.state;
		if (e.KeyCode !== 8 && e.which !== 8)
			return

		this.setState({
			greek_text: greek_text.length > 0 ? greek_text.slice(0, greek_text.length-1) : ""
		})
	}

	set_auto_cap = e => {
		const {auto_cap} = this.state;
		this.setState({
			auto_cap: !auto_cap
		});
		this.setState();
	}

	set_tonoi = e => {
		const {only_tonoi} = this.state;
		this.setState({
			only_tonoi: !only_tonoi
		});
		this.setState();
	}

	set_suggest = e => {
		const {suggest} = this.state;
		this.setState({
			suggest: !suggest
		})
	}
	set_input = e => {
		const {raw_input} = this.state;
		this.setState({
			raw_input: !raw_input
		})
	}

	componentDidMount() {
		this.setState({
			isloading: false
		});
	}

	render() {
		const {greek_text, raw_input, suggest, only_tonoi, auto_cap, isloading} = this.state;

		const set_visibility = { visibility: only_tonoi ? 'hidden' : 'visible' }
		const center_text = {
			  margin: 'auto',
			  padding: '10px',
			  'min-width': only_tonoi ? '100%' : '',
		}
		return (
			<div>
				{ isloading && <TopBarProgress />}
				<div className="container">
					<div className="row">
						<div className="col-md-12">
							<div className="col-md-4" style={set_visibility}>
								<FormGroup 
									controlId="formControlsTextarea"
									onKeyPress= {this.convert_char}
									onKeyDown={this.get_backspace}
								>
	      							<ControlLabel>Greeklish</ControlLabel>
	      							{ only_tonoi === false &&
		      							<FormControl 
		      								componentClass="textarea"
		      								placeholder="" 
		      							/>
	      							}
								</FormGroup>
							</div>
							<div className="col-md-4" align="center">
								<FormGroup style={set_visibility} >
									<ControlLabel className="switchLabel" >Raw Input &nbsp;</ControlLabel>
									<label className="switch">
									  <input type="checkbox" />
									  <span classssName="slider"></span>
									</label>
									<b className="switchText" >OFF</b>
									<label className="switch">
									  <input type="checkbox" 
										onClick={this.set_input}
										checked={raw_input}  
										/>
									  <span className="slider round"></span>
									</label>
									<b className="switchText" >ON</b>
								</FormGroup>
								<FormGroup >
									<ControlLabel className="switchLabel" >Suggestions</ControlLabel>
									<label className="switch">
									  <input type="checkbox" />
									  <span classssName="slider"></span>
									</label>
									<b className="switchText" >OFF</b>
									<label className="switch">
									  <input type="checkbox" 
										onClick={this.set_suggest}
										checked={suggest}
									   />
									  <span className="slider round"></span>
									</label>
									<b className="switchText" >ON</b>
								</FormGroup>
								<FormGroup >
									<ControlLabel className="switchLabel" >Only Tonoi</ControlLabel>
									<label className="switch">
									  <input type="checkbox" />
									  <span classssName="slider"></span>
									</label>
									<b className="switchText" >OFF</b>
									<label className="switch">
									  <input type="checkbox" 
										onClick={this.set_tonoi}
										checked={only_tonoi}
									   />
									  <span className="slider round"></span>
									</label>
									<b className="switchText" >ON</b>
								</FormGroup>
								<FormGroup >
									<ControlLabel className="switchLabel" >Auto Caps</ControlLabel>
									<label className="switch">
									  <input type="checkbox" />
									  <span classssName="slider"></span>
									</label>
									<b className="switchText" >OFF</b>
									<label className="switch">
									  <input type="checkbox" 
										onClick={this.set_auto_cap}
										checked={auto_cap}
									   />
									  <span className="slider round"></span>
									</label>
									<b className="switchText" >ON</b>
								</FormGroup>
							</div>
							<div className="col-md-4" style={center_text}>
								<FormGroup controlId="formControlsTextarea">
	      							<ControlLabel>Greek</ControlLabel>
	      							<FormControl 
	      							 componentClass="textarea"
	      							 placeholder=""	      							 
	      							 value={greek_text}
	      							 onChange={this.greek_text_change}
	      							/>
								</FormGroup>
							</div>
						</div>
					</div>
			        <Panel id="collapsible-panel-example-2" style={set_visibility}>
			          <Panel.Heading >
			            <Panel.Title toggle>
			             Οδηγίες Χρήσης
			            </Panel.Title>
			          </Panel.Heading>
			          <Panel.Collapse>
			            <Panel.Body>
			            	Για να μετατρέψετε ένα κείμενο από Greeklish σε Greek απλά γράψτε στο πεδίο Greeklish και δείτε το στο πεδίο Greek στα Ελληνικά.<br/>
			            	Οι επιλογές ON/OFF κάνουν τα εξής:<br/>
			            	<b>Raw input</b>: Όταν είναι ON ότι γράψουμε στο Greeklish πεδίο εμφανίζετε στο Greek πεδίο χωρίς καμιά μετατροπή.<br/>
			            	<b>Suggestions</b>: Όταν είναι ON λέξεις  πού τονίζονται με περισσοτέρους από έναν τόνους εμφανίζονται χωρισμένες με / για παράδειγμα αλλά/άλλα<br/>
			            	<b>Only Tonoi</b>: Όταν είναι ON φεύγει το Greeklish πεδίο και μένει μονό το Greek πεδίο. Μέτα γράφουμε στο  Greek πεδίο με ελληνικούς χαρακτήρες και οι τόνοι, τελικά ς μπαίνουν αυτόματα. Τα Suggestions εάν είναι   ON συνεχίζουν να λειτουργούν.<br/>
			            	<b>Auto Caps</b>: Όταν εινα  ON το κείμενο βάζει αυτόματα κεφαλαία γράμματα οπότε χρειάζεται για περισσότερο ελέγχο πάνω στο κείμενο μπορούμε να απενεργοποιήσουμε αυτήν την επιλογή.
			            </Panel.Body>
			          </Panel.Collapse>
			        </Panel>
			        <Panel id="collapsible-panel-example-3" style={set_visibility}>
			          <Panel.Heading >
			            <Panel.Title toggle>
			             Greeklish Αλφάβητο
			            </Panel.Title>
			          </Panel.Heading>
			          <Panel.Collapse>
			            <Panel.Body>
			            	 Α &nbsp;:&nbsp; Α,&nbsp; Β &nbsp;:&nbsp; V&nbsp;,&nbsp; Γ &nbsp;:&nbsp; G&nbsp;,&nbsp;
			            	 Δ &nbsp;:&nbsp; D,&nbsp; Ε &nbsp;:&nbsp; E,&nbsp; Z &nbsp;:&nbsp; Z,&nbsp; Η &nbsp;:&nbsp; H,&nbsp;
			            	 Θ &nbsp;:&nbsp; TH | 8, &nbsp; Ι &nbsp;:&nbsp; I,&nbsp; Κ &nbsp;:&nbsp; K,&nbsp; Λ &nbsp;:&nbsp; L,&nbsp;
			            	 Μ &nbsp;:&nbsp; M,&nbsp; Ν &nbsp;:&nbsp; N,&nbsp; Ξ &nbsp;:&nbsp; J&nbsp; |&nbsp; KS,&nbsp;  Ο &nbsp;:&nbsp; O,&nbsp;
			            	 Π &nbsp;:&nbsp; P,&nbsp;  Ρ &nbsp;:&nbsp; R,&nbsp; &nbsp;Σ &nbsp;:&nbsp; S,&nbsp; Τ &nbsp;:&nbsp; T,&nbsp;
			            	 Υ &nbsp;:&nbsp; Y&nbsp; |&nbsp; U,&nbsp; Φ &nbsp;:&nbsp; F,&nbsp;  Χ  &nbsp;:&nbsp; X,&nbsp;  Ψ  &nbsp;:&nbsp; PS,&nbsp; Ω  &nbsp;:&nbsp; W
			            </Panel.Body>
			          </Panel.Collapse>
			        </Panel>
				</div>
 
      </div>
		)
	}
}