// Simplified cart utilities
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
            el.textContent = itemCount;
        });
        
        return itemCount;
    }
    
    // Make updateCartCount available globally
    window.updateCartCount = updateCartCount;
    
    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', function(event) {
        if (event.key === 'cart') {
            // Update cart count when cart data changes in another tab
            updateCartCount();
        }
    });
    
    // Simple cart operations
    window.cartOperations = {
        // Add item to cart
        addItem: function(productId, quantity) {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cartItems.find(item => item.id === productId);
            
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
            
            // Also update on server
            return fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity: quantity })
            })
            .then(response => response.json())
            .catch(error => console.error('Error syncing with server:', error));
        },
        
        // Remove item from cart
        removeItem: function(productId) {
            // Update local cart first for immediate UI response
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const updatedCart = cartItems.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            
            // Update cart icon
            updateCartCount();
            
            // Sync with server
            return fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId })
            })
            .then(response => response.json())
            .catch(error => console.error('Error syncing with server:', error));
        },
        
        // Update item quantity
        updateQuantity: function(productId, quantity) {
            // Update local cart
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const item = cartItems.find(item => item.id === productId);
            
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(cartItems));
            }
            
            // Update cart icon
            updateCartCount();
            
            // Sync with server
            return fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product_id: productId, 
                    quantity: quantity,
                    is_update: true 
                })
            })
            .then(response => response.json())
            .catch(error => console.error('Error syncing with server:', error));
        }
    };
    
    // Initialize cart count on page load
    document.addEventListener('DOMContentLoaded', function() {
        updateCartCount();
    });
})();
