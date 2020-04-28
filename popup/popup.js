const ElectronStore = require("electron-store");
require("../application")();


const ipc = require('electron').ipcRenderer;
const store = new ElectronStore();


/* when the window has loaded */
window.onload = function() {

    console.log("Window loaded");

    // get information on what to show in the popup
    let popupInfo = store.get("popupInfo");
    document.getElementById("title").innerHTML = popupInfo.title;
    document.getElementById("prompt").innerHTML = popupInfo.prompt;
    for(let i = 0; i < popupInfo.buttons.length; i++) {
        let button = document.createElement("button");
        button.className = "xs_width xl_height m_margin_left xxxs_margin_right no_outline m_rounded custom_subtitle custom_button custom_secondary_border";
        button.innerHTML = popupInfo.buttons[i];
        button.onclick = ((z) => {
            ipc.send("popupClose", z, popupInfo.window);
            ipc.send("closeWindow", "popup");
        }).bind(null, i);
        document.getElementById("buttons_list").appendChild(button);
    }
};


console.log("Script popup.js loaded");