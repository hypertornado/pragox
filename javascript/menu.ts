class Menu extends Component {
  constructor(component: Component) {
    super(component);

    this.addCSSClass("app_header_menu");
  }

  add(name: string): MenuItem {
    let ret = new MenuItem(this, name);
    return ret;
  }
}

class MenuItem extends Component {
  //el: HTMLDivElement;
  handlerFn: () => void;

  constructor(menu: Menu, name: string) {
    super(menu);
    this.addCSSClass("app_header_menu_item");

    //this.el = div(menu.rootEl, "app_header_menu_item");
    this.rootEl.innerText = name;
    this.rootEl.addEventListener("click", () => {
      if (this.handlerFn) {
        this.handlerFn();
      }
    });
  }

  setHandler(fn: () => void) {
    this.handlerFn = fn;
  }
}
