class Pragox {
  static start() {
    document.addEventListener("DOMContentLoaded", Pragox.init);
  }

  private static init() {
    let appID = document.body.getAttribute("data-app-id");
    if (appID == "home") {
      new Home();
      return;
    }
    if (appID == "files") {
      new Files();
      return;
    }
    if (appID == "preview") {
      new Preview();
      return;
    }

    console.error("Unknown app " + appID);
  }
}
Pragox.start();
