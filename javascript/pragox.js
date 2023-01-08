class Component {
    constructor(parent) {
        this.children = [];
        if (!this.rootEl) {
            this.rootEl = document.createElement("div");
        }
        if (parent) {
            this.app = parent.app;
            this.parent = parent;
            this.parent.addChild(this);
        }
    }
    addChild(child) {
        this.children.push(child);
        this.rootEl.append(child.rootEl);
    }
    addCSSClass(className) {
        this.rootEl.classList.add(className);
    }
}
class AppComponent extends Component {
    constructor(app) {
        super();
        this.app = app;
        this.addCSSClass("app");
        document.body.append(this.rootEl);
    }
}
class Commands extends Component {
    constructor(parent) {
        super(parent);
        this.addCSSClass("app_header_commands");
    }
    add(icon) {
        let ret = new Command(this, icon);
        return ret;
    }
}
class Command extends Component {
    constructor(commands, icon) {
        super(commands);
        this.commands = commands;
        this.addCSSClass("app_header_command");
        this.rootEl.innerText = icon;
    }
    setHandler(fn) {
        this.handler = fn;
        this.rootEl.addEventListener("click", () => {
            fn();
        });
    }
    setName(name) {
        this.rootEl.setAttribute("title", name);
        return this;
    }
    shortcut(codes) {
        let shortcut = new Shortcut(codes, () => {
            this.handler();
        });
        this.commands.app.registerShortcut(shortcut);
        return this;
    }
}
class Menu extends Component {
    constructor(component) {
        super(component);
        this.addCSSClass("app_header_menu");
    }
    add(name) {
        let ret = new MenuItem(this, name);
        return ret;
    }
}
class MenuItem extends Component {
    constructor(menu, name) {
        super(menu);
        this.addCSSClass("app_header_menu_item");
        this.rootEl.innerText = name;
        this.rootEl.addEventListener("click", () => {
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
        this.shortcuts = Array();
        this.appData = JSON.parse(document.body.getAttribute("data-app"));
        this.createAppSkeleton();
        this.setFavicon();
        this.listenShortcuts();
        this.menuItem(this.appData.Icon + " " + this.appData.Name).setHandler(() => {
            window.location = "/";
        });
    }
    getURLParam(key) {
        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        return urlParams.get(key);
    }
    setFavicon() {
        let icon = this.appData.Icon;
        let link = document.createElement("link");
        link.setAttribute("rel", "icon");
        let svgData = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`;
        link.setAttribute("href", svgData);
        document.querySelector("head").append(link);
    }
    listenShortcuts() {
        document.addEventListener("keyup", (e) => {
            this.shortcuts.forEach((val) => {
                if (val.matches(e)) {
                    val.handler();
                }
            });
            console.log(e);
        });
    }
    registerShortcut(shortcut) {
        this.shortcuts.push(shortcut);
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
        document.title = this.appData.Name;
        this.appComponent = new AppComponent(this);
        this.header = new Component(this.appComponent);
        this.header.addCSSClass("app_header");
        this.menu = new Menu(this.header);
        this.commands = new Commands(this.header);
        this.appContentComponent = new Component(this.appComponent);
        this.appContentComponent.addCSSClass("app_content");
    }
    contentHeight() {
        return window.innerHeight - this.header.rootEl.offsetHeight;
    }
    listenResize(resizeHandler) {
        window.addEventListener("resize", resizeHandler);
    }
    fitContent(el) {
        let fn = function () {
            let width = document.body.offsetWidth;
            let height = this.contentHeight();
            el.setAttribute("width", width + "");
            el.setAttribute("height", height + "");
            el.setAttribute("style", "width:" + width + "px; height: " + height + "px;");
        };
        fn.bind(this)();
        this.listenResize(fn.bind(this));
    }
    api(procedure, requestData, handler, errorhandler) {
        let request = new XMLHttpRequest();
        request.open("POST", "/api/" + procedure, true);
        request.addEventListener("load", () => {
            if (request.status != 200) {
                let errText = `Error while calling API ${procedure}.`;
                if (errorhandler) {
                    errorhandler(errText);
                }
                else {
                    console.error(errText);
                }
                return;
            }
            let responseData = JSON.parse(request.response);
            handler(responseData);
        });
        request.send(JSON.stringify(requestData));
    }
    apiDownload(path, handler) {
        let request = new XMLHttpRequest();
        request.open("GET", "/api/download?path=" + encodeURI(path), true);
        request.addEventListener("load", () => {
            if (request.status != 200) {
                handler(null);
                return;
            }
            handler(request.response);
        });
        request.send();
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
class List extends Component {
    constructor(parent, path, loadedHandler) {
        super(parent);
        this.selectedItem = -1;
        this.loadedHandler = loadedHandler;
        this.loadData(path);
    }
    loadData(path) {
        this.app.api("list", { Path: path }, (data) => {
            this.setData(data);
            if (this.loadedHandler) {
                this.loadedHandler();
            }
        });
    }
    selectUp() {
        if (this.selectedItem >= 0) {
            this.selectedItem -= 1;
            if (this.selectedItem < 0) {
                this.selectedItem = 0;
            }
        }
        else {
            this.selectedItem = this.selectedMaxCount() - 1;
        }
        this.renderSelection();
    }
    selectDown() {
        if (this.selectedItem < 0) {
            this.selectedItem = 0;
        }
        else {
            this.selectedItem += 1;
            if (this.selectedItem >= this.selectedMaxCount()) {
                this.selectedItem = this.selectedMaxCount() - 1;
            }
        }
        this.renderSelection();
    }
    enterSelected() {
        if (this.selectedItem >= 0) {
            this.openFile(this.selectedItem);
        }
    }
    renderSelection() {
        this.renderSelectionRemove();
        let selected = this.rootEl.querySelectorAll(".list_item");
        if (this.selectedItem >= 0) {
            selected[this.selectedItem].classList.add("list_item-selected");
        }
    }
    renderSelectionRemove() {
        let selected = this.rootEl.querySelectorAll(".list_item-selected");
        for (var i = 0; i < selected.length; i++) {
            selected[i].classList.remove("list_item-selected");
        }
    }
    selectedMaxCount() {
        return this.filesData.Files.length;
    }
    setData(data) {
        this.selectedItem = -1;
        this.filesData = data;
        this.rootEl.innerHTML = "";
        for (var i = 0; i < data.Files.length; i++) {
            let file = data.Files[i];
            let row = div(this.rootEl, "list_item");
            row.setAttribute("data-index", i + "");
            if (file.IsDir) {
                row.classList.add("list_item-directory");
            }
            row.addEventListener("click", this.clickFile.bind(this));
            row.addEventListener("dblclick", this.enterSelected.bind(this));
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
        this.selectedItem = parseInt(index);
        this.renderSelection();
    }
    openFile(index) {
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
        this.homeComponent = new HomeComponent(this.appContentComponent);
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
            let iconEl = div(el, "home_item_icon");
            iconEl.innerText = app.Icon;
            let nameEl = div(el, "home_item_name");
            nameEl.innerText = app.Name;
            this.homeComponent.rootEl.append(el);
        }
    }
}
class HomeComponent extends Component {
    constructor(parent) {
        super(parent);
        this.addCSSClass("home");
    }
}
class Files extends App {
    constructor() {
        super();
        let path = this.getURLParam("path");
        if (!path) {
            path = this.homePath();
        }
        this.list = new List(this.appContentComponent, path, this.changedListPath.bind(this));
        this.command("↑", () => {
            this.list.levelUp();
        })
            .setName("Level up")
            .shortcut("alt+#38");
        this.command("🏠", () => {
            this.list.loadData(this.homePath());
        })
            .setName("Home")
            .shortcut("alt+h");
        this.command("up", () => {
            this.list.selectUp();
        })
            .setName("Up")
            .shortcut("#38");
        this.command("down", () => {
            this.list.selectDown();
        })
            .setName("Down")
            .shortcut("#40");
        this.command("enter", () => {
            this.list.enterSelected();
        })
            .setName("Open")
            .shortcut("#13");
    }
    homePath() {
        return document.body.getAttribute("data-home");
    }
    changedListPath() {
        document.title = this.list.filesData.CurrentDirInfo.Name;
        history.pushState({}, null, "/files?path=" + encodeURI(this.list.filesData.CurrentPath));
    }
}
class Preview extends App {
    constructor() {
        super();
        this.previewComponent = new PreviewComponent(this.appContentComponent);
        let path = this.getURLParam("path");
        this.api("fileinfo", { Path: path }, (data) => {
            let mimeType = data.MimeType;
            if (mimeType.startsWith("image/")) {
                new PreviewImage(this, path);
                return;
            }
            if (mimeType.startsWith("audio/")) {
                new PreviewAudio(this, path);
                return;
            }
            if (mimeType.startsWith("video/")) {
                new PreviewVideo(this, path);
                return;
            }
            if (mimeType.startsWith("application/pdf")) {
                new PreviewIframe(this, path);
                return;
            }
            this.apiDownload(path, (data) => {
                new PreviewText(this, data);
            });
        });
    }
    attach(el) {
        this.previewComponent.rootEl.innerText = "";
        this.previewComponent.rootEl.append(el);
    }
}
class PreviewComponent extends Component {
    constructor(component) {
        super(component);
        this.addCSSClass("preview");
    }
}
class PreviewText {
    constructor(preview, data) {
        this.preview = preview;
        this.rootEl = document.createElement("div");
        this.rootEl.classList.add("preview_text");
        this.rootEl.innerText = data;
        preview.attach(this.rootEl);
    }
}
class PreviewImage {
    constructor(preview, data) {
        this.preview = preview;
        this.imageContainer = document.createElement("div");
        this.imageContainer.classList.add("preview_img");
        this.imageEl = document.createElement("img");
        this.imageEl.setAttribute("src", "/api/download?path=" + encodeURI(data));
        this.imageEl.addEventListener("click", () => {
            this.imageEl.classList.toggle("full_size");
        });
        this.imageContainer.append(this.imageEl);
        preview.fitContent(this.imageContainer);
        preview.attach(this.imageContainer);
    }
}
class PreviewAudio {
    constructor(preview, path) {
        this.audioEl = document.createElement("audio");
        this.audioEl.setAttribute("controls", "");
        this.audioEl.setAttribute("autoplay", "true");
        this.audioEl.setAttribute("src", "/api/download?path=" + encodeURI(path));
        this.audioEl.setAttribute("width", preview.previewComponent.rootEl.offsetWidth + "");
        this.audioEl.setAttribute("height", preview.contentHeight() + "");
        this.audioEl.setAttribute("style", "width: calc(100vw - 20px); margin-top: 40vh; margin-left: 10px;");
        preview.attach(this.audioEl);
    }
}
class PreviewVideo {
    constructor(preview, path) {
        this.videoEl = document.createElement("video");
        this.videoEl.setAttribute("controls", "");
        this.videoEl.setAttribute("autoplay", "true");
        this.videoEl.setAttribute("src", "/api/download?path=" + encodeURI(path));
        preview.fitContent(this.videoEl);
        preview.attach(this.videoEl);
    }
}
class PreviewIframe {
    constructor(preview, path) {
        this.iframeEl = document.createElement("iframe");
        this.iframeEl.setAttribute("src", "/api/download?path=" + encodeURI(path));
        preview.fitContent(this.iframeEl);
        preview.attach(this.iframeEl);
    }
}
class Shortcut {
    constructor(str, handler) {
        this.ctrl = false;
        this.alt = false;
        this.shift = false;
        this.handler = handler;
        this.whichCode = -1;
        let parts = str.split("+");
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            part = part.toLowerCase();
            if (part.length == 1) {
                if (this.whichCode != -1) {
                    console.error("which code already set");
                    return;
                }
                this.whichCode = part.charCodeAt(0) - 32;
            }
            else {
                switch (part) {
                    case "ctrl":
                        this.ctrl = true;
                        break;
                    case "alt":
                        this.alt = true;
                        break;
                    case "shift":
                        this.shift = true;
                        break;
                    default:
                        if (part.length >= 2 && part.startsWith("#")) {
                            if (this.whichCode != -1) {
                                console.error("which code already set");
                                return;
                            }
                            part = part.replace("#", "");
                            let codeInt = parseInt(part);
                            if (codeInt < 0) {
                                console.error("unknown shortcut " + part);
                                return;
                            }
                            this.whichCode = codeInt;
                        }
                        else {
                            console.error("unknown shortcut " + part);
                        }
                }
            }
        }
    }
    matches(e) {
        if (e.which != this.whichCode) {
            return false;
        }
        if (this.shift != e.shiftKey) {
            return false;
        }
        if (this.alt != e.altKey) {
            return false;
        }
        if (this.ctrl) {
            if (!e.metaKey && !e.ctrlKey) {
                return false;
            }
        }
        return true;
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
