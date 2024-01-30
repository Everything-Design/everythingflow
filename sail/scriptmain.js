document.addEventListener("DOMContentLoaded", function () {
    console.log("testing");
    renderCartItems();
    $(document).ready(function () {
      $(".product-card").on("click", function () {
        // Set a timeout to delay the click event by 3 seconds
        setTimeout(function () {
          $("#solution-card-button-1").click();
        }, 3000);
      });
    });
  
    // Custom code to toggle get-quote cart
    var quoteButton = document.getElementById("navbar-quote-button");
    var cartContainer = document.getElementById("navbar_cart-container");
    var cartOverlay = document.getElementById("nav_cart-overlay");
    var closeButton = document.getElementById("navbar-cart-closebtn");
  
    // Function to toggle the display of the cart container and overlay
    function toggleCartDisplay() {
      cartContainer.classList.toggle('visible');
      cartOverlay.classList.toggle('visible');
  
      // Disable scroll when quote cart open
      if (cartContainer.classList.contains('visible')) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
    }
  
    // Check if elements exist to avoid errors
    if (quoteButton && cartOverlay && closeButton) {
      quoteButton.addEventListener("click", function () {
        toggleCartDisplay();
      });
  
      closeButton.addEventListener("click", function () {
        toggleCartDisplay();
      });
  
      cartOverlay.addEventListener("click", function () {
        toggleCartDisplay();
      });
    }
  
    // Function to add item to local storage
    function addItemToLocalStorage(itemName, itemId, itemType) {
      // Retrieve existing items from local storage
      let storedItems = JSON.parse(localStorage.getItem("quotedItems")) || [];
  
      // Create an object for the new item
      let newItem = { name: itemName, id: itemId, type: itemType };
  
      // Add the new item to the array
      storedItems.push(newItem);
  
      // Save back to local storage
      localStorage.setItem("quotedItems", JSON.stringify(storedItems));
      renderCartItems();
    }
  
    function handleButtonClick(event) {
      // Find the closest ancestor div with role="button"
      let buttonDiv = event.target.closest('div[role="button"]');
      if (!buttonDiv) return; 
  
  
      let itemType = buttonDiv.getAttribute("data-item-type");
      let itemName = buttonDiv.getAttribute("data-item-name");
      let itemId = buttonDiv.getAttribute("data-item-id");
  
      if (itemName && itemId) {
          addItemToLocalStorage(itemName, itemId, itemType);
          // toggleCartDisplay();
          updateButtonStyles(itemId); 
      }
    }
  
    function updateButtonStyles(itemId) {
      let button = document.querySelector(`div[role="button"][data-item-id="${itemId}"]`);
      if (!button) return;
  
      let storedItems = JSON.parse(localStorage.getItem("quotedItems")) || [];
      let isItemInCart = storedItems.some(item => item.id === itemId);
  
      console.log("button", button)
      console.log("button.style.backgroundColor", button.style.backgroundColor)
  
      if (isItemInCart) {
          button.style.backgroundColor = '#e26d2a'; 
      } else {
          button.style.backgroundColor = ''; 
      }
    }
  
    document.querySelectorAll("#add-opportunities-quote, #add-convert-quote, #add-efficiency-quote")
    .forEach(buttonDiv => {
        buttonDiv.addEventListener("click", handleButtonClick);
    });
  
  
    function renderCartItems() {
      let storedItems = JSON.parse(localStorage.getItem("quotedItems")) || [];
      let cartContentWrapper = document.getElementById("navbar_cart-content-wrapper");
      cartContentWrapper.innerHTML = ''; 
  
      let quoteCount = document.getElementById("quote-count");
  
      storedItems.forEach(item => {
        updateButtonStyles(item.id);
        console.log("item.id",item.id)
      });
  
      if (storedItems.length === 0) {
          if (quoteCount) {
            quoteCount.style.display = 'none';
          }
          let emptyCartDiv = document.createElement('div');
          emptyCartDiv.textContent = 'Your quote cart is currently empty.';
          emptyCartDiv.className = 'empty-cart-message'; // for styling
          cartContentWrapper.appendChild(emptyCartDiv);
      } else {
          if (quoteCount) {
            quoteCount.style.display = 'flex';
            quoteCount.textContent = storedItems.length.toString();
          }
  
          let clearButton = document.createElement('button');
          clearButton.textContent = 'Clear All';
          clearButton.className = 'quote-clear-button text-size-small font-dm-sans text-weight-bold'; // Added classes
          clearButton.style.position = 'absolute';
          clearButton.style.top = '5rem';
          clearButton.style.background = 'transparent';
          clearButton.style.border = 'none';
          clearButton.style.cursor = 'pointer';
          clearButton.addEventListener('click', clearCart);
          cartContentWrapper.appendChild(clearButton);
          let groupedItems = groupItemsByType(storedItems);
          let cartDataForForm = [];
  
          for (let type in groupedItems) {
              let typeDiv = document.createElement("div");
              typeDiv.className = "navbar_cart-quote-type";
  
              let typeTitle = document.createElement("div");
              typeTitle.className = "text-size-small font-dm-sans text-weight-bold";
              typeTitle.textContent = type;
              typeDiv.appendChild(typeTitle);
  
              groupedItems[type].forEach((item, index) => {
                  updateButtonInnerText(item.id);
                  let itemDiv = document.createElement("div");
                  itemDiv.className = "navbar_cart-content";
                  itemDiv.setAttribute('data-item-id', item.id);
  
                  let itemNameSpan = document.createElement("span");
                  itemNameSpan.className = "navbar_cart-quote-title max-width-xxsmall";
                  itemNameSpan.textContent = item.name;
  
                  let deleteButton = createDeleteButton(index, item.id);
  
                  itemDiv.appendChild(itemNameSpan);
                  itemDiv.appendChild(deleteButton);
  
                  typeDiv.appendChild(itemDiv);
  
                  cartDataForForm.push({
                    name: item.name,
                    id: item.id,
                    type: item.type
                  });
              });
  
              cartContentWrapper.appendChild(typeDiv);
          }
          updateFormInput(cartDataForForm);
          updateQuoteButtonCount(cartDataForForm);
      }
    }
  
    function clearCart() {
      localStorage.setItem("quotedItems", JSON.stringify([]));
      renderCartItems();
      resetAllButtonStates();
    }
  
    function resetAllButtonStates() {
      document.querySelectorAll("#add-opportunities-quote, #add-convert-quote, #add-efficiency-quote")
      .forEach(buttonDiv => {
          updateButtonInnerText(buttonDiv.getAttribute("data-item-id"));
          updateButtonStyles(buttonDiv.getAttribute("data-item-id")); // Reset styles
      });
    }
  
  function updateButtonInnerText(itemId) {
    let button = document.querySelector(`div[role="button"][data-item-id="${itemId}"]`);
    if (!button) return;
  
    let storedItems = JSON.parse(localStorage.getItem("quotedItems")) || [];
    let isItemInCart = storedItems.some(item => item.id === itemId);
  
    let buttonTextElement = button.querySelector('.text-size-small'); 
    if (buttonTextElement) {
      let htmlContent = isItemInCart 
          ? '<span class="text-size-small">Added to quote!</span>'
          : '<span class="text-size-small">+ Add to quote</span>';
  
      buttonTextElement.innerHTML = htmlContent;
  
      // Toggle the added-to-cart class based on whether the item is in the cart
      // if (isItemInCart) {
      //   button.classList.remove('background-color-purple-1');
      //   button.classList.add('is-quote-added-button');
      // } else {
      //   button.classList.remove('is-quote-added-button');
      //   button.classList.add('background-color-purple-1');
      // }
      }
    }
  
  
    function updateQuoteButtonCount(cartData) {
      let quoteCount = document.getElementById("quote-count");
      if (quoteCount) {
          // The count should be the length of cartData
          let count = cartData.length;
          quoteCount.textContent = count.toString();
      }
    }
  
  
    function updateFormInput(cartData) {
      let formInput = document.getElementById("cart-data-input");
      if (!formInput) {
          console.error("Cart data input field not found!");
          return;
      }
  
      let itemNames = cartData.map(item => item.name).join(", ");
      formInput.value = itemNames;
    }
  
  
  
    function createDeleteButton(index, itemId) {
        let deleteButton = document.createElement("button");
        deleteButton.className = "navbar-cart-deletebtn no-flex-shrink";
        
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "1.5");
          svg.setAttribute("width", "16"); 
          svg.setAttribute("height", "16");
          svg.style.flexShrink = "0";
          svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />`;
  
          deleteButton.appendChild(svg);
  
        deleteButton.addEventListener("click", function() {
            removeItemFromCart(itemId);
        });
  
        return deleteButton;
    }
  
  
    function groupItemsByType(items) {
      const groupedItems = {};
  
      items.forEach(item => {
          if (!groupedItems[item.type]) {
              groupedItems[item.type] = [];
          }
          if (!groupedItems[item.type].some(existingItem => existingItem.id === item.id)) {
              groupedItems[item.type].push(item);
          }
      });
  
      return groupedItems;
    }
  
    function removeItemFromCart(itemId) {
      let storedItems = JSON.parse(localStorage.getItem("quotedItems")) || [];
      let updatedItems = storedItems.filter(item => item.id !== itemId);
  
      let itemElement = document.querySelector(`.navbar_cart-content[data-item-id="${itemId}"]`);
      if (itemElement) {
        
          itemElement.classList.add('removing');
  
          
          setTimeout(() => {
              localStorage.setItem("quotedItems", JSON.stringify(updatedItems));
              renderCartItems();
              updateButtonInnerText(itemId);
          }, 300); 
      }
  }
  });
  