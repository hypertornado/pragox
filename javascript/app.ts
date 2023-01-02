class App {
  appName: string;

  appEl: HTMLDivElement;

  appHeaderEl: HTMLDivElement;
  appMenuEl: HTMLDivElement;

  appContentEl: HTMLDivElement;

  menu: Menu;
  commands: Commands;

  constructor() {
    this.appName = document.body.getAttribute("data-app-name");
    this.createAppSkeleton();

    this.menuItem("🌍").setHandler(() => {
      //@ts-ignore
      window.location = "/";
    });
    this.menuItem(this.appName).setHandler(() => {});
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
    document.title = this.appName;

    this.appEl = div(document.body, "app");

    this.appHeaderEl = div(this.appEl, "app_header");
    this.menu = new Menu(this);
    this.commands = new Commands(this);

    this.appContentEl = div(this.appEl, "app_content");
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
