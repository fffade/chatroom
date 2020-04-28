
// checks if character is letter or number
function isAlphaNumeric(str) {
  let code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

Array.prototype.indexOf = function(value) {
	for(let i = 0; i < this.length; i++) {
		if(this[i] === value) {
			return i;
		}
	}
	return -1;
};

const CHARS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Z",
				"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "z",
				"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const ENCODED_CHARS = ["B", "c", "3", "6", "g", "5", "K", "H", "I", "v", "k", "8", "p", "N", "O", "q", "U", "n", "w", "T", "d", "V", "m", "o", "z",
				"a", "b", "P", "G", "e", "f", "R", "h", "X", "j", "F", "l", "1", "M", "Z", "x", "t", "r", "s", "A", "u", "W", "L", "Q", "S",
				"C", "2", "D", "4", "0", "E", "7", "J", "9", "i"];

/* encode a string with a specific shift */
module.exports.encode = function(string, shift) {

	let split_string = string.split("");

	let new_string = "";

	// create a shifted version of encoded chars
	let s_encoded_chars = ENCODED_CHARS.slice(0);
	for(let i = 0; i < shift; i++) {
		s_encoded_chars.unshift(s_encoded_chars.pop());
	}

	// convert characters to encoded
	for(let i = 0; i < split_string.length; i++) {
		if(CHARS.indexOf(split_string[i]) !== -1) {
			new_string += s_encoded_chars[CHARS.indexOf(split_string[i])];
		} else {
			new_string += split_string[i];
		}
	}

	return new_string;
};

/* decode a string with a specific shift */
module.exports.decode = function(string, shift) {

	let split_string = string.split("");

	let new_string = "";

	// create a shifted version of encoded chars
	let s_encoded_chars = ENCODED_CHARS.slice(0);
	for(let i = 0; i < shift; i++) {
		s_encoded_chars.unshift(s_encoded_chars.pop());
	}

	// convert characters from encoded to regular
	for(let i = 0; i < split_string.length; i++) {
		if(s_encoded_chars.indexOf(split_string[i]) !== -1) {
			new_string += CHARS[s_encoded_chars.indexOf(split_string[i])];
		} else {
			new_string += split_string[i];
		}
	}

	return new_string;
};

/* generate a random encoder shift */
module.exports.randEncodeShift = function() {
	return Math.floor(Math.random() * (ENCODED_CHARS.length - 1));
};