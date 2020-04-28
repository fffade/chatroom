const {Notification} = require("electron");


module.exports = function() {

	/* create a notifications sys */
	this.Notifications = function() {
		
	}

	/* send a notification */
	this.Notifications.prototype.show = function(sig) {

		let noti = new Notification(sig.options);

		// emitted when the noti is clicked
		noti.on("click", (event) => {
		  	console.log("Notification (SIG" + sig.id + ") was clicked");
		  	noti.close();
		  	if(sig.onClick) sig.onClick();
		});

		// emitted when the user replies to a notification
		noti.on("reply", (event, reply) => {
			console.log("Notification (SIG" + sig.id + ") was replied to with: " + reply);
			noti.close();
			if(sig.onReply) sig.onReply(reply);
		});

		// emitted when a noti is closed
		noti.on("close", (event) => {
			console.log("Notification (SIG" + sig.id + ") closed");
			if(sig.onClose) sig.onClose(close);
		});

		// emitted when an action is used
		noti.on("action", (event, index) => {
			console.log("Notification (SIG" + sig.id + ") was acted on with button index of " + index);
			if(sig.onAction) sig.onAction(index);
		});

		noti.show(); // show the notification
	};

	/* returns a built default signaler */
	this.Notifications.prototype.buildSignaler = function(title, subtitle, body, icon) {
		// create a signaler object
		let sig = new Signaler({
			title: title,
			subtitle: subtitle,
		  	body: body,
		  	icon: icon,
		  	closeButtonText: ""
		});

		return sig;
	};


	/* a notification prep */
	this.Signaler = function(options) {
		this.options = options;
		this.id = Math.floor(Math.random() * (9999 - 1111 + 1)) + 1111;
	};

	/* add reply functionality to it */
	this.Signaler.prototype.enableReply = function(reply_placeholder, close_button_text) {
		this.options.hasReply = true;
		this.options.replyPlaceholder = reply_placeholder;
		if(close_button_text) this.options.closeButtonText = close_button_text; 
	};

	/* make it silent */
	this.Signaler.prototype.enableSilent = function() {
		this.options.silent = true;
	};

	/* add an action */
	this.Signaler.prototype.addAction = function(name) {
		if(!this.options.actions)
			this.options.actions = [];
		this.options.actions.push({type: "button", text: name});
	};
};