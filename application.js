const {BrowserWindow, Notification, remote} = require("electron");


module.exports = function() {

	/*
	 * window class for each window in an electron app
	 */
	this.Window = function(name, width, height, file_path, options) {
		this.id = Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111;
		this.name = name;
		this.storeIndex = null;
		this.width = width;
		this.height = height;
		this.filePath = file_path;
		this.options = options;
		this.remote = remote;
		this.multi = false;
		console.log("Window instance created (WIN" + this.id + ")");
	};

	/* open this window */
	this.Window.prototype.open = function(app) {
		let that = this;
		this.win = new BrowserWindow({
			width: this.width,
			height: this.height,
			webPreferences: {
				nodeIntegration: true
			},
			'minWidth': this.options.minWidth,
			'minHeight': this.options.minHeight
		});
		try {
			this.win.loadFile(this.filePath);
		} catch(err) {
			console.log("Window couldn't load file (WIN" + this.id + ")");
		}
		// when a window is closed, dereference win and remove it from the app
		this.win.on("closed", function() {
			app.openWindows.splice(that.storeIndex, 1);
			that.win = null;
			console.log("Window destroyed (WIN" + that.id + ")");
		});	
		console.log("Window opened (WIN" + this.id + ")");
	};

	/* load a new file with this window */
	this.Window.prototype.loadNewFile = function(filePath) {
		this.filePath = filePath;
		this.win.loadFile(filePath);
	}

	/*
	 * App class for creating applications in electron
	 */
	this.App = function() {
		const {app} = require("electron");
		this.app = app;
		this.openWindows = [];
		this.windowInstances = [];
		this.ipc = require("electron").ipcMain;
		this.loadFileEvents = {};
		this.activationWinName = null;
		let that = this;

		// check for open window events
		this.ipc.on("openWindow", (event, message) => {
			console.log("Open window event triggered for " + message);
			if(that.getWindowInstance(message) && (that.getWindowInstance(message).multi || !that.getOpenWindow(message))) {
				that.openWindow(that.getWindowInstance(message));
			}
		});
		// check for close window events
		this.ipc.on("closeWindow", (event, message) => {
			console.log("Close window event triggered for " + message);
			if(that.getWindowInstance(message) && that.getOpenWindow(message)) {
				that.getOpenWindow(message).win.close();
			}
		});
		// check for load file events
		this.ipc.on("loadFile", (event, message) => {
			console.log("Load file event triggered for " + message);
			if(that.loadFileEvents.hasOwnProperty(message)) {
				that.remote.getCurrentWindow().loadFile(that.loadFileEvents[message]);
			}
		});
		// check for all windows closing
		this.app.on('window-all-closed', () => {
			// on mac, the apps usually keep running 
			if(process.platform !== 'darwin') {
				that.app.quit();
				console.log("Application quit because all windows closed!");
			} else {
				console.log("Application is running in background for MacOS");
			}
		});
		// activate event runs when app is double clicked
		this.app.on("activate", () => {
			// on mac you can usually create a window if there are no windows and the app is clicked
			if(that.openWindows.length === 0) {
				that.openWindow(that.getWindowInstance(that.activationWinName));
			}
			console.log("Application was activated!");
		});
		// when the app is ready to be launched
		this.app.on("ready", () => {
			that.openWindow(that.getWindowInstance(that.activationWinName));
			console.log("Application is ready!");
		});
		// when the app quits
		this.app.on("quit", () => {
			if(that.onQuit) {
				that.onQuit();
			}
		});
	};

	/* open a window */
	this.App.prototype.openWindow = function(win) {
		win.storeIndex = this.openWindows.length; // get the index of the window and store it
		console.log("Window (WIN" + win.id + ") store index set to " + win.storeIndex);
		this.openWindows.push(win); // add to list of windows
		win.open(this); // open the window
	};

	/* add a window instance */
	this.App.prototype.addWindowInstance = function(win) {
		this.windowInstances.push(win);
	};

	/* on load file */
	this.App.prototype.setLoadFileEvent = function(name, file_path) {
		this.loadFileEvents[name] = file_path;
	};

	/* get a window instance */
	this.App.prototype.getWindowInstance = function(name) {
		for(let i = 0; i < this.windowInstances.length; i++) {
			if(this.windowInstances[i].name === name)
				return this.windowInstances[i];
		}
		return null;
	};

	/* get an open window */
	this.App.prototype.getOpenWindow = function(name) {
		for(let i = 0; i < this.openWindows.length; i++) {
			if(this.openWindows[i].name === name)
				return this.openWindows[i];
		}
		return null;
	};

	/* set ipc up to handle data requests */
	this.App.prototype.addDataRequestListener = function(name, database, client) {
		this.ipc.on(name, (event, criteria) => {
			client.findPersistData(database, criteria).then((foundData) => {
				event.reply(`${name}Reply`, {code: 0, data: foundData});
			}).catch((err) => {
				event.reply(`${name}Reply`, err);
			});
		});
	};
};
