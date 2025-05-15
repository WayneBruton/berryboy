/**
 * Berry Boy Cart System
 * Standalone cart functionality for The Berry Boy website
 */

const BerryCart = {
    // Get cart items from localStorage
    getItems: function() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },
    
    // Save cart items to localStorage
    saveItems: function(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCount();
    },
    
    // Add item to cart
    addItem: function(productId, quantity) {
        const cartItems = this.getItems();
        const existingItem = cartItems.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({
                id: productId,
                quantity: quantity
            });
        }
        
        this.saveItems(cartItems);
        console.log(`Added product ${productId} to cart. New quantity: ${existingItem ? existingItem.quantity : quantity}`);
        return true;
    },
    
    // Remove item from cart
    removeItem: function(productId) {
        const cartItems = this.getItems();
        const newItems = cartItems.filter(item => item.id != productId);
        this.saveItems(newItems);
        console.log(`Removed product ${productId} from cart`);
        return true;
    },
    
    // Update item quantity
    updateQuantity: function(productId, newQuantity) {
        const cartItems = this.getItems();
        const item = cartItems.find(item => item.id == productId);
        
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.saveItems(cartItems);
            console.log(`Updated quantity for product ${productId} to ${item.quantity}`);
            return true;
        }
        return false;
    },
    
    // Get total items count
    getCount: function() {
        const cartItems = this.getItems();
        return cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
    },
    
    // Update cart count display
    updateCount: function() {
        const count = this.getCount();
        document.querySelectorAll('.cart-count').forEach(function(el) {
            // Check if user is authenticated
            const isAuthenticated = el.getAttribute('data-auth') === 'true';
            
            // Only show non-zero count for authenticated users
            if (isAuthenticated) {
                el.textContent = count;
            } else {
                el.textContent = '0';
            }
        });
        return count;
    },
    
    // Initialize cart system
    init: function() {
        console.log('Berry Cart initialized');
        this.updateCount();
        
        // Add document-wide click handlers for cart operations
        document.addEventListener('click', function(event) {
            // Check for decrease quantity button
            if (event.target.matches('.decrease-quantity')) {
                const productId = event.target.dataset.id;
                const items = BerryCart.getItems();
                const item = items.find(i => i.id == productId);
                
                if (item && item.quantity > 1) {
                    item.quantity--;
                    BerryCart.saveItems(items);
                    
                    // Update display if we're on the cart page
                    if (typeof updateCartDisplay === 'function') {
                        updateCartDisplay();
                    }
                }
            }
            
            // Check for increase quantity button
            else if (event.target.matches('.increase-quantity')) {
                const productId = event.target.dataset.id;
                const items = BerryCart.getItems();
                const item = items.find(i => i.id == productId);
                
                if (item) {
                    item.quantity++;
                    BerryCart.saveItems(items);
                    
                    // Update display if we're on the cart page
                    if (typeof updateCartDisplay === 'function') {
                        updateCartDisplay();
                    }
                }
            }
            
            // Check for remove item button
            else if (event.target.matches('.remove-item') || 
                    event.target.closest('.remove-item')) {
                const button = event.target.matches('.remove-item') ? 
                    event.target : event.target.closest('.remove-item');
                const productId = button.dataset.id;
                
                BerryCart.removeItem(productId);
                
                // Update display if we're on the cart page
                if (typeof updateCartDisplay === 'function') {
                    updateCartDisplay();
                }
            }
        });
        
        // Add change handler for quantity inputs
        document.addEventListener('change', function(event) {
            if (event.target.matches('.item-quantity')) {
                const productId = event.target.dataset.id;
                const newQuantity = parseInt(event.target.value);
                
                if (newQuantity >= 1) {
                    BerryCart.updateQuantity(productId, newQuantity);
                    
                    // Update display if we're on the cart page
                    if (typeof updateCartDisplay === 'function') {
                        updateCartDisplay();
                    }
                } else {
                    // Reset to 1 if invalid quantity
                    event.target.value = 1;
                }
            }
        });
    }
};

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    BerryCart.init();
});

// Make BerryCart globally available
window.BerryCart = BerryCart;
