// Create a new div element to contain the text and link
const container = document.createElement('div');

// Add the class 'text-size-small' to the container
container.className = 'text-size-small';

// Set the part of the text that is not a link
const textNode = document.createTextNode('Designed by ');
container.appendChild(textNode);

// Create the link (anchor) element for 'Everything Design'
const link = document.createElement('a');
link.href = 'https://everything.design'; // Set the link destination
link.textContent = 'Everything Design'; // Set the link text

// Add hover effect for the link using JavaScript
link.style.textDecoration = 'none'; // Ensure no underline by default
link.onmouseover = function() {
    this.style.textDecoration = 'underline';
};
link.onmouseout = function() {
    this.style.textDecoration = 'none';
};

// Append the link to the container
container.appendChild(link);

// Append the container to the body of the document
// or to any specific element where you want this to appear
document.body.appendChild(container);
