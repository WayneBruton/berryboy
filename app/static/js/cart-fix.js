/**
 * Simple cart functionality for The Berry Boy
 * Direct fix with no dependencies on other files
 */

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart fix loaded');
    
    // Fix increase buttons
    document.querySelectorAll('.increase-quantity').forEach(function(button) {
        button.onclick = function() {
            console.log('+ clicked');
            var productId = this.getAttribute('data-id');
            var inputField = document.querySelector('.item-quantity[data-id="' + productId + '"]');
            var currentValue = parseInt(inputField.value) || 1;
            inputField.value = currentValue + 1;
            
            // Update cart in localStorage
            updateCartItemQuantity(productId, currentValue + 1);
            
            // Force display update
            if (typeof updateCartDisplay === 'function') {
                updateCartDisplay();
            } else {
                window.location.reload();
            }
            
            return false; // Prevent any other handlers
        };
    });
    
    // Fix decrease buttons
    document.querySelectorAll('.decrease-quantity').forEach(function(button) {
        button.onclick = function() {
            console.log('- clicked');
            var productId = this.getAttribute('data-id');
            var inputField = document.querySelector('.item-quantity[data-id="' + productId + '"]');
            var currentValue = parseInt(inputField.value) || 1;
            
            if (currentValue > 1) {
                inputField.value = currentValue - 1;
                
                // Update cart in localStorage
                updateCartItemQuantity(productId, currentValue - 1);
                
                // Force display update
                if (typeof updateCartDisplay === 'function') {
                    updateCartDisplay();
                } else {
                    window.location.reload();
                }
            }
            
            return false; // Prevent any other handlers
        };
    });
    
    // Fix remove buttons
    document.querySelectorAll('.remove-item').forEach(function(button) {
        button.onclick = function() {
            console.log('Remove clicked');
            var productId = this.getAttribute('data-id');
            
            // Remove item from localStorage
            removeFromCart(productId);
            
            // Force display update
            if (typeof updateCartDisplay === 'function') {
                updateCartDisplay();
            } else {
                window.location.reload();
            }
            
            return false; // Prevent any other handlers
        };
    });
    
    // Helper function to update cart item quantity in localStorage
    function updateCartItemQuantity(productId, newQuantity) {
        var cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        var found = false;
        
        for (var i = 0; i < cartItems.length; i++) {
            if (cartItems[i].id == productId) {
                cartItems[i].quantity = newQuantity;
                found = true;
                break;
            }
        }
        
        if (!found && newQuantity > 0) {
            cartItems.push({
                id: productId,
                quantity: newQuantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount();
    }
    
    // Helper function to remove item from cart
    function removeFromCart(productId) {
        var cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        var updatedCart = cartItems.filter(function(item) {
            return item.id != productId;
        });
        
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartCount();
    }
    
    // Update cart count display
    function updateCartCount() {
        var cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        var totalItems = 0;
        
        for (var i = 0; i < cartItems.length; i++) {
            totalItems += parseInt(cartItems[i].quantity) || 0;
        }
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count').forEach(function(element) {
            element.textContent = totalItems;
        });
    }
});
