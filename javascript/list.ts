class List extends Component {
  //el: HTMLDivElement;
  filesData: any;
  //app: App;
  selectedItem: number;

  loadedHandler: () => void;

  constructor(parent: Component, path: string, loadedHandler?: () => void) {
    super(parent);
    //this.app = app;
    this.selectedItem = -1;
    //this.el = el;
    this.loadedHandler = loadedHandler;
    this.loadData(path);
  }

  loadData(path: string) {
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
    } else {
      this.selectedItem = this.selectedMaxCount() - 1;
    }
    this.renderSelection();
  }

  selectDown() {
    if (this.selectedItem < 0) {
      this.selectedItem = 0;
    } else {
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

  selectedMaxCount(): number {
    return this.filesData.Files.length;
  }

  setData(data: any) {
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

      //this.el.append(fileEl);
    }
  }

  clickFile(e: any) {
    let target = <HTMLDivElement>e.currentTarget;
    let index = target.getAttribute("data-index");
    this.selectedItem = parseInt(index);
    this.renderSelection();
  }

  openFile(index: number) {
    let file = this.filesData.Files[index];
    if (file.IsDir) {
      this.loadData(file.Path);
    } else {
      window.open("/preview?path=" + file.Path, "_blank");
    }
  }

  levelUp() {
    if (this.filesData && this.filesData.ParentPath) {
      this.loadData(this.filesData.ParentPath);
    }
  }
}
