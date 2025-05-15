// Direct fix for cart page buttons - FIXED VERSION
// This completely removes old handlers and prevents double increments

// Define a global flag to prevent multiple clicks/handlers
window.cartButtonsAlreadyFixed = window.cartButtonsAlreadyFixed || false;

document.addEventListener('DOMContentLoaded', function() {
    // Only run once to prevent duplicate handlers
    if (window.cartButtonsAlreadyFixed) {
        console.log('Cart buttons already fixed, skipping');
        return;
    }
    
    console.log('Cart buttons fix v2 loaded');
    window.cartButtonsAlreadyFixed = true;
    
    // Completely remove old cart handlers
    function removeAllCartHandlers() {
        // First disable all the cart event handlers in the page
        document.querySelectorAll('.decrease-quantity, .increase-quantity, .remove-item').forEach(function(button) {
            button.outerHTML = button.outerHTML; // Trick to remove all event listeners
        });
    }
    
    // First call for initialization
    removeAllCartHandlers();
    
    // Attach new clean event handlers
    function attachNewHandlers() {
        // Disable all default behavior
        document.querySelectorAll('.decrease-quantity, .increase-quantity, .remove-item').forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
            }, true); // Capture phase
        });
    
        // DECREASE buttons
        document.querySelectorAll('.decrease-quantity').forEach(function(button) {
            button.addEventListener('click', function(event) {
                // Prevent default actions and stop propagation
                event.preventDefault();
                event.stopPropagation();
                
                // Disable the button immediately
                this.disabled = true;
                
                console.log('Decrease clicked');
                const productId = this.getAttribute('data-id');
                console.log('Product ID for decrease:', productId);
                
                // Get the cart from localStorage
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item && item.quantity > 1) {
                    // Decrement by exactly 1
                    item.quantity = parseInt(item.quantity) - 1;
                    
                    // Save to localStorage
                    localStorage.setItem('cart', JSON.stringify(cart));
                    console.log('New quantity after decrease:', item.quantity);
                    
                    // Reload the page to reflect changes
                    window.location.reload();
                }
            });
        });
        
        // INCREASE buttons
        document.querySelectorAll('.increase-quantity').forEach(function(button) {
            button.addEventListener('click', function(event) {
                // Prevent default actions and stop propagation
                event.preventDefault();
                event.stopPropagation();
                
                // Disable the button immediately
                this.disabled = true;
                
                console.log('Increase clicked');
                const productId = this.getAttribute('data-id');
                console.log('Product ID for increase:', productId);
                
                // Get the cart from localStorage
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item) {
                    // Increment by exactly 1
                    item.quantity = parseInt(item.quantity) + 1;
                    
                    // Save to localStorage
                    localStorage.setItem('cart', JSON.stringify(cart));
                    console.log('New quantity after increase:', item.quantity);
                    
                    // Reload the page to reflect changes
                    window.location.reload();
                }
            });
        });
        
        // REMOVE buttons
        document.querySelectorAll('.remove-item').forEach(function(button) {
            button.addEventListener('click', function(event) {
                // Prevent default actions and stop propagation
                event.preventDefault();
                event.stopPropagation();
                
                // Disable the button immediately
                this.disabled = true;
                
                console.log('Remove clicked');
                const productId = this.getAttribute('data-id');
                console.log('Product ID for remove:', productId);
                
                // Get the cart from localStorage and filter out the item
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const updatedCart = cart.filter(i => i.id != productId);
                
                // Save to localStorage
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                console.log('Item removed, remaining items:', updatedCart.length);
                
                // Reload the page to reflect changes
                window.location.reload();
            });
        });
        
        console.log('All cart buttons fixed and active with proper handlers');
    }
    
    // Attach new handlers
    attachNewHandlers();
    
    // Periodically check if any new buttons were added and remove their handlers
    setInterval(removeAllCartHandlers, 2000); // Check every 2 seconds
});
