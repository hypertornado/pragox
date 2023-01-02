class Commands {
    constructor(app) {
        this.app = app;
        this.appCommandsEl = div(this.app.appHeaderEl, "app_header_commands");
    }
    add(icon) {
        let ret = new Command(this, icon);
        return ret;
    }
}
class Command {
    constructor(commands, icon) {
        this.el = div(commands.appCommandsEl, "app_header_command");
        this.el.innerText = icon;
    }
    setHandler(fn) {
        this.el.addEventListener("click", () => {
            fn();
        });
    }
    setName(name) {
        this.el.setAttribute("title", name);
    }
}
class Menu {
    constructor(app) {
        this.app = app;
        this.appMenuEl = div(this.app.appHeaderEl, "app_header_menu");
    }
    add(name) {
        let ret = new MenuItem(this, name);
        return ret;
    }
}
class MenuItem {
    constructor(menu, name) {
        this.el = div(menu.appMenuEl, "app_header_menu_item");
        this.el.innerText = name;
        this.el.addEventListener("click", () => {
            if (this.handlerFn) {
                this.handlerFn();
            }
        });
    }
    setHandler(fn) {
        this.handlerFn = fn;
    }
}
class App {
    constructor() {
        this.appName = document.body.getAttribute("data-app-name");
        this.createAppSkeleton();
        this.menuItem("🌍").setHandler(() => {
            window.location = "/";
        });
        this.menuItem(this.appName).setHandler(() => { });
    }
    menuItem(name) {
        return this.menu.add(name);
    }
    command(icon, handler) {
        let ret = this.commands.add(icon);
        ret.setHandler(handler);
        return ret;
    }
    createAppSkeleton() {
        document.title = this.appName;
        this.appEl = div(document.body, "app");
        this.appHeaderEl = div(this.appEl, "app_header");
        this.menu = new Menu(this);
        this.commands = new Commands(this);
        this.appContentEl = div(this.appEl, "app_content");
    }
}
function div(parentEl, className) {
    let ret = document.createElement("div");
    if (className) {
        ret.classList.add(className);
    }
    parentEl.append(ret);
    return ret;
}
class List {
    constructor(el) {
        this.el = el;
        this.loadHome();
    }
    loadHome() {
        this.loadData(document.body.getAttribute("data-home"));
    }
    loadData(path) {
        let request = new XMLHttpRequest();
        request.open("POST", "/api/list", true);
        request.addEventListener("load", () => {
            if (request.status != 200) {
                console.error("Error while saving order.");
                return;
            }
            var data = JSON.parse(request.response);
            this.setData(data);
        });
        request.send(JSON.stringify({ Path: path }));
    }
    setData(data) {
        this.filesData = data;
        this.el.innerHTML = "";
        for (var i = 0; i < data.Files.length; i++) {
            let file = data.Files[i];
            let row = div(this.el, "list_item");
            row.setAttribute("data-index", i + "");
            if (file.IsDir) {
                row.classList.add("list_item-directory");
            }
            row.addEventListener("click", this.clickFile.bind(this));
            let iconEl = div(row, "list_item_icon");
            iconEl.innerText = file.Icon;
            let nameEl = div(row, "list_item_name");
            nameEl.innerText = file.Name;
            let dateEl = div(row, "list_item_date");
            dateEl.innerText = file.ChangeDataHuman;
            let sizeEl = div(row, "list_item_size");
            sizeEl.innerText = file.SizeHuman;
            let kindEl = div(row, "list_item_kind");
            kindEl.innerText = file.KindHuman;
        }
    }
    clickFile(e) {
        let target = e.currentTarget;
        let index = target.getAttribute("data-index");
        let file = this.filesData.Files[index];
        if (file.IsDir) {
            this.loadData(file.Path);
        }
        else {
            window.open("/preview?path=" + file.Path, "_blank");
        }
    }
    levelUp() {
        if (this.filesData && this.filesData.ParentPath) {
            this.loadData(this.filesData.ParentPath);
        }
    }
}
class Home extends App {
    constructor() {
        super();
        this.homeEl = document.createElement("div");
        this.appContentEl.append(this.homeEl);
        this.homeEl.classList.add("home");
        this.loadApps();
    }
    loadApps() {
        let request = new XMLHttpRequest();
        request.open("POST", "/api/apps", true);
        request.addEventListener("load", () => {
            if (request.status != 200) {
                console.error("Error while saving order.");
                return;
            }
            var data = JSON.parse(request.response);
            this.renderApps(data.Apps);
        });
        request.send(JSON.stringify({}));
    }
    renderApps(appsData) {
        for (var i = 0; i < appsData.length; i++) {
            let app = appsData[i];
            let el = document.createElement("a");
            el.classList.add("home_item");
            el.setAttribute("href", app.URL);
            el.innerText = app.Name;
            this.homeEl.append(el);
        }
    }
}
class Files extends App {
    constructor() {
        super();
        var listEl = document.createElement("div");
        listEl.classList.add("list");
        this.appContentEl.append(listEl);
        this.list = new List(listEl);
        this.command("↑", () => {
            this.list.levelUp();
        }).setName("O úroveň výš");
        this.command("🏠", () => {
            this.list.loadHome();
        }).setName("Domů");
    }
}
class Preview extends App {
    constructor() {
        super();
        this.previewEl = document.createElement("div");
        this.previewEl.classList.add("preview");
        this.appContentEl.append(this.previewEl);
        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let path = urlParams.get("path");
        this.previewData(path);
    }
    previewData(path) {
        let request = new XMLHttpRequest();
        request.open("POST", "/api/download", true);
        request.addEventListener("load", () => {
            if (request.status != 200) {
                console.error("Error while downloading item.");
                return;
            }
            var data = JSON.parse(request.response);
            this.previewEl.innerText = data.Data;
            console.log(data);
        });
        request.send(JSON.stringify({ Path: path }));
    }
}
class Pragox {
    static start() {
        document.addEventListener("DOMContentLoaded", Pragox.init);
    }
    static init() {
        let appID = document.body.getAttribute("data-app-id");
        if (appID == "home") {
            new Home();
            return;
        }
        if (appID == "files") {
            new Files();
            return;
        }
        if (appID == "preview") {
            new Preview();
            return;
        }
        console.error("Unknown app " + appID);
    }
}
Pragox.start();
