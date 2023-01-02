class Preview extends App {
  previewEl: HTMLDivElement;

  constructor() {
    super();

    this.previewEl = document.createElement("div");
    this.previewEl.classList.add("preview");
    this.appContentEl.append(this.previewEl);

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let path = urlParams.get("path");
    this.previewData(path);

    //console.log(path);
  }

  previewData(path: string) {
    let request = new XMLHttpRequest();
    request.open("POST", "/api/download", true);
    request.addEventListener("load", () => {
      if (request.status != 200) {
        console.error("Error while downloading item.");
        return;
      }
      var data = JSON.parse(request.response);
      this.previewEl.innerText = data.Data;
      console.log(data);
    });
    request.send(JSON.stringify({ Path: path }));
  }
}
