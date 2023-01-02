class List {
  el: HTMLDivElement;
  filesData: any;
  //parentPath: string;

  constructor(el: HTMLDivElement) {
    this.el = el;
    this.loadHome();
  }

  loadHome() {
    this.loadData(document.body.getAttribute("data-home"));
  }

  loadData(path: string) {
    let request = new XMLHttpRequest();

    request.open("POST", "/api/list", true);
    request.addEventListener("load", () => {
      if (request.status != 200) {
        console.error("Error while saving order.");
        return;
      }

      var data = JSON.parse(request.response);
      this.setData(data);
    });
    request.send(JSON.stringify({ Path: path }));
  }

  setData(data: any) {
    this.filesData = data;

    this.el.innerHTML = "";

    for (var i = 0; i < data.Files.length; i++) {
      let file = data.Files[i];

      let row = div(this.el, "list_item");

      //var fileEl = document.createElement("div");
      row.setAttribute("data-index", i + "");

      //fileEl.classList.add("list_item");
      if (file.IsDir) {
        row.classList.add("list_item-directory");
      }

      //row.innerText = file.Name;
      row.addEventListener("click", this.clickFile.bind(this));

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
    let file = this.filesData.Files[index];
    if (file.IsDir) {
      this.loadData(file.Path);
    } else {
      window.open("/preview?path=" + file.Path, "_blank");
    }

    //console.log(this.filesData);
  }

  levelUp() {
    if (this.filesData && this.filesData.ParentPath) {
      this.loadData(this.filesData.ParentPath);
    }
  }
}
