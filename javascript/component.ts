class Component {
  rootEl: HTMLElement;
  app: App;
  parent?: Component;
  children: Array<Component>;

  constructor(parent?: Component) {
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

  addChild(child: Component) {
    this.children.push(child);
    this.rootEl.append(child.rootEl);
  }

  addCSSClass(className: string) {
    this.rootEl.classList.add(className);
  }
}

class AppComponent extends Component {
  constructor(app: App) {
    super();
    this.app = app;
    this.addCSSClass("app");
    document.body.append(this.rootEl);
  }
}
