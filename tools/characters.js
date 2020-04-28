
module.exports.ALL_ALPHA_NUMERICS = [
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Z",
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "z",
	"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
];

module.exports.randAlphaNumeric = function() {
	return module.exports.ALL_ALPHA_NUMERICS[Math.floor(Math.random() * module.exports.ALL_ALPHA_NUMERICS.length)];
};