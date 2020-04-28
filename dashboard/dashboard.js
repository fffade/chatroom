const mysql = require("mysql");
const ElectronStore = require("electron-store");
const encoder = require("../tools/encoder");
const parser = require("../tools/parser");
const sqltools = require("../tools/mysql");
const doctools = require("../tools/doctools");
const ipcTools = require("../tools/ipc.js");
require("../application")();
require("../tools/menus")();
require("../tools/pages")();


const ipc = require('electron').ipcRenderer;
const store = new ElectronStore();


// the right click context menu for servers
const serverMenu = new Menu(document.getElementById("server_menu"));
let applyPortalContextMenu = function(el, data) {
	el.oncontextmenu = function(event) {
		serverMenu.refreshItems();
		// find out if server is favourited by grabbing the link using the user and portal ids
		// change the menu options based on the favourite value before opening the menu
		// let portal_link = portal_links_cache.data.filter(link => link.userId == store.get("userInfo").userId && link.portal_id == data.id)[0];
		// if(portal_link.favourited) {
		// 	server_menu.hideItem("fav");
		// } else {
		// 	server_menu.hideItem("unfav");
		// }
		// server_hover_info.hide();
		// server_menu.openMenu(event.clientX, event.clientY, el);
	};
};

// the hover information for servers
const serverHoverInfo = new HoverInfo(document.getElementById("server_hover_info"), (el) => {
	// grab the portal id from the element id and find the portal in the database to display the name
	// let portal_id = el.id.substring(7);
	// let portal = portals_cache.data.filter(portal => portal.id === portal_id)[0];
	// if(portal) {
	// 	serverHoverInfo.element.innerHTML = portal.name;
	// }
});

// close all menus when user clicks anywhere
document.onclick = function(event) {
	serverMenu.hide();
};

// the profile info page
const profileInfoPage = new Pages("profile_info", document.getElementById("profile_info"), 0, () => {

	ipcTools.requestData(ipc, "requestUserData", {id: store.get("userInfo").userId}).then((dbUsers) => {
		let dbUser = dbUsers[0];
		if(dbUser) {
			document.getElementById("display-name").innerHTML = dbUser.displayName;
			document.getElementById("location").innerHTML = dbUser.location;
			document.getElementById("user-id").innerHTML = dbUser.id;

			let statusContainer = document.getElementById("status-container");
			if(dbUser.status) {
				document.getElementById("status").innerHTML = dbUser.status;
			} else {
				statusContainer.style.display = "none";
			}
		}
	});
});

// the profile info page with extra things
const extraProfileInfoPage = new Pages("extra_profile_info", document.getElementById("extra_profile_info"), 0, async () => {

	ipcTools.requestData(ipc, "requestUserData", {id: store.get("userInfo").userId}).then((dbUsers) => {
		let dbUser = dbUsers[0];
		if(dbUser) {
			if(dbUser.bio) {
				document.getElementById("bio").innerHTML = `Bio: ${dbUser.bio}`;
			} else {
				document.getElementById("bio").innerHTML = `Bio: None`;
			}
			if(dbUser.email) {
				document.getElementById("email-address").innerHTML = `Email: ${dbUser.email}`;
			} else {
				document.getElementById("email-address").innerHTML = `Email: None`;
			}
			if(dbUser.phoneNumber) {
				document.getElementById("phone-number").innerHTML = `Phone: ${dbUser.phoneNumber}`;
			} else {
				document.getElementById("phone-number").innerHTML = `Phone: None`;
			}
		}
	});
});

