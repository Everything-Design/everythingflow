// ED Tag
document.addEventListener("DOMContentLoaded", function () {
  // Select the element with the id "ed-tag"
  var edTag = document.getElementById("ed-tag");

  // Create a new div element
  var newDiv = document.createElement("div");
  newDiv.innerHTML = `
    <div>Website by <a href="https://www.everything.design/">Everything Design</a></div>
    `;

  // Append the new div element to the edTag
  edTag.appendChild(newDiv);
});
