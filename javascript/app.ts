class App {
  appData: any;

  //appHeaderEl: HTMLDivElement;

  header: Component;

  appMenuEl: HTMLDivElement;

  //appContentEl: HTMLDivElement;

  shortcuts: Array<Shortcut>;

  menu: Menu;
  commands: Commands;

  appComponent: AppComponent;

  appContentComponent: AppComponent;

  constructor() {
    this.shortcuts = Array<Shortcut>();

    this.appData = JSON.parse(document.body.getAttribute("data-app"));

    this.createAppSkeleton();
    this.setFavicon();
    this.listenShortcuts();

    this.menuItem(this.appData.Icon + " " + this.appData.Name).setHandler(
      () => {
        //@ts-ignore
        window.location = "/";
      }
    );
  }

  getURLParam(key: string): string {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    return urlParams.get(key);
  }

  private setFavicon() {
    let icon = this.appData.Icon;

    let link = document.createElement("link");
    link.setAttribute("rel", "icon");
    let svgData = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${icon}</text></svg>`;
    link.setAttribute("href", svgData);

    document.querySelector("head").append(link);
  }

  private listenShortcuts() {
    document.addEventListener("keyup", (e) => {
      this.shortcuts.forEach((val) => {
        if (val.matches(e)) {
          val.handler();
        }
      });
      console.log(e);
    });
  }

  registerShortcut(shortcut: Shortcut) {
    this.shortcuts.push(shortcut);
  }

  menuItem(name: string): MenuItem {
    return this.menu.add(name);
  }

  command(icon: string, handler: () => void): Command {
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

    //this.appContentEl = div(this.appComponent.rootEl, "app_content");
  }

  contentHeight(): number {
    return window.innerHeight - this.header.rootEl.offsetHeight;
  }

  listenResize(resizeHandler: () => void) {
    window.addEventListener("resize", resizeHandler);
  }

  fitContent(el: HTMLElement) {
    let fn = function () {
      let width = document.body.offsetWidth;
      let height = this.contentHeight();
      el.setAttribute("width", width + "");
      el.setAttribute("height", height + "");

      el.setAttribute(
        "style",
        "width:" + width + "px; height: " + height + "px;"
      );
    };
    fn.bind(this)();
    this.listenResize(fn.bind(this));
  }

  api(
    procedure: string,
    requestData: Object,
    handler: (responseData: Object) => void,
    errorhandler?: (error: string) => void
  ) {
    let request = new XMLHttpRequest();
    request.open("POST", "/api/" + procedure, true);
    request.addEventListener("load", () => {
      if (request.status != 200) {
        let errText = `Error while calling API ${procedure}.`;
        if (errorhandler) {
          errorhandler(errText);
        } else {
          console.error(errText);
        }
        return;
      }
      let responseData = JSON.parse(request.response);
      handler(responseData);
    });
    request.send(JSON.stringify(requestData));
  }

  apiDownload(path: string, handler: (o: Object) => void) {
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

function div(parentEl: HTMLElement, className?: string): HTMLDivElement {
  let ret = document.createElement("div");
  if (className) {
    ret.classList.add(className);
  }
  parentEl.append(ret);
  return ret;
}
