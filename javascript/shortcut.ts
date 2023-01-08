class Shortcut {
  whichCode: number;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;

  handler: () => void;

  constructor(str: string, handler: () => void) {
    this.ctrl = false;
    this.alt = false;
    this.shift = false;

    this.handler = handler;
    this.whichCode = -1;

    let parts = str.split("+");
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      part = part.toLowerCase();
      if (part.length == 1) {
        if (this.whichCode != -1) {
          console.error("which code already set");
          return;
        }
        this.whichCode = part.charCodeAt(0) - 32;
      } else {
        switch (part) {
          case "ctrl":
            this.ctrl = true;
            break;
          case "alt":
            this.alt = true;
            break;
          case "shift":
            this.shift = true;
            break;
          default:
            if (part.length >= 2 && part.startsWith("#")) {
              if (this.whichCode != -1) {
                console.error("which code already set");
                return;
              }
              part = part.replace("#", "");
              let codeInt = parseInt(part);
              if (codeInt < 0) {
                console.error("unknown shortcut " + part);
                return;
              }
              this.whichCode = codeInt;
            } else {
              console.error("unknown shortcut " + part);
            }
        }
      }
    }
  }

  matches(e: KeyboardEvent): boolean {
    if (e.which != this.whichCode) {
      return false;
    }

    if (this.shift != e.shiftKey) {
      return false;
    }

    if (this.alt != e.altKey) {
      return false;
    }

    if (this.ctrl) {
      if (!e.metaKey && !e.ctrlKey) {
        return false;
      }
    }

    return true;
  }
}
