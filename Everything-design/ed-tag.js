// ED Tag
document.addEventListener("DOMContentLoaded", function () {
  // Select the element with the class "ed_credit-component"
  var creditComponent = document.querySelector(".ed_credit-component");

  // Create a new div element
  var newDiv = document.createElement("div");
  newDiv.innerHTML = `
    <div>Website by <a href="https://www.everything.design/">Everything Design</a></div>
    `;

  // Append the new div element to the page-wrapper
  creditComponent.appendChild(newDiv);
});
