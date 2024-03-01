// Create a new paragraph element to serve as the container
const container = document.createElement('p');

// Assign the 'text-size-small' class to the container
container.className = 'text-size-small';

// Create the anchor element that will contain the entire text
const link = document.createElement('a');
link.href = 'https://everything.design'; // Set the hyperlink destination
link.innerHTML = 'Designed by <span>Everything Design</span>'; // Set the text, with optional span for styling

// Explicitly enforce inheritance for font size and color
link.style.color = 'inherit'; // Ensures the color is inherited from the parent
link.style.fontSize = 'inherit'; // Ensures the font size is inherited from the parent

// Ensure the link does not have an underline by default
link.style.textDecoration = 'none';

// Add hover effect for the link using JavaScript
link.onmouseover = function() {
    this.style.textDecoration = 'underline'; // Add underline on hover
};
link.onmouseout = function() {
    this.style.textDecoration = 'none'; // Remove underline when not hovered
};

// Append the link to the container paragraph
container.appendChild(link);

// Finally, append the container to the body of the document
document.body.appendChild(container);
