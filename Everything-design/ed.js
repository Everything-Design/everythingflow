// Create a new paragraph element to serve as the container
const container = document.createElement('p');

// Optionally, adjust the container's display property; however, <p> is a block-level element by default.
// If you truly need it to be inline without taking its own block space, consider using a span or styling the <p> as inline.
// This example will keep the <p> as default, focusing on making the <a> element adapt to its content.

// Create the anchor element that will contain the entire text
const link = document.createElement('a');
link.href = 'https://everything.design'; // Set the hyperlink destination
link.innerHTML = 'Designed by <span>Everything Design</span>'; // Set the text, with optional span for styling purposes

// Ensure the link behaves as an inline element; this is default, but explicitly stating for clarity
link.style.display = 'inline'; // Ensures the anchor behaves as an inline element, adapting to its content
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

// Finally, append the container to the body of the document or to a specific element of your choice
// This action places the content precisely where you intend without enforcing block-level space requirements.
document.body.appendChild(container);
