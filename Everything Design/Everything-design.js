// Create a new paragraph element to serve as the container
const container = document.createElement('p');

// Assign the 'text-size-small' class to the container
container.className = 'text-size-small';

// Create a text node for the part of the text that isn't a link
const textNode = document.createTextNode('Designed by ');

// Append the text node to the container
container.appendChild(textNode);

// Create the anchor element for 'Everything Design'
const link = document.createElement('a');
link.href = 'https://everything.design'; // Set the hyperlink destination
link.textContent = 'Everything Design'; // Set the text for the link

// Style the link to not have an underline by default
link.style.textDecoration = 'none';

// Add event listeners for mouseover and mouseout to create the hover effect
link.onmouseover = function() {
    this.style.textDecoration = 'underline'; // Add underline on hover
};
link.onmouseout = function() {
    this.style.textDecoration = 'none'; // Remove underline when not hovered
};

// Append the link to the container
container.appendChild(link);

// Finally, append the container to the body of the document
// This inserts your dynamically created content into the page
document.body.appendChild(container);
