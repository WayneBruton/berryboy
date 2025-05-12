// Function to ensure consistent cart counts across the site
function fixCartCounting() {
    // Get all cart elements
    const cartCountElements = document.querySelectorAll('.cart-count');
    if (!cartCountElements.length) return 0;
    
    // Get cart items
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate correct count - force integer parsing
    const correctCount = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = correctCount;
    });
    
    return correctCount;
}

// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        // Call the improved counting method
        fixCartCounting();
    }
    
    setupLiveUpdates() {
        // Listen for storage events (updates from other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'cart') {
                this.items = JSON.parse(event.newValue) || [];
                this.updateCartCount();
            }
        });
        
        // Update cart on page visibility change (when user returns to tab)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshCartFromServer();
            }
        });
        
        // Set up periodic refresh (every 30 seconds)
        setInterval(() => this.refreshCartFromServer(), 30000);
    }
    
    refreshCartFromServer() {
        // Fetch the latest cart data from the server
        fetch('/api/cart/get')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch cart data');
                }
                return response.json();
            })
            .then(data => {
                // Only update if there's a difference
                const serverCart = JSON.stringify(data.items || []);
                const localCart = JSON.stringify(this.items);
                
                if (serverCart !== localCart) {
                    this.items = data.items || [];
                    this.saveCart();
                    this.updateCartCount();
                }
            })
            .catch(error => {
                console.error('Error refreshing cart:', error);
            });
    }

    addItem(productId, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: productId,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!');
    }

    removeItem(productId) {
        // First call server-side removal endpoint
        fetch('/api/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error removing product from cart');
                });
            }
            return response.json();
        })
        .then(data => {
            // Update local cart on success
            this.items = this.items.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount(data.cart_count);
        })
        .catch(error => {
            console.error('Error removing item:', error);
            // Update local cart anyway to keep UI responsive
            this.items = this.items.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount();
        });
    }

    updateQuantity(productId, quantity) {
        // Update on server first
        fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                product_id: productId, 
                quantity: quantity,
                is_update: true  // Flag to indicate this is an update, not an add
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error updating cart quantity');
                });
            }
            return response.json();
        })
        .then(data => {
            // Update local cart on success
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount(data.cart_count);
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            // Update local cart anyway to keep UI responsive
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
            }
        });
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        // Use the improved fixCartCounting function instead
        return fixCartCounting();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1050';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Function to ensure consistent cart counts
function fixCartCounting() {
    // Get all cart elements
    const cartCountElements = document.querySelectorAll('.cart-count');
    if (!cartCountElements.length) return;
    
    // Get cart items
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calculate correct count - force integer parsing
    const correctCount = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    
    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = correctCount;
    });
}

// Initialize cart
const cart = new Cart();

// Fix cart counting after a short delay (let everything else initialize first)
setTimeout(fixCartCounting, 100);

// Also add an event listener to fix counting when cart data changes
window.addEventListener('storage', function(event) {
    if (event.key === 'cart') {
        fixCartCounting();
    }
});

// Global function to add product to cart (used by onclick attributes)
function addToCart(productId, quantity = 1) {
    // First check with the server if the product is available
    fetch(`/api/cart/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId, quantity: quantity })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Error adding product to cart');
            });
        }
        return response.json();
    })
    .then(data => {
        // If successful, add to local cart
        cart.addItem(productId, quantity);
    })
    .catch(error => {
        alert(error.message);
    });
}

// Add to cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            cart.addItem(productId);
        });
    });

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Add newsletter subscription logic here
            alert('Thank you for subscribing!');
            this.reset();
        });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Skip processing if href is just '#' or empty
            if (!href || href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation classes on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('fade-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.navbar-toggler');
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        document.querySelector('.navbar-collapse').classList.toggle('show');
    });
}

// Product image zoom effect
document.querySelectorAll('.product-card img').forEach(img => {
    img.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.1)';
        this.style.transition = 'transform 0.3s ease';
    });

    img.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
});
