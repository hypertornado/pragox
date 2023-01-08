class Preview extends App {
  previewComponent: PreviewComponent;

  constructor() {
    super();

    this.previewComponent = new PreviewComponent(this.appContentComponent);

    //this.previewEl = document.createElement("div");
    //this.previewEl.classList.add("preview");
    //this.appContentEl.append(this.previewEl);

    let path = this.getURLParam("path");

    this.api("fileinfo", { Path: path }, (data: any) => {
      let mimeType = data.MimeType;

      //console.log(mimeType);
      //console.log(data);

      if (mimeType.startsWith("image/")) {
        new PreviewImage(this, path);
        return;
      }

      if (mimeType.startsWith("audio/")) {
        new PreviewAudio(this, path);
        return;
      }

      if (mimeType.startsWith("video/")) {
        new PreviewVideo(this, path);
        return;
      }

      if (mimeType.startsWith("application/pdf")) {
        new PreviewIframe(this, path);
        return;
      }

      this.apiDownload(path, (data) => {
        new PreviewText(this, data);
      });
    });
  }

  attach(el: HTMLElement) {
    this.previewComponent.rootEl.innerText = "";
    this.previewComponent.rootEl.append(el);
  }
}

class PreviewComponent extends Component {
  constructor(component: Component) {
    super(component);
    this.addCSSClass("preview");
  }
}

class PreviewText {
  rootEl: HTMLDivElement;
  preview: Preview;

  constructor(preview: Preview, data: any) {
    this.preview = preview;
    this.rootEl = document.createElement("div");
    this.rootEl.classList.add("preview_text");

    this.rootEl.innerText = data;
    preview.attach(this.rootEl);
  }
}

class PreviewImage {
  imageContainer: HTMLDivElement;
  imageEl: HTMLImageElement;
  preview: Preview;

  constructor(preview: Preview, data: any) {
    this.preview = preview;

    this.imageContainer = document.createElement("div");
    this.imageContainer.classList.add("preview_img");

    this.imageEl = document.createElement("img");
    this.imageEl.setAttribute("src", "/api/download?path=" + encodeURI(data));

    this.imageEl.addEventListener("click", () => {
      this.imageEl.classList.toggle("full_size");
    });

    this.imageContainer.append(this.imageEl);

    preview.fitContent(this.imageContainer);
    preview.attach(this.imageContainer);
  }
}

class PreviewAudio {
  audioEl: HTMLAudioElement;

  constructor(preview: Preview, path: string) {
    this.audioEl = document.createElement("audio");
    this.audioEl.setAttribute("controls", "");
    this.audioEl.setAttribute("autoplay", "true");

    this.audioEl.setAttribute("src", "/api/download?path=" + encodeURI(path));

    this.audioEl.setAttribute(
      "width",
      preview.previewComponent.rootEl.offsetWidth + ""
    );
    this.audioEl.setAttribute("height", preview.contentHeight() + "");

    this.audioEl.setAttribute(
      "style",
      "width: calc(100vw - 20px); margin-top: 40vh; margin-left: 10px;"
    );

    preview.attach(this.audioEl);
  }
}

class PreviewVideo {
  videoEl: HTMLVideoElement;

  constructor(preview: Preview, path: string) {
    this.videoEl = document.createElement("video");
    this.videoEl.setAttribute("controls", "");
    this.videoEl.setAttribute("autoplay", "true");
    this.videoEl.setAttribute("src", "/api/download?path=" + encodeURI(path));

    preview.fitContent(this.videoEl);
    preview.attach(this.videoEl);
  }
}

class PreviewIframe {
  iframeEl: HTMLIFrameElement;

  constructor(preview: Preview, path: string) {
    this.iframeEl = document.createElement("iframe");
    this.iframeEl.setAttribute("src", "/api/download?path=" + encodeURI(path));
    preview.fitContent(this.iframeEl);
    preview.attach(this.iframeEl);
  }
}
