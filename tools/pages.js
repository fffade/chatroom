
module.exports = function() {

    this.Pages = function(prefix, element, page_count, loadPages, onPageChange) {
        this.prefix = prefix;
        this.element = element;
        this.page_count = page_count;
        this.active_page = 0;
        this.loadPages = loadPages;
        this.onPageChange = onPageChange;
        this.hidden = false;
        this.createPages();
    };

    this.Pages.prototype.createPages = function() {
        for(let i = 0; i < this.page_count; i++) {
            let page_div = document.createElement("div");
            page_div.id = this.prefix + "_page" + (i + 1).toString();
            page_div.className = "x0 y0 full_width full_height";
            if(i != this.active_page || this.hidden) {
                page_div.style.display = "none";
            }
            this.element.appendChild(page_div);
        }
    };

    this.Pages.prototype.emptyPages = function() {
        for(let i = 0; i < this.page_count; i++) {
            let page_div = document.getElementById(this.prefix + "_page" + (i + 1).toString());
            page_div.innerHTML = "";
        }
    };

    this.Pages.prototype.reloadPages = async function() {
        this.emptyPages();
        await this.loadPages();
    };

    this.Pages.prototype.setInnerHTML = function(id, text) {
        let el = document.getElementById(id);
        el.innerHTML = text;
    };

    this.Pages.prototype.updateActivePage = function() {
        for(let i = 0; i < this.page_count; i++) {
            let page_div = document.getElementById(this.prefix + "_page" + (i + 1).toString());
            if(i != this.active_page || this.hidden) {
                page_div.style.display = "none";
            } else {
                page_div.style.display = "block";
            }
        }
        if(this.onPageChange) this.onPageChange();
    };

    this.Pages.prototype.nextPage = function() {
        if(this.active_page < this.page_count - 1) {
            this.active_page++;
            this.updateActivePage();
        }
    };

    this.Pages.prototype.prevPage = function() {
        if(this.active_page > 0) {
            this.active_page--;
            this.updateActivePage();
        }
    };

    this.Pages.prototype.setPage = function(page) {
        this.active_page = page;
        this.updateActivePage();
    };

    this.Pages.prototype.hide = function() {
        this.hidden = true;
        this.updateActivePage();
    };

    this.Pages.prototype.show = function() {
        this.hidden = false;
        this.updateActivePage();
    };

    this.Pages.prototype.addElement = function(el, page_index) {
        let page_div = document.getElementById(this.prefix + "_page" + (page_index + 1).toString());
        page_div.appendChild(el);
    };
};