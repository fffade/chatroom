const ElectronStore = require("electron-store");
const encoder = require("../tools/encoder");
const parser = require("../tools/parser");
const sqltools = require("../tools/mysql");
const doctools = require("../tools/doctools");
const idgen = require("../tools/idgen");
const ipcTools = require("../tools/ipc.js");
require("../application")();
require("../tools/menus")();
require("../tools/pages")();

const ipc = require('electron').ipcRenderer;
const store = new ElectronStore();

// close all menus when user clicks anywhere
document.onclick = function(event) {

};

// messages page
const messagesPage = new Pages("messages", document.getElementById("messages"), 0, () => {

    let createMessage = function(msgData) {
        let msgEl = document.createElement("p");
        msgEl.id = "message-" + msgData.id;
        msgEl.innerHTML = "<strong>" + msgData.senderId + "</strong>: " + msgData.text;
        msgEl.className = "xxs_margin_left xxxs_margin_top xs_margin_btm custom_header";
        return msgEl;
    };

    // 1. find the direct messages between this user and the active friend id
    // 2. merge all direct message data together
    // 3. clear messages html
    // 4. re-add every message to html
    let friendId = store.get("dmData").friendId;
    ipcTools.requestData(ipc, "requestDmData", {senderId: store.get("userInfo").userId, recipientId: friendId}).then((userDmData) => {
        ipcTools.requestData(ipc, "requestDmData", {recipientId: store.get("userInfo").userId, senderId: friendId}).then((friendDmData) => {
            let allDmData = userDmData.concat(friendDmData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            document.getElementById("messages").innerHTML = "";

            for(let i = Math.max(allDmData.length - 16 - 1, 0); i < allDmData.length; i++) {
                messagesPage.element.appendChild(createMessage(allDmData[i]));
            }
        });
    });

});

/* when the window has loaded */
window.onload = async function() {

    console.log("Window loaded");

    ipcTools.requestData(ipc, "requestUserData", {id: store.get("dmData").friendId}).then((friendData) => {
        friendData = friendData[0];
        if(friendData) {
            document.title = `Fortex | DM @${friendData.id}`;
            document.getElementById("chat_title").innerHTML = `Chat with @${friendData.displayName}`;
        }
    });

    await messagesPage.reloadPages();

    // 1. see if user pressed enter
    // 2. make sure message meets requirements
    // 3. send event with text to ipc main to handle
    // 4. clear input field
    let messageInput = document.getElementById("message_field");
    messageInput.onkeypress = function(event) {
        if(event.keyCode === 13) {
            let text = messageInput.value.trim();
            if(text.length > 0) {
                ipc.send("sendDirectMessage", text);
                messagesPage.reloadPages();
                messageInput.value = "";
            }
        }
    };

    // get ready to update messages on event
    ipc.on("updateMessages", (event) => {
        console.log("UPDATING MESSAGES");
        messagesPage.reloadPages();
    });
};


console.log("Script login.js loaded");