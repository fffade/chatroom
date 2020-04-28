const io = require("socket.io-client");


module.exports = class Client {

    constructor(address) {
        this.id = "00000";
        this.name = "DISCONNECTED";
        this.connected = false;
        this.onSubServerPacket = {};
        this.connect(address);
    }

    connect(address) {
        let that = this;
        this.log(`Connecting to ${address}`);
        this.socket = io(address);
        this.socket.on("connect", () => {
            that.log(`Successfully connected to ${address}`);
            that.address = address;
            that.connected = true;
            that.socket.emit("verify", {type: "CLIENT"}, (response) => {
                if(response.code === 0) {
                    that.updateInfo().then(() => {
                        that.log("Successfully verified client with base server");
                        if(that.onVerify) {
                            that.onVerify();
                        }
                    }).catch((err) => {
                        that.log(`Error updating client info: ${err.err}`);
                        that.disconnect();
                    });
                }
            });
            if(that.onConnect) {
                that.onConnect();
            }
        });
        this.socket.on("subServerPacket", (data, callback) => {
            if(data.server && data.content) {
                that.log(`Received packet from sub-server ${data.server.id}-${data.server.name}: ${data.content.type}`);
                let type = data.content.type;
                if(!type) type = "_NONE";
                if(that.onSubServerPacket.hasOwnProperty(type)) {
                    that.onSubServerPacket[type](data.content);
                }
            }
        });
        this.socket.on("disconnect", () => {
            if(that.onDisconnect) {
                that.onDisconnect();
            }
            that.log(`Disconnected from ${address}`);
            that.address = "";
            that.connected = false;
        });
    }

    connectToSubServer(nameOrId) {
        let that = this;
        return new Promise((resolve, reject) => {
            if(this.connected) {
                this.socket.emit("connectToSubServer", {server: nameOrId}, (response) => {
                    if(response.code === 0) {
                        that.log(`Connected to sub-server ${nameOrId}`);
                        resolve();
                    } else {
                        reject(response);
                    }
                });
            } else {
                reject({code: -1, err: "not connected to base server"});
            }
        });
    }

    disconnect() {
        let that = this;
        return new Promise((resolve, reject) => {
            if(that.connected) {
                that.log("Manually disconnecting from servers");
                that.socket.emit("disconnectFromSubServer", {client: that.id}, (response) => {
                    if(response.code === 0) {
                        that.socket.close();
                        resolve();
                    } else {
                        reject(response);
                    }
                });
            } else {
                reject({code: -1, err: "not connected to base server"});
            }
        });
    }

    sendPacket(packet) {
        let that = this;
        return new Promise((resolve, reject) => {
            if(that.connected) {
                that.socket.emit("sendToSubServer", {content: packet}, (response) => {
                    if(response.code === 0) {
                        that.log(`Sent ${packet.type} packet to sub-server`);
                        resolve();
                    } else {
                        reject(response);
                    }
                });
            } else {
                reject({code: -1, err: "not connected to base server"});
            }
        });
    }

    updateInfo() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.socket.emit("getClientInfo", {}, (response) => {
                if(response.code === 0) {
                    that.id = response.data.id;
                    that.name = response.data.name;
                    resolve();
                } else {
                    reject(response);
                }
            });
        });
    }

    findPersistData(database, criteria) {
        let that = this;
        return new Promise((resolve, reject) => {
            if(that.connected) {
                that.socket.emit("findPersistData", {database: database, criteria: criteria}, (response) => {
                    if(response.code === 0) {
                        resolve(response.data);
                    } else {
                        reject(response);
                    }
                });
            } else {
                reject({code: -1, err: "not connected to sub-server"})
            }
        });
    }

    insertPersistData(database, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            if(that.connected) {
                that.socket.emit("insertPersistData", {database: database, data: data}, (response) => {
                    if(response.code === 0) {
                        resolve();
                    } else {
                        reject(response);
                    }
                });
            } else {
                reject({code: -1, err: "not connected to sub-server"})
            }
        });
    }

    log(message) {
        console.log(`[${this.id}-${this.name}] ${message}`);
    }
};

