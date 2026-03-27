window.addEventListener("load", function () {
  setTimeout(function () {
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      var asciiArt = [
        "                           .++.                       ",
        "                         .+###*-                      ",
        "                       .+#######-                     ",
        "                     .+##########:                    ",
        "                   .+############*                    ",
        "                 .+###############.                   ",
        "                :*################:     =+.           ",
        "                  =*##############.   =*###+.         ",
        "                    =*###########+  =*#######+.       ",
        "                ..    =*#########:=*###########+.     ",
        "        .:=+*#######**+=*#######**###############+.   ",
        "     .-*###########################################+. ",
        "    -################################################-",
        "     .+###########################################*-. ",
        "       .+###############**#######*=+**#######*+=:.    ",
        "         .+###########*=:#########*=    ..            ",
        "           .+#######*=  +###########*=                ",
        "             .+###*=   .##############*=              ",
        "               .+=     :################*:            ",
        "                       .###############+.             ",
        "                        *############+.               ",
        "                        :##########+.                 ",
        "                         -#######+.                   ",
        "                          -*###+.                     ",
        "                           .++.                       "
      ].join("\n");

      console.log(
        "%c" + asciiArt,
        "color: #FF542D; font-size: 10px; font-family: monospace; line-height: 12px;"
      );
      console.log(
        "%c Web Design Agency | Everything Design - %o",
        "color: #FF542D; font-size: 14px; font-weight: bold; padding: 8px 0;",
        "https://www.everything.design/"
      );
    } else {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "https://cdn.jsdelivr.net/gh/Everything-Design/everythingflow@main/Everything-design/Console%20Image.png";
      img.onload = function () {
        var w = 500;
        var h = Math.floor(w * 9 / 16); // 225px

        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");

        // White background
        ctx.fillStyle = "#ffffff00";
        ctx.fillRect(0, 0, w, h);

        // Center the image within the 16:9 frame
        var imgScale = Math.min(w / this.width, h / this.height);
        var drawW = Math.floor(this.width * imgScale);
        var drawH = Math.floor(this.height * imgScale);
        var offsetX = Math.floor((w - drawW) / 2);
        var offsetY = Math.floor((h - drawH) / 2);

        ctx.drawImage(this, offsetX, offsetY, drawW, drawH);
        var dataUrl = canvas.toDataURL("image/png");

        console.log(
          "%c ",
          "font-size: 1px; padding: " + Math.floor(h / 2) + "px " + Math.floor(w / 2) + "px; background: url(" + dataUrl + ") no-repeat; background-size: " + w + "px " + h + "px;"
        );
        console.log(
          "%c Everything Design - %o",
          "color: #FF542D; font-size: 14px; font-weight: bold; padding: 8px 0;",
          "https://www.everything.design/"
        );
      };
      img.onerror = function () {
        console.log(
          "%c Everything Design - %o",
          "color: #FF542D; font-size: 14px; font-weight: bold;",
          "https://www.everything.design/"
        );
      };
    }
  }, 2000);
});
