class Commands {
  app: App;

  appCommandsEl: HTMLDivElement;

  constructor(app: App) {
    this.app = app;
    this.appCommandsEl = div(this.app.appHeaderEl, "app_header_commands");
  }

  add(icon: string): Command {
    let ret = new Command(this, icon);
    return ret;
  }
}

class Command {
  el: HTMLDivElement;

  constructor(commands: Commands, icon: string) {
    this.el = div(commands.appCommandsEl, "app_header_command");
    this.el.innerText = icon;
  }

  setHandler(fn: () => void) {
    this.el.addEventListener("click", () => {
      fn();
    });
  }

  setName(name: string) {
    this.el.setAttribute("title", name);
  }
}
