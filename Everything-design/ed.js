// Create a new paragraph element to serve as the container
const container = document.createElement('p');

// Style the container to take up full width and behave as an inline-block element
container.style.display = 'inline-block';
container.style.width = '100%'; // Makes the paragraph take the full width of its parent

// Create the anchor element that will contain the entire text
const link = document.createElement('a');
link.href = 'https://everything.design'; // Set the hyperlink destination
link.innerHTML = 'Designed by <span>Everything Design</span>'; // Set the text, with optional span for styling

// Style the anchor to fill the entire space of the paragraph
link.style.display = 'block'; // Makes the anchor fill the full width of the paragraph
link.style.textDecoration = 'none'; // Removes the underline by default

// Add hover effect for the link using JavaScript
link.onmouseover = function() {
    this.style.textDecoration = 'underline'; // Add underline on hover
};
link.onmouseout = function() {
    this.style.textDecoration = 'none'; // Remove underline when not hovered
};

// Append the link to the container paragraph
container.appendChild(link);

// Assign the 'text-size-small' class to the container
container.className = 'text-size-small';

// Finally, append the container to the body of the document
document.body.appendChild(container);
