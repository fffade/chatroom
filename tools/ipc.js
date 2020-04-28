
module.exports.requestData = (ipc, name, criteria) => {
    return new Promise((resolve, reject) => {
        ipc.once(`${name}Reply`, (event, response) => {
            if(response.code === 0) {
                resolve(response.data);
            } else {
                reject(response);
            }
        });
        ipc.send(name, criteria);
    });
};