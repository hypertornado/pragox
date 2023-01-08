class Home extends App {
  homeComponent: HomeComponent;

  constructor() {
    super();

    this.homeComponent = new HomeComponent(this.appContentComponent);

    //this.homeEl = document.createElement("div");

    //this.appContentEl.append(this.homeEl);
    //this.homeEl.classList.add("home");

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

      let iconEl = div(el, "home_item_icon");
      iconEl.innerText = app.Icon;

      let nameEl = div(el, "home_item_name");
      nameEl.innerText = app.Name;

      this.homeComponent.rootEl.append(el);
    }
  }
}

class HomeComponent extends Component {
  constructor(parent: Component) {
    super(parent);
    this.addCSSClass("home");
  }
}
