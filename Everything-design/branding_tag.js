/**
 * Everything Design - Combined Easter Egg Script (Custom Image Version)
 * Displays ASCII art in browser console and HTML comments
 * GitHub: https://www.everything.design/
 */

window.addEventListener("load", function () {
  // Console Easter Egg
  setTimeout(function () {
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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

    if (isSafari) {
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
      // CUSTOMIZE THIS URL WITH YOUR OWN IMAGE
      var imageUrl = "YOUR_IMAGE_URL_HERE";
      
      // Show ASCII art immediately for all non-Safari browsers
      console.log(
        "%c" + asciiArt,
        "color: #FF542D; font-size: 10px; font-family: monospace; line-height: 12px;"
      );
      console.log(
        "%c Web Design Agency | Everything Design - %o",
        "color: #FF542D; font-size: 14px; font-weight: bold; padding: 8px 0;",
        "https://www.everything.design/"
      );
      
      // Try to load custom image if provided
      if (imageUrl !== "YOUR_IMAGE_URL_HERE") {
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        
        img.onload = function () {
          var w = 500;
          var h = Math.floor(w * 9 / 16);
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff00";
          ctx.fillRect(0, 0, w, h);
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
        };
      }
    }
  }, 2000);

  // HTML Comment Easter Egg
  var doctype = document.doctype;
  if (doctype) {
    var htmlCommentAscii = `  
                                   	     .++.                       
                                       .+###*-                      
                                     .+#######-                     
                                   .+##########:                    
                                 .+############*                    
                               .+###############.                   
                              :*################:     =+.           
                                =*##############.   =*###+.         
                                  =*###########+  =*#######+.       
                              ..    =*#########:=*###########+.     
                      .:=+*#######**+=*#######**###############+.   
                   .-*###########################################+. 
                  -################################################-
                   .+###########################################*-. 
                     .+###############**#######*=+**#######*+=:.    
                       .+###########*=:#########*=    ..            
                         .+#######*=  +###########*=                
                           .+###*=   .##############*=              
                             .+=     :################*:            
                                     .###############+.             
                                      *############+.               
                                      :##########+.                 
                                       -#######+.                   
                                        -*###+.                     
                                         .++.                                
        Web Design Agency | Everything Design - https://www.everything.design/
      `;
    var comment = document.createComment(htmlCommentAscii);
    doctype.parentNode.insertBefore(comment, doctype.nextSibling);
  }
});
