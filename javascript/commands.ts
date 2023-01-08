class Commands extends Component {
  constructor(parent: Component) {
    super(parent);
    this.addCSSClass("app_header_commands");
  }

  add(icon: string): Command {
    let ret = new Command(this, icon);
    return ret;
  }
}

class Command extends Component {
  //el: HTMLDivElement;
  handler: () => void;
  commands: Commands;

  constructor(commands: Commands, icon: string) {
    super(commands);

    this.commands = commands;
    this.addCSSClass("app_header_command");
    //this.el = div(commands.rootEl, "app_header_command");
    this.rootEl.innerText = icon;
  }

  setHandler(fn: () => void) {
    this.handler = fn;
    this.rootEl.addEventListener("click", () => {
      fn();
    });
  }

  setName(name: string): Command {
    this.rootEl.setAttribute("title", name);
    return this;
  }

  shortcut(codes: string): Command {
    let shortcut = new Shortcut(codes, () => {
      this.handler();
    });
    this.commands.app.registerShortcut(shortcut);
    return this;
  }
}