// the friends page
const friendsPage = new Pages("friends", document.getElementById("friends"), 0, () => {

	ipcTools.requestData(ipc, "requestFriendData", {user1Id: store.get("userInfo").userId}).then((friendLinks1) => {
		ipcTools.requestData(ipc, "requestFriendData", {user2Id: store.get("userInfo").userId}).then((friendLinks2) => {
			let allFriendLinks = friendLinks1.concat(friendLinks2);
			for(let i = 0; i < allFriendLinks.length; i++) {
				// see which one is the friend
				let friendId = (allFriendLinks[i].user1Id === store.get("userInfo").userId) ? allFriendLinks[i].user2Id : allFriendLinks[i].user1Id;
				// get the friend's information from the users
				ipcTools.requestData(ipc, "requestUserData", {id: friendId}).then((friendData) => {
					friendData = friendData[0];
					if(friendData) {
						// add the friend's information to the friend list as a new div
						let friendDiv = document.createElement("div");
						friendDiv.className = "xxs_margin_top xs_margin_left xl_width s_height relative_pos hori_section";
						friendDiv.id = "friend-" + friendData.id;
						let friendPfp = document.createElement("img");
						friendPfp.alt = "PROFILE PICTURE";
						friendPfp.height = 64;
						friendPfp.width = 64;
						friendPfp.src = "../restob1w.png";
						friendPfp.className = "abs_pos centered_vert custom_secondary_border hover_pointer";
						friendPfp.onclick = () => {
							ipc.send("directMessage", friendData.id);
						};
						let friendName = document.createElement("p");
						friendName.className = "abs_pos centered_vert x20 custom_subtitle";
						friendName.innerHTML = friendData.displayName;
						friendDiv.appendChild(friendPfp);
						friendDiv.appendChild(friendName);
						document.getElementById("friends_list").appendChild(friendDiv);
					}
				});
			}

			if(allFriendLinks.length !== 0) {
				document.getElementById("no-friends-msg").style.display = "none";
			} else {
				document.getElementById("no-friends-msg").style.display = "inline";
			}
		});
	});
});

// the favourite portals page
const favPortalsPage = new Pages("fav_portals", document.getElementById("fav_portal_pages"), 3, async () => {

	// tool to load favourite portals through database info
	let createFavouritePortal = function(portal_obj) {
		// create a div with the information
		let portal_div = document.createElement("div");
		portal_div.className = "xs_margin_left xl_width s_height relative_pos hori_section";
		portal_div.id = "portal_" + portal_obj.id;
		let portal_pic = document.createElement("img");
		portal_pic.alt = "PICTURE";
		portal_pic.height = 64;
		portal_pic.width = 64;
		portal_pic.src = portal_obj.picture_url;
		portal_pic.className = "abs_pos centered_vert custom_secondary_border hover_pointer";
		portal_pic.id = "portal_" + portal_obj.id;
		let portal_name = document.createElement("p");
		portal_name.className = "abs_pos centered_vert x20 custom_subtitle";
		portal_name.innerHTML = portal_obj.name;
		portal_div.appendChild(portal_pic);
		portal_div.appendChild(portal_name);
		applyPortalContextMenu(portal_div, portal_obj);
		return portal_div;
	};

	doctools.setStyle("loading_fav_portals_msg", "display", "inline"); // show the loading message
	favPortalsPage.hide();

	await portal_links_cache.reload();
	await portals_cache.reload();
	let fav_portal_links = portal_links_cache.data.filter(link => link.userId == store.get("userInfo").userId && link.favourited == 1);

	// load each page of favourite portals
	let portal_per_page = 3;
	for(let p = 0; p < 3; p++) {
		for(let i = p * portal_per_page; i < Math.min(fav_portal_links.length, (p + 1) * portal_per_page); i++) {
			console.log("Loading favourite portal #" + (i + 1));
			// get the portal data from the database using the id and load it
			let portal_id = fav_portal_links[i].portal_id;
			let portal_data = portals_cache.data.filter(portal => portal.id == portal_id)[0];
			favPortalsPage.addElement(createFavouritePortal(portal_data), p);
		}
	}

	doctools.setStyle("loading_fav_portals_msg", "display", "none"); // hide the loading message
	favPortalsPage.show();

	doctools.setInnerHTML("fav_portals_page_num", "(Page " + (favPortalsPage.active_page + 1) + " of " + favPortalsPage.page_count + ")");

}, () => {
	doctools.setInnerHTML("fav_portals_page_num", "(Page " + (favPortalsPage.active_page + 1) + " of " + favPortalsPage.page_count + ")");
});

