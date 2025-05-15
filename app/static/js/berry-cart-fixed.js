// Complete cart manipulation with proper totals handling
// Version 2.0 - Fixes all issues with cart totals

document.addEventListener('DOMContentLoaded', function() {
    console.log('Berry Cart Fixed loaded');
    
    // Helper function to get price from an item (handles different item structures)
    function getItemPrice(item) {
        // Try different possible locations of price in the item
        if (typeof item.price === 'number') {
            return item.price;
        } else if (item.product && typeof item.product.price === 'number') {
            return item.product.price;
        } else if (typeof item.price === 'string') {
            return parseFloat(item.price);
        } else if (item.product && typeof item.product.price === 'string') {
            return parseFloat(item.product.price);
        }
        
        // If we can't find the price, check the DOM
        try {
            const row = document.querySelector(`tr[data-product-id="${item.id}"]`);
            if (row) {
                const priceText = row.querySelector('.product-price').textContent.trim();
                return parseFloat(priceText.replace('R', ''));
            }
        } catch (e) {
            console.error('Could not extract price from DOM:', e);
        }
        
        console.warn('Could not determine price for item:', item);
        return 0;
    }
    
    // Function to update cart totals
    function updateCartTotals() {
        console.log('Updating cart totals...');
        
        // Get all cart items from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Cart items for total calculation:', cart);
        
        // Calculate subtotal
        let subtotal = 0;
        cart.forEach(item => {
            const price = getItemPrice(item);
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            console.log(`Item: ${item.name || (item.product && item.product.name) || 'Unknown'}, Price: ${price}, Quantity: ${item.quantity}, Subtotal: ${itemTotal.toFixed(2)}`);
        });
        
        console.log('Total subtotal calculated:', subtotal.toFixed(2));
        
        // Update subtotal display
        const subtotalElement = document.getElementById('cart-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
            console.log('Updated subtotal display:', subtotalElement.textContent);
        } else {
            console.warn('Could not find subtotal element');
        }
        
        // Handle delivery fee
        let deliveryFee = 0;
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
        
        if (deliveryOption && deliveryOption.value === 'delivery') {
            deliveryFee = 40; // R40 delivery fee
        }
        
        console.log('Delivery fee:', deliveryFee);
        
        // Update delivery fee display
        const deliveryFeeElement = document.getElementById('delivery-fee');
        if (deliveryFeeElement) {
            deliveryFeeElement.textContent = `R${deliveryFee.toFixed(2)}`;
            console.log('Updated delivery fee display:', deliveryFeeElement.textContent);
        } else {
            console.warn('Could not find delivery fee element');
        }
        
        // Calculate and update total
        const total = subtotal + deliveryFee;
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `R${total.toFixed(2)}`;
            console.log('Updated total display:', totalElement.textContent);
            
            // Also update hidden total value if it exists
            const totalValueInput = document.getElementById('cart-total-value');
            if (totalValueInput) {
                totalValueInput.value = total.toFixed(2);
            }
        } else {
            console.warn('Could not find total element');
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
            totalItems += parseInt(item.quantity) || 0;
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
        console.log('Checking delivery options based on subtotal:', subtotal);
        
        // Get delivery option elements
        const deliveryOption = document.getElementById('deliveryOption');
        const deliveryLabel = document.querySelector('label[for="deliveryOption"]');
        
        if (deliveryOption && deliveryLabel) {
            // Enable/disable delivery based on subtotal
            if (subtotal >= 100) {
                console.log('Order >= R100, enabling delivery option');
                deliveryOption.disabled = false;
                deliveryLabel.classList.remove('text-muted');
            } else {
                console.log('Order < R100, disabling delivery option');
                deliveryOption.disabled = true;
                deliveryLabel.classList.add('text-muted');
                
                // Force collection if order is under R100
                const collectionOption = document.getElementById('collectionOption');
                if (collectionOption) {
                    collectionOption.checked = true;
                }
            }
        }
    }
    
    // Setup decrease buttons
    function setupDecreaseButtons() {
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            // Remove existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Disable button temporarily to prevent double-clicks
                this.disabled = true;
                
                const productId = this.getAttribute('data-id');
                console.log('Decrease clicked for product ID:', productId);
                
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item && item.quantity > 1) {
                    // Update quantity in localStorage
                    item.quantity = parseInt(item.quantity) - 1;
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
                            const price = getItemPrice(item);
                            const newTotal = (price * item.quantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update all cart totals
                    updateDeliveryOptions();
                    
                    console.log('Decreased quantity, new value:', item.quantity);
                }
                
                // Re-enable button
                setTimeout(() => {
                    this.disabled = false;
                }, 500);
            });
        });
    }
    
    // Setup increase buttons
    function setupIncreaseButtons() {
        document.querySelectorAll('.increase-quantity').forEach(button => {
            // Remove existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Disable button temporarily to prevent double-clicks
                this.disabled = true;
                
                const productId = this.getAttribute('data-id');
                console.log('Increase clicked for product ID:', productId);
                
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const item = cart.find(i => i.id == productId);
                
                if (item) {
                    // Update quantity in localStorage
                    item.quantity = parseInt(item.quantity) + 1;
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
                            const price = getItemPrice(item);
                            const newTotal = (price * item.quantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update all cart totals
                    updateDeliveryOptions();
                    
                    console.log('Increased quantity, new value:', item.quantity);
                }
                
                // Re-enable button
                setTimeout(() => {
                    this.disabled = false;
                }, 500);
            });
        });
    }
    
    // Setup remove buttons
    function setupRemoveButtons() {
        document.querySelectorAll('.remove-item').forEach(button => {
            // Remove existing handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Disable button
                this.disabled = true;
                
                const productId = this.getAttribute('data-id');
                console.log('Remove clicked for product ID:', productId);
                
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const updatedCart = cart.filter(i => i.id != productId);
                
                // Save to localStorage
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                
                // Remove row from UI
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
                
                // Update all cart totals
                updateCartTotals();
                updateDeliveryOptions();
                
                console.log('Item removed, remaining items:', updatedCart.length);
            });
        });
    }
    
    // Setup delivery option change handlers
    function setupDeliveryOptions() {
        document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
            radio.addEventListener('change', function() {
                console.log('Delivery option changed to:', this.value);
                
                // Save delivery option to localStorage
                localStorage.setItem('deliveryOption', this.value);
                
                // Update cart totals with new delivery option
                updateCartTotals();
            });
        });
    }
    
    // Setup direct quantity input changes
    function setupQuantityInputs() {
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                let newQuantity = parseInt(this.value);
                
                console.log('Quantity input changed for product ID:', productId);
                
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
                            const price = getItemPrice(item);
                            const newTotal = (price * newQuantity).toFixed(2);
                            totalCell.textContent = `R${newTotal}`;
                        }
                    }
                    
                    // Update cart totals
                    updateDeliveryOptions();
                    
                    console.log('Manual quantity update, new value:', newQuantity);
                }
            });
        });
    }
    
    // Initialize everything
    function initializeCart() {
        console.log('Initializing cart handlers...');
        
        // Set up all event handlers
        setupDecreaseButtons();
        setupIncreaseButtons();
        setupRemoveButtons();
        setupDeliveryOptions();
        setupQuantityInputs();
        
        // Initial update of delivery options and totals
        updateDeliveryOptions();
        
        console.log('Cart initialization complete');
    }
    
    // Start it all
    initializeCart();
    
    // Make sure the cart updates if any items are added dynamically
    setInterval(function() {
        // Only update when content changes
        const cartRows = document.querySelectorAll('tr[data-product-id]').length;
        if (window.lastCartRows !== cartRows) {
            window.lastCartRows = cartRows;
            initializeCart();
        }
    }, 2000); // Check every 2 seconds
});
