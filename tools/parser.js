
module.exports.parse = function(string, replace) {
    return string.split("%s").join(replace);
}