// the page for all the portals
const portalsPage = new Pages("portals", document.getElementById("all_portals"), 0, async () => {

	// tool to load all portals through database info
	let loadPortal = function(portal_obj) {
		// add portal image to the div
		let portal_img = document.createElement("img");
		portal_img.id = "portal_" + portal_obj.id;
		portal_img.alt = "PICTURE";
		portal_img.height = "64";
		portal_img.width = "64";
		portal_img.src = portal_obj.picture_url;
		portal_img.className = "xxs_margin_top xxs_margin_left custom_secondary_border hover_pointer";
		applyPortalContextMenu(portal_img, portal_obj);
		serverHoverInfo.activate(portal_img);
		document.getElementById("all_portals_list").appendChild(portal_img);
	};

	doctools.setStyle("loading_all_portals_msg", "display", "inline"); // show the loading messages

	await portal_links_cache.reload();
	let portal_links = portal_links_cache.data.filter(link => link.userId == store.get("userInfo").userId);

	// load every portal
	for(let i = 0; i < portal_links.length; i++) {
		console.log("Loading portal #" + (i + 1));
		// get the portal data from the cache using the id and load it
		let portal_id = portal_links[i].portal_id;
		let portal_data = portals_cache.data.filter(portal => portal.id == portal_id)[0];
		loadPortal(portal_data);
	}

	doctools.setStyle("loading_all_portals_msg", "display", "none"); // hide the loading messages
});

/* when the window has loaded */
window.onload = async function() {

	console.log("Window loaded");

	await profileInfoPage.reloadPages();
	await extraProfileInfoPage.reloadPages();
	await friendsPage.reloadPages();
	await favPortalsPage.reloadPages();
	await portalsPage.reloadPages();

	// show the page buttons
	let favPortalsButtons = document.getElementById("fav_portals_buttons");
	favPortalsButtons.style.display = "block";

	// add functionality to the buttons
	let favPortalsBackBtn = document.getElementById("fav_portals_back");
	let favPortalsNextBtn = document.getElementById("fav_portals_next");
	let favPortalsClearBtn = document.getElementById("fav_portals_clear");
	// when user clicks back fav portal page
	favPortalsBackBtn.onclick = function(event) {
		favPortalsPage.prevPage();
	};
	// when user clicks to next fav portal page
	favPortalsNextBtn.onclick = function() {
		favPortalsPage.nextPage();
	};
	// when user wants to clear the favourite portals
	favPortalsClearBtn.onclick = function() {
		// send popup to confirm action of clearing
		store.set("popupInfo", {title: "Clear", prompt: "Are you sure you want to clear all your favourite portals?",
			buttons: ["Cancel", "Clear"], window: "dashboard"});
		ipc.on("popupCloseReply", (event, message) => {
			// they picked to clear
			if(message === 1) {
				// access database and unfav all the user's portals
				// ms_conn.query(parser.parse("UPDATE `portal_links` SET favourited = 0 WHERE `userId` = \"%s\"", store.get("userInfo").userId), async (p_err, p_results, p_fields) => {
				// 	favPortalsPage.setPage(0);
				// 	if(!p_err) {
				// 		console.log("Favourite portals cleared");
				// 		await favPortalsPage.reloadPages();
				// 	} else {
				// 		store.set("popupInfo", {title: "Error", prompt: "Fortex encountered an error, please try again later",
				// 			buttons: ["OK"], window: "dashboard"});
				// 		ipc.send("openWindow", "popup");
				// 		throw p_err;
				// 	}
				// });
			}
		});
		ipc.send("openWindow", "popup");
	};

	// add features to the context menu of servers
	serverMenu.addItem("fav", "Favourite", function(el) {
		let portal_id = el.id.substring(el.id.length - 6);
		// ms_conn.query(parser.parse("UPDATE `portal_links` SET favourited = 1 WHERE `userId` = \"%s\"", store.get("userInfo").userId) +
		// 	parser.parse(" AND `portal_id` = \"%s\"", portal_id),  async (p_err, p_results, p_fields) => {
		// 	if(!p_err) {
		// 		console.log("FAVOURITED SERVER WITH ID " + portal_id);
		// 		await portal_links_cache.reload();
		// 		await favPortalsPage.reloadPages();
		// 	}
		// });
	});
	serverMenu.addItem("unfav", "Unfavourite", function(el) {
		let portal_id = el.id.substring(el.id.length - 6);
		// ms_conn.query(parser.parse("UPDATE `portal_links` SET favourited = 0 WHERE `userId` = \"%s\"", store.get("userInfo").userId) +
		// 	parser.parse(" AND `portal_id` = \"%s\"", portal_id), async (p_err, p_results, p_fields) => {
		// 	if(!p_err) {
		// 		console.log("UNFAVOURITED SERVER WITH ID " + portal_id);
		// 		await portal_links_cache.reload();
		// 		await favPortalsPage.reloadPages();
		// 	}
		// });
	});
};


console.log("Script login.js loaded");