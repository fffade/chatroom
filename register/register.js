const mysql = require("mysql");
const ElectronStore = require("electron-store");
const encoder = require("../tools/encoder");
require("../application")();
const idGen = require("../tools/idgen");

const ipc = require('electron').ipcRenderer;
const store = new ElectronStore();


/* when the window has loaded */
window.onload = function() {

	console.log("Window loaded");

	// get all fields
	let usernameField = document.getElementById("usernameField");
	let passwordField = document.getElementById("passwordField");
	let cPasswordField = document.getElementById("c_passwordField");
	let emailField = document.getElementById("email_field");
	let phoneNumberField = document.getElementById("p_number_field");
	let locField = document.getElementById("location");

	let messageEl = document.getElementById("message");

	// try to get temporary register info from before
	let tmpRegInfo = store.get("tmpRegisterInfo");
	if(tmpRegInfo) {
		usernameField.value = tmpRegInfo.username;
		passwordField.value = tmpRegInfo.password;
	}

	// function to clear fields that are necessary to clear
    function clearFields() {
		passwordField.value = "";
		cPasswordField.value = "";
	}

	// add functionality to create account button
	let createAccBtn = document.getElementById("create_acc_btn");
	createAccBtn.onclick = function() {
		usernameField.value = usernameField.value.trim().toLowerCase();
		// make sure username qualifies
		if(usernameField.value.length < 4 || usernameField.value.length > 16) {
			messageEl.innerHTML = "Username must be 4-16 characters long";
			clearFields();
			return;
		}
		// make sure password qualifies
		if(passwordField.value.includes(" ")) {
			messageEl.innerHTML = "Password may not contain whitespace";
			clearFields();
			return;
		} else if(passwordField.value.length < 6 || passwordField.value.length > 16) {
			messageEl.innerHTML = "Password must be 6-16 characters long";
			clearFields();
			return;
		}
		// make sure confirm password matches
		if(passwordField.value !== cPasswordField.value) {
			messageEl.innerHTML = "Passwords do not match";
			clearFields();
			return;
		}
		// see if email looks invalid
		if(emailField.value.trim().length > 0 && (!emailField.value.includes("@") || !emailField.value.includes("."))) {
			messageEl.innerHTML = "Email address appears invalid";
			return;
		}

		ipc.once("registerReply", (event, reply) => {
			console.log("Received register reply");
			if(reply.code === 0) {
				messageEl.innerHTML = "Successfully registered!";
			} else {
				messageEl.innerHTML = `Error registering - ${reply.err} (${reply.code})`;
			}
		});
		let encoderShift = encoder.randEncodeShift();
		ipc.send("register", {
			id: idGen.genId6(),
			username: usernameField.value,
			displayName: usernameField.value,
			password: encoder.encode(passwordField.value, encoderShift),
			encoderShift: encoderShift,
			email: (emailField.value.trim().length === 0) ? null : emailField.value.trim(),
		    phoneNumber: (phoneNumberField.value.trim().length === 0) ? null : phoneNumberField.value.trim(),
			location: locField.value,
			bio: null,
			status: null});
		console.log("Registration form sent");
	};
};


console.log("Script login.js loaded");