/**
 * Everything Design - Easter Egg Script
 * Displays ASCII art in browser console and HTML comments
 * 🎨 Web Design Agency | Everything Design
 */

window.addEventListener("load", function () {
  // Console Easter Egg - ASCII Art
  setTimeout(function () {
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

    // Display ASCII art in console
    console.log(
      "%c" + asciiArt,
      "color: #FF542D; font-size: 10px; font-family: monospace; line-height: 12px;"
    );
    
    // Display brand message
    console.log(
      "%cWeb Design Agency | Everything Design - %o",
      "color: #FF542D; font-size: 14px; font-weight: bold; padding: 8px 0;",
      "https://www.everything.design/"
    );
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
