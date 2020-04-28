
module.exports = function() {

    this.Menu = function(element) {
        this.element = element;
        this.items = {};
        this.open = false;
        this.active_el = null;
    };

    this.Menu.prototype.addItem = function(id, text, onclick) {
        if(!this.items.hasOwnProperty(id)) {
            let button = document.createElement("button");
            button.innerHTML = text;
            button.className = "";
            let that = this;
            button.onclick = function() {
                onclick(that.active_el);
            };
            this.element.appendChild(button);
            this.items[id] = {text: text, button: button};
        }
    };

    this.Menu.prototype.refreshItems = function() {
        if(!this.open) {
            for(let id in this.items) {
                this.items[id].button.style.display = "block";
            }
        }
    };

    this.Menu.prototype.hideItem = function(id) {
        if(!this.open) {
            if(this.items.hasOwnProperty(id)) {
                this.items[id].button.style.display = "none";
            }
        }
    };

    this.Menu.prototype.openMenu = function(x, y, clicked_el) {
        if(!this.open) {
            this.active_el = clicked_el;
            // set a delay so the menu isn't immediately closed
            let that = this;
            setTimeout(function() {
                that.open = true;
                that.element.style.visibility = "visible";
                that.element.style.left = x.toString() + "px";
                that.element.style.top = y.toString() + "px";
            }, 5);
        }
    };

    this.Menu.prototype.hide = function() {
        // hides the menu if it's open
        if(this.open) {
            this.open = false;
            this.element.style.visibility = "hidden";
        }
    };

    this.HoverInfo = function(element, onHover) {
        this.element = element;
        this.open = false;
        this.onHover = onHover;
    };

    this.HoverInfo.prototype.activate = function(el) {
        let that = this;
        el.onmouseover = function() {
            if(!that.open) {
                that.openInfo();
                that.onHover(el);
            }
        };
        el.onmouseout = function() {
            if(that.open)
                that.hide();
        };
    };

    this.HoverInfo.prototype.openInfo = function() {
        let that = this;
        if(!this.open) {
            this.open = true;
            this.element.style.visibility = "visible";
            document.onmousemove = function(event) {
                that.element.style.left = (event.clientX + 1).toString() + "px";
                that.element.style.top = (event.clientY + 1).toString() + "px";
            };
        }
    };

    this.HoverInfo.prototype.hide = function() {
        if(this.open) {
            this.open = false;
            this.element.style.visibility = "hidden";
            this.element.onmousemove = null;
        }
    };
};