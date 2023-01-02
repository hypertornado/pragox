class Home extends App {
  homeEl: HTMLDivElement;

  constructor() {
    super();

    this.homeEl = document.createElement("div");

    this.appContentEl.append(this.homeEl);
    //document.body.append(this.homeEl);
    this.homeEl.classList.add("home");

    this.loadApps();
  }

  loadApps() {
    let request = new XMLHttpRequest();
    request.open("POST", "/api/apps", true);
    request.addEventListener("load", () => {
      if (request.status != 200) {
        console.error("Error while saving order.");
        return;
      }

      var data = JSON.parse(request.response);
      this.renderApps(data.Apps);
    });

    request.send(JSON.stringify({}));
  }

  renderApps(appsData: any) {
    for (var i = 0; i < appsData.length; i++) {
      let app = appsData[i];

      let el = document.createElement("a");
      el.classList.add("home_item");
      el.setAttribute("href", app.URL);
      el.innerText = app.Name;

      this.homeEl.append(el);
    }
  }
}
