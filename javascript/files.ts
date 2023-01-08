class Files extends App {
  list: List;

  constructor() {
    super();

    //var listEl = document.createElement("div");
    //listEl.classList.add("list");
    //this.appContentEl.append(listEl);

    let path = this.getURLParam("path");
    if (!path) {
      path = this.homePath();
    }

    this.list = new List(
      this.appContentComponent,
      path,
      this.changedListPath.bind(this)
    );

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

  homePath(): string {
    return document.body.getAttribute("data-home");
  }

  changedListPath() {
    document.title = this.list.filesData.CurrentDirInfo.Name;

    history.pushState(
      {},
      null,
      "/files?path=" + encodeURI(this.list.filesData.CurrentPath)
    );
  }
}
