/**
 * User-specific cart management with MongoDB integration
 * This simpler implementation syncs the cart to MongoDB without breaking existing functionality
 */
(function() {
    // Check if the user is authenticated (from session)
    const isAuthenticated = document.querySelector('.cart-count')?.getAttribute('data-auth') === 'true';
    console.log('Cart MongoDB sync - Auth status:', isAuthenticated);
    
    // Only add listeners if user is authenticated
    if (isAuthenticated) {
        // Listen for changes to the cart in localStorage
        window.addEventListener('storage', function(event) {
            if (event.key === 'cart') {
                // Sync to MongoDB when cart changes
                syncCartToMongoDB();
            }
        });
        
        // Perform initial sync on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Get MongoDB cart and merge with local if needed
            fetch('/api/cart')
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error loading MongoDB cart:', data.error);
                        return;
                    }
                    
                    if (data.cart && data.cart.length > 0) {
                        console.log('Found existing MongoDB cart with', data.cart.length, 'items');
                        
                        // Get local cart
                        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
                        
                        // If local cart is empty but server has items
                        if (localCart.length === 0 && data.cart.length > 0) {
                            console.log('Using MongoDB cart instead of empty local cart');
                            localStorage.setItem('cart', JSON.stringify(data.cart));
                            
                            // Refresh cart display if on cart page
                            if (window.location.pathname.includes('/cart')) {
                                window.location.reload();
                            } else if (typeof window.updateCartCount === 'function') {
                                window.updateCartCount();
                            }
                        } else if (localCart.length > 0) {
                            // Both have items, keep local cart and sync to server
                            console.log('Both local and MongoDB carts have items, syncing local to server');
                            syncCartToMongoDB();
                        }
                    } else {
                        // MongoDB cart is empty, sync local cart to it
                        console.log('MongoDB cart is empty, syncing local cart');
                        syncCartToMongoDB();
                    }
                })
                .catch(err => console.error('Error fetching MongoDB cart:', err));
        });
        
        // Set up periodic sync
        setInterval(syncCartToMongoDB, 30000); // Sync every 30 seconds if authenticated
    }
    
    // Function to sync cart to MongoDB
    function syncCartToMongoDB() {
        if (!isAuthenticated) return;
        
        // Get current cart from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Send to server without waiting for response
        fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error syncing cart to MongoDB:', data.error);
            } else {
                console.log('Cart synced to MongoDB successfully');
            }
        })
        .catch(err => console.error('Failed to sync cart to MongoDB:', err));
    }
    
    // Add sync to cart remove/add/update actions by listening to clicks
    document.addEventListener('click', function(event) {
        // Wait a bit for the cart to update in localStorage
        if (event.target.classList.contains('remove-item') ||
            event.target.classList.contains('increase-quantity') ||
            event.target.classList.contains('decrease-quantity')) {
            
            // Delay to allow localStorage to update first
            setTimeout(syncCartToMongoDB, 500);
        }
    });
    
    // Expose function globally
    window.syncCartToMongoDB = syncCartToMongoDB;
})();
