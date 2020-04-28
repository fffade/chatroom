
module.exports.buildInsertQuery = function(table, obj) {
	let msg = "INSERT INTO `" + table + "` (`";
	for(let key in obj) {
		msg += key + "`,`";
	}
	msg = msg.substring(0, (msg.length - 1) - 1);
	msg += ") VALUES (";
	for(let key in obj) {
		msg += obj[key] + ",";
	}
	msg = msg.substring(0, msg.length - 1);
	msg += ")";
	console.log("Built insert query: " + msg);
	return msg;
};

module.exports.Cache = function(conn, sql) {
	this.conn = conn;
	this.sql = sql;
	this.data = [];
};

module.exports.Cache.prototype.reload = function() {
	let that = this;
	return new Promise(function(resolve, reject) {
		that.conn.query(that.sql, (err, results, fields) => {
			if(!err) {
				that.data = results;
				resolve(0);
			} else {
				reject(0);
			}
		});
	});
};
