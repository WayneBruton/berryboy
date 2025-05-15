// Cart utilities for The Berry Boy website
(function() {
    // Update cart icon based on actual cart items
    function updateCartCount() {
        // Get cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Count actual items (sum of quantities)
        const itemCount = cartItems.reduce(function(total, item) {
            return total + (parseInt(item.quantity) || 0);
        }, 0);
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count').forEach(function(el) {
            // Check if user is authenticated via data attribute
            const isAuthenticated = el.getAttribute('data-auth') === 'true';
            
            // Only show non-zero count for authenticated users
            if (isAuthenticated) {
                el.textContent = itemCount;
            } else {
                // Always show 0 for non-authenticated users
                el.textContent = '0';
            }
        });
        
        console.log('Cart count updated to:', itemCount); // Debug info
        return itemCount;
    }
    
    // Make updateCartCount available globally
    window.updateCartCount = updateCartCount;
    
    // Simple cart operations
    window.cartOperations = {
        // Add item to cart
        addItem: function(productId, quantity) {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cartItems.find(item => item.id == productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cartItems.push({
                    id: productId,
                    quantity: quantity
                });
            }
            
            // Update local storage
            localStorage.setItem('cart', JSON.stringify(cartItems));
            
            // Update cart icon
            updateCartCount();
            
            return Promise.resolve({ success: true });
        },
        
        // Remove item from cart
        removeItem: function(productId) {
            // Update local cart
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const updatedCart = cartItems.filter(item => item.id != productId);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            
            // Update cart icon
            updateCartCount();
            
            return Promise.resolve({ success: true });
        },
        
        // Update item quantity
        updateQuantity: function(productId, newQuantity) {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const item = cartItems.find(item => item.id == productId);
            
            if (item) {
                item.quantity = Math.max(1, newQuantity);
                localStorage.setItem('cart', JSON.stringify(cartItems));
                updateCartCount();
            }
            
            return Promise.resolve({ success: true });
        }
    };
    
    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', function(event) {
        if (event.key === 'cart') {
            // Update cart count when cart data changes in another tab
            updateCartCount();
        }
    });
    
    // Run immediately when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Cart utilities loaded - updating cart count');
        // Force an immediate update of cart count
        setTimeout(updateCartCount, 100); // Small delay to ensure DOM is ready
    });
})();
