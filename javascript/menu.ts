class Menu {
  app: App;
  appMenuEl: HTMLDivElement;

  constructor(app: App) {
    this.app = app;
    this.appMenuEl = div(this.app.appHeaderEl, "app_header_menu");
  }

  add(name: string): MenuItem {
    let ret = new MenuItem(this, name);
    return ret;
  }
}

class MenuItem {
  el: HTMLDivElement;
  handlerFn: () => void;

  constructor(menu: Menu, name: string) {
    this.el = div(menu.appMenuEl, "app_header_menu_item");
    this.el.innerText = name;
    this.el.addEventListener("click", () => {
      if (this.handlerFn) {
        this.handlerFn();
      }
    });
  }

  setHandler(fn: () => void) {
    this.handlerFn = fn;
  }
}
