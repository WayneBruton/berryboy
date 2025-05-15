// FINAL WORKING CART SCRIPT - Fixes all totals issues
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart Working script loaded');

    // Wait for cart to fully initialize
    setTimeout(() => {
        // Initialize delivery option from localStorage if present
        initializeDeliveryOption();
        
        // Attach handlers to all cart buttons
        setupCartControls();
        
        // Do an initial update of the totals
        updateAllTotals();
    }, 1000);
    
    // Set initial delivery option based on localStorage
    function initializeDeliveryOption() {
        const savedOption = localStorage.getItem('deliveryOption');
        console.log('Saved delivery option:', savedOption);
        
        if (savedOption) {
            // Find the matching radio button
            const radioButton = document.querySelector(`input[name="deliveryOption"][value="${savedOption}"]`);
            if (radioButton && !radioButton.disabled) {
                radioButton.checked = true;
                console.log('Restored delivery option:', savedOption);
            }
        }
    }

    // Calculate and update all totals based on what's in the DOM
    function updateAllTotals() {
        console.log('Updating all totals...');
        
        // Calculate subtotal from visible cart rows
        let subtotal = 0;
        const rows = document.querySelectorAll('#cart-table-body tr');
        
        rows.forEach(row => {
            // Get the total cell (4th column, which is index 3)
            const totalCell = row.cells[3];
            if (totalCell) {
                // Parse the total value (remove 'R' and convert to number)
                const itemTotal = parseFloat(totalCell.textContent.replace('R', '')) || 0;
                subtotal += itemTotal;
                console.log(`Row total: ${itemTotal.toFixed(2)}`);
            }
        });
        
        console.log('Total from rows:', subtotal.toFixed(2));
        
        // Update subtotal display
        const subtotalElement = document.getElementById('cart-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
        }
        
        // Get delivery fee based on selected option
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
            
            // Also update hidden total value if it exists
            const totalValueInput = document.getElementById('cart-total-value');
            if (totalValueInput) {
                totalValueInput.value = total.toFixed(2);
            }
        }
        
        // Update delivery options based on subtotal
        updateDeliveryOptions(subtotal);
        
        return { subtotal, deliveryFee, total };
    }
    
    // Update delivery options based on subtotal
    function updateDeliveryOptions(subtotal) {
        const deliveryOption = document.getElementById('deliveryOption');
        const deliveryLabel = document.querySelector('label[for="deliveryOption"]');
        
        if (deliveryOption && deliveryLabel) {
            if (subtotal >= 100) {
                // Enable delivery for orders R100+
                deliveryOption.disabled = false;
                deliveryLabel.classList.remove('text-muted');
            } else {
                // Disable delivery for orders less than R100
                deliveryOption.disabled = true;
                deliveryLabel.classList.add('text-muted');
                
                // Force selection to collection
                const collectionOption = document.getElementById('collectionOption');
                if (collectionOption) {
                    collectionOption.checked = true;
                }
            }
        }
    }

    // Extract price from a row
    function getPriceFromRow(row) {
        const priceCell = row.cells[1]; // Price is in the 2nd column (index 1)
        if (priceCell) {
            return parseFloat(priceCell.textContent.replace('R', '')) || 0;
        }
        return 0;
    }
    
    // Setup all cart control buttons
    function setupCartControls() {
        // Decrease quantity buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            // Remove old handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Get product ID and row
                const productId = this.getAttribute('data-id');
                const row = this.closest('tr');
                const quantityInput = row.querySelector('.item-quantity');
                
                if (quantityInput) {
                    let quantity = parseInt(quantityInput.value);
                    
                    // Only decrease if > 1
                    if (quantity > 1) {
                        quantity--;
                        quantityInput.value = quantity;
                        
                        // Update cart in localStorage
                        updateCartItemQuantity(productId, quantity);
                        
                        // Update row total
                        const price = getPriceFromRow(row);
                        const totalCell = row.cells[3]; // Total is in the 4th column (index 3)
                        if (totalCell) {
                            totalCell.textContent = `R${(price * quantity).toFixed(2)}`;
                        }
                        
                        // Update all totals
                        updateAllTotals();
                    }
                }
            });
        });
        
        // Increase quantity buttons
        document.querySelectorAll('.increase-quantity').forEach(button => {
            // Remove old handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Get product ID and row
                const productId = this.getAttribute('data-id');
                const row = this.closest('tr');
                const quantityInput = row.querySelector('.item-quantity');
                
                if (quantityInput) {
                    let quantity = parseInt(quantityInput.value);
                    quantity++;
                    quantityInput.value = quantity;
                    
                    // Update cart in localStorage
                    updateCartItemQuantity(productId, quantity);
                    
                    // Update row total
                    const price = getPriceFromRow(row);
                    const totalCell = row.cells[3]; // Total is in the 4th column (index 3)
                    if (totalCell) {
                        totalCell.textContent = `R${(price * quantity).toFixed(2)}`;
                    }
                    
                    // Update all totals
                    updateAllTotals();
                }
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            // Remove old handlers
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new handler
            newButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const productId = this.getAttribute('data-id');
                
                // Remove from localStorage
                removeCartItem(productId);
                
                // Remove row from table
                const row = this.closest('tr');
                if (row) {
                    row.remove();
                }
                
                // Update all totals
                updateAllTotals();
                
                // Check if cart is empty
                if (document.querySelectorAll('#cart-table-body tr').length === 0) {
                    // Show empty cart message
                    const emptyCartMessage = document.getElementById('empty-cart-message');
                    const cartItemsContainer = document.getElementById('cart-items-container');
                    
                    if (emptyCartMessage && cartItemsContainer) {
                        emptyCartMessage.style.display = 'block';
                        cartItemsContainer.innerHTML = '';
                    }
                }
            });
        });
        
        // Quantity input direct change
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                let quantity = parseInt(this.value);
                
                // Ensure minimum quantity is 1
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                    this.value = 1;
                }
                
                // Update cart in localStorage
                updateCartItemQuantity(productId, quantity);
                
                // Update row total
                const row = this.closest('tr');
                if (row) {
                    const price = getPriceFromRow(row);
                    const totalCell = row.cells[3]; // Total is in the 4th column (index 3)
                    
                    if (totalCell) {
                        totalCell.textContent = `R${(price * quantity).toFixed(2)}`;
                    }
                }
                
                // Update all totals
                updateAllTotals();
            });
        });
        
        // Delivery option changes - ensure they work in real-time
        document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
            // Remove existing handlers to avoid duplicates
            const newRadio = radio.cloneNode(true);
            radio.parentNode.replaceChild(newRadio, radio);
            
            // Add new click handler that works immediately
            newRadio.addEventListener('click', function(event) {
                console.log('Delivery option clicked:', this.value);
                
                // Save choice to localStorage
                localStorage.setItem('deliveryOption', this.value);
                
                // Update totals to reflect delivery fee
                updateAllTotals();
            });
            
            // Also handle change event (for keyboard navigation)
            newRadio.addEventListener('change', function() {
                console.log('Delivery option changed:', this.value);
                
                // Save choice to localStorage
                localStorage.setItem('deliveryOption', this.value);
                
                // Update totals to reflect delivery fee
                updateAllTotals();
            });
        });
    }
    
    // Update cart item quantity in localStorage
    function updateCartItemQuantity(productId, quantity) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(i => i.id == productId);
        
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update cart count in header
            updateCartCount();
        }
    }
    
    // Remove item from cart in localStorage
    function removeCartItem(productId) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedCart = cart.filter(i => i.id != productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        
        // Update cart count in header
        updateCartCount();
    }
    
    // Update cart count in header
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = 0;
        
        cart.forEach(item => {
            totalItems += parseInt(item.quantity) || 0;
        });
        
        // Update all cart count elements
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }
});
