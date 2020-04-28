const mysql = require("mysql");
const ElectronStore = require("electron-store");
const encoder = require("../tools/encoder");
require("../application")();


const ipc = require('electron').ipcRenderer;
const store = new ElectronStore();


/* when the window has loaded */
window.onload = function() {

	console.log("Window loaded");

	// get username field and password field
	let usernameField = document.getElementById("usernameField");
	let passwordField = document.getElementById("passwordField");

	let messageEl = document.getElementById("message");

	// try to get remembered info
	let rLoginInfo = store.get("rememberLoginInfo");
	if(rLoginInfo) {
		usernameField.value = rLoginInfo.username;
		passwordField.value = rLoginInfo.password;
	}

	// function to clear fields
	let clearFields = function() {
		usernameField.value = "";
		passwordField.value = "";
	};

	// add functionality to login button
	let loginButton = document.getElementById("login_btn");
	loginButton.onclick = function() {
		ipc.on("loginReply", (event, reply) => {
			if(reply.code === 0) {
				messageEl.innerHTML = "Logging you in...";
			} else {
				messageEl.innerHTML = `Failed to log you in: ${reply.err} (${reply.code})`;
			}
		});
		ipc.send("login", usernameField.value.trim(), passwordField.value);
	};

	// add functionality to register button
	let regButton = document.getElementById("register_btn");
	regButton.onclick = function() {
		store.set("tmpRegisterInfo", {username: usernameField.value.trim(), password: passwordField.value}); // store the existing info
		ipc.send("openWindow", "register"); // open a popup register window
	};
};


console.log("Script login.js loaded");