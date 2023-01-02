class Files extends App {
  list: List;

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
