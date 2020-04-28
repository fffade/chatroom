const ElectronStore = require("electron-store");
const Client = require("./client.js");
const encoder = require("./tools/encoder.js");
const idGen = require("./tools/idgen.js");
require("./application")();
require("./notifications")();


const app = new App();
const notifs = new Notifications();


const store = new ElectronStore();
store.delete("userInfo");
store.set("activeWindow", "login");

const client = new Client("http://fadetech.us.to:5000");
client.onVerify = () => {
	client.connectToSubServer("Fortex");
};
client.onSubServerPacket["UPDATE_MESSAGES"] = () => {
	let openDmWindow = app.getOpenWindow("directMessage");
	if(openDmWindow) {
		openDmWindow.win.webContents.send("updateMessages");
	}
};

/* windows */
const loginWindow = new Window("login", 1280, 720, "login/login.html", {
	minWidth: 1050,
	minHeight: 650
});
const registerWindow = new Window("register", 520, 700, "register/register.html", {
	minWidth: 520,
	minHeight: 720
});
const dashboardWindow = new Window("dashboard", 1400, 800, "dashboard/dashboard.html", {
	minWidth: 1280,
	minHeight: 720
});
const dmWindow = new Window("directMessage", 1400, 800, "direct_message/direct_message.html", {
	minWidth: 1280,
	minHeight: 720
});
const popupWindow = new Window("popup", 400, 280, "popup/popup.html", {
	minWidth: 600,
	minHeight: 400
});

/* add window instances */
app.activationWinName = "login";
app.addWindowInstance(loginWindow);
app.addWindowInstance(registerWindow);
app.addWindowInstance(dashboardWindow);
app.addWindowInstance(popupWindow);
app.addWindowInstance(dmWindow);

/* add some more events */
app.ipc.on("popupClose", (event, replyIndex, window) => {
	console.log("Received popup close event; response: " + replyIndex);
	if(app.getOpenWindow(window)) {
		app.getOpenWindow(window).win.webContents.send("popupCloseReply", replyIndex);
	}
});
app.ipc.on("sentMessage", (event) => {
	client.sendPacket({type: "BROADCAST_UPDATE_MESSAGES"});
});
app.ipc.on("login", (event, username, password) => {
	client.findPersistData("users", {username: username}).then((dbUsers) => {
		let dbUser = dbUsers[0];
		if(dbUser) {
			let passwordsMatch = (password === encoder.decode(dbUser.password, dbUser.encoderShift));
			if(passwordsMatch) {
				store.set("rememberLoginInfo", {username: username, password: password}); // update remember login info
				store.set("userInfo", {username: dbUser.username, userId: dbUser.id}); // set user information
				event.reply("loginReply", {code: 0});
				// after a couple seconds, open the dashboard and close this window
				setTimeout(() => {
					app.openWindow(dashboardWindow);
					app.getOpenWindow("login").win.close();
				}, 1500);
			} else {
				event.reply("loginReply", {code: -2, err: "password is incorrect"});
			}
		} else {
			event.reply("loginReply", {code: -1, err: "user does not exist"});
		}
	}).catch((err) => {
		console.log("ERROR");
		console.log(err);
	});
});
app.ipc.on("register", (event, userData) => {
	console.log("Register event triggered");
	client.findPersistData("users", {username: userData.username}).then((existingDbUsers) => {
		if(existingDbUsers.length > 0) {
			event.reply("registerReply", {code: -1, err: "username taken"});
		} else {
			client.insertPersistData("users", userData);
			event.reply("registerReply", {code: 0});
		}
	});
});
app.ipc.on("directMessage", (event, friendId) => {
	console.log("Direct message event triggered");
	store.set("dmData", {friendId: friendId});
	app.openWindow(dmWindow);
	app.getOpenWindow("dashboard").win.close();
});
app.ipc.on("sendDirectMessage", (event, text) => {
	console.log("Send direct message event triggered");
	let userId = store.get("userInfo").userId;
	let friendId = store.get("dmData").friendId;
	client.insertPersistData("direct_messages",
		{
			id: idGen.genId6(),
			senderId: userId,
			recipientId: friendId,
			text: text,
			timestamp: new Date().toUTCString()
		}
	).catch((response) => {
		if(response.code !== 0) {
			console.log(`Error sending direct message to ${friendId}`);
			console.log(response.err);
		}
	});
});

/* handle data requests from ipc */
app.addDataRequestListener("requestUserData", "users", client);
app.addDataRequestListener("requestFriendData", "friends", client);
app.addDataRequestListener("requestDmData", "direct_messages", client);

/* handle quitting */
app.onQuit = () => {

};