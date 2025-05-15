// Direct cart manipulation with immediate UI updates
// No page reloads required - changes are visible immediately

document.addEventListener('DOMContentLoaded', function() {
    console.log('Berry Cart Direct loaded');
    
    // Function to update cart totals
    function updateCartTotals() {
        // Get all cart items from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Calculate subtotal
        let subtotal = 0;
        console.log('Cart items for total calculation:', cart);
        
        cart.forEach(item => {
            // Check if price is directly on item or in item.product
            const price = item.price || (item.product && item.product.price) || 0;
            subtotal += price * item.quantity;
            console.log(`Item: ${item.name || item.product?.name}, Price: ${price}, Quantity: ${item.quantity}, Subtotal: ${price * item.quantity}`);
        });
        
        // Update subtotal display
        const subtotalElement = document.getElementById('cart-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
        }
        
        // Handle delivery fee
        let deliveryFee = 0;
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
        
        if (deliveryOption && deliveryOption.value === 'delivery') {
            deliveryFee = 40; // R40 delivery fee
        }
        
        // Update delivery fee display
        const deliveryFeeElement = document.getElementById('delivery-fee');
        if (deliveryFeeElement) {
            deliveryFeeElement.textContent = `R${deliveryFee.toFixed(2)}`;
        }
        
        // Calculate and update total
        const total = subtotal + deliveryFee;
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `R${total.toFixed(2)}`;
        }
        
        // Update cart count in header
        updateCartCountDirectly();
        
        return { subtotal, deliveryFee, total };
    }
    
    // Function to update cart count in header
    function updateCartCountDirectly() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = 0;
        
        cart.forEach(item => {
            totalItems += item.quantity;
        });
        
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            
            // Also update mobile cart count if it exists
            const mobileCartCount = document.getElementById('mobile-cart-count');
            if (mobileCartCount) {
                mobileCartCount.textContent = totalItems;
            }
        }
        
        console.log('Updated cart count to:', totalItems);
    }
    
    // Function to update delivery options based on cart total
    function updateDeliveryOptions() {
        const { subtotal } = updateCartTotals();
        
        // Get delivery option elements
        const deliveryOption = document.getElementById('deliveryOption');
        const deliveryLabel = document.querySelector('label[for="deliveryOption"]');
        
        if (deliveryOption && deliveryLabel) {
            // Enable/disable delivery based on subtotal
            if (subtotal >= 100) {
                deliveryOption.disabled = false;
                deliveryLabel.classList.remove('text-muted');
            } else {
                deliveryOption.disabled = true;
                deliveryLabel.classList.add('text-muted');
                
                // Force collection if order is under R100
                const collectionOption = document.getElementById('collectionOption');
                if (collectionOption) {
                    collectionOption.checked = true;
                }
            }
            
            // Update delivery fee display after changing options
            updateCartTotals();
        }
    }
    
    // Direct decrease event handler
    function setupDecreaseButtons() {
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            // Clear existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const productId = this.getAttribute('data-id');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item && item.quantity > 1) {
                    // Update quantity in localStorage
                    item.quantity--;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Update quantity display
                    const quantityInput = document.querySelector(`.item-quantity[data-id="${productId}"]`);
                    if (quantityInput) {
                        quantityInput.value = item.quantity;
                    }
                    
                    // Update item total
                    const row = this.closest('tr');
                    if (row) {
                        const totalCell = row.querySelector('.item-total');
                        if (totalCell) {
                            const newTotal = (item.price * item.quantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update cart totals
                    updateDeliveryOptions();
                }
            });
        });
    }
    
    // Direct increase event handler
    function setupIncreaseButtons() {
        document.querySelectorAll('.increase-quantity').forEach(button => {
            // Clear existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const productId = this.getAttribute('data-id');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item) {
                    // Update quantity in localStorage
                    item.quantity++;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Update quantity display
                    const quantityInput = document.querySelector(`.item-quantity[data-id="${productId}"]`);
                    if (quantityInput) {
                        quantityInput.value = item.quantity;
                    }
                    
                    // Update item total
                    const row = this.closest('tr');
                    if (row) {
                        const totalCell = row.querySelector('.item-total');
                        if (totalCell) {
                            const newTotal = (item.price * item.quantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update cart totals
                    updateDeliveryOptions();
                }
            });
        });
    }
    
    // Direct remove item handler
    function setupRemoveButtons() {
        document.querySelectorAll('.remove-item').forEach(button => {
            // Clear existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const productId = this.getAttribute('data-id');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Remove item from localStorage
                const updatedCart = cart.filter(i => i.id != productId);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                
                // Remove item row from UI
                const row = this.closest('tr');
                if (row) {
                    row.remove();
                }
                
                // Show empty cart message if needed
                if (updatedCart.length === 0) {
                    const emptyCartMessage = document.getElementById('empty-cart-message');
                    const cartItemsContainer = document.getElementById('cart-items-container');
                    
                    if (emptyCartMessage && cartItemsContainer) {
                        emptyCartMessage.style.display = 'block';
                        cartItemsContainer.innerHTML = '';
                    }
                }
                
                // Update cart totals
                updateDeliveryOptions();
            });
        });
    }
    
    // Setup delivery option change handlers
    function setupDeliveryOptions() {
        document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
            radio.addEventListener('change', function() {
                // Save delivery option to localStorage
                localStorage.setItem('deliveryOption', this.value);
                
                // Update cart totals with new delivery option
                updateCartTotals();
            });
        });
    }
    
    // Setup quantity input direct change handler
    function setupQuantityInputs() {
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                let newQuantity = parseInt(this.value);
                
                // Minimum quantity is 1
                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                    this.value = 1;
                }
                
                // Update localStorage
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item) {
                    item.quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Update item total
                    const row = this.closest('tr');
                    if (row) {
                        const totalCell = row.querySelector('.item-total');
                        if (totalCell) {
                            const newTotal = (item.price * newQuantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update cart totals
                    updateDeliveryOptions();
                }
            });
        });
    }
    
    // Initialize all direct handlers
    function initializeDirectHandlers() {
        setupDecreaseButtons();
        setupIncreaseButtons();
        setupRemoveButtons();
        setupDeliveryOptions();
        setupQuantityInputs();
        updateDeliveryOptions();
    }
    
    // Initialize the cart
    initializeDirectHandlers();
    
    // Check for new elements periodically (in case items are added dynamically)
    setInterval(initializeDirectHandlers, 2000);
});
