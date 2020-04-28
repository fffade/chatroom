const characters = require("./characters");

/* generate a random id */
module.exports.genId6 = function() {
	let id = "";
	for(let i = 0; i < 6; i++) {
		id += characters.randAlphaNumeric();
	}
	return id;
}; 	