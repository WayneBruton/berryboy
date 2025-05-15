/**
 * Delivery Information Management
 * Handles displaying, loading, and saving delivery information for logged-in users
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const deliveryOption = document.getElementById('deliveryOption');
    const collectionOption = document.getElementById('collectionOption');
    const deliveryInfoContainer = document.getElementById('delivery-info-container');
    const deliveryInfoForm = document.getElementById('delivery-info-form');
    const feedbackElement = document.getElementById('delivery-info-feedback');
    
    // Only initialize if we're on the cart page with the delivery form
    if (!deliveryOption || !deliveryInfoContainer || !deliveryInfoForm) {
        return;
    }
    
    // Form fields
    const fields = {
        name: document.getElementById('delivery-name'),
        phone: document.getElementById('delivery-phone'),
        address: document.getElementById('delivery-address'),
        suburb: document.getElementById('delivery-suburb'),
        city: document.getElementById('delivery-city'),
        postalCode: document.getElementById('delivery-postal-code'),
        instructions: document.getElementById('delivery-instructions')
    };
    
    // Show/hide delivery info form based on selected option
    function updateDeliveryFormVisibility() {
        console.log('Updating delivery form visibility');
        const isDeliverySelected = deliveryOption.checked;
        const isDeliveryAvailable = !deliveryOption.disabled;
        
        console.log('Delivery selected:', isDeliverySelected);
        console.log('Delivery available:', isDeliveryAvailable);
        
        // Force show delivery form for testing
        if (isDeliverySelected) {
            console.log('Showing delivery form');
            deliveryInfoContainer.style.display = 'block';
            
            // Load saved delivery info if the user is logged in
            loadDeliveryInfo();
        } else {
            console.log('Hiding delivery form');
            deliveryInfoContainer.style.display = 'none';
        }
    }
    
    // Handle delivery option changes
    [deliveryOption, collectionOption].forEach(option => {
        if (option) {
            option.addEventListener('change', updateDeliveryFormVisibility);
        }
    });
    
    // Check initial state
    updateDeliveryFormVisibility();
    
    // Load saved delivery information from both MongoDB and localStorage
    function loadDeliveryInfo() {
        // Always show the form first, regardless of data availability
        if (deliveryInfoContainer) {
            deliveryInfoContainer.style.display = 'block';
            console.log('Showing delivery form');
        }
        
        // Check if user is logged in
        const isLoggedIn = document.querySelector('[data-auth="true"]') !== null;
        if (!isLoggedIn) {
            console.log('User not logged in, skipping delivery info load');
            return;
        }
        
        console.log('Loading saved delivery info...');
        
        // First, try to load from localStorage as a reliable fallback
        try {
            const localDeliveryInfo = localStorage.getItem('userDeliveryInfo');
            if (localDeliveryInfo) {
                const info = JSON.parse(localDeliveryInfo);
                console.log('Found delivery info in localStorage:', info);
                
                // Populate form with localStorage data
                populateDeliveryForm(info);
                console.log('Delivery form populated from localStorage');
            } else {
                console.log('No delivery info found in localStorage');
            }
        } catch (localErr) {
            console.error('Error loading from localStorage:', localErr);
        }
        
        // Use the direct MongoDB endpoint to load delivery info
        fetch('/api/direct-delivery-save')
            .then(response => {
                console.log('Direct MongoDB load response status:', response.status);
                if (response.ok) {
                    return response.json();
                }
                // Don't throw error, just return empty data
                return { success: false };
            })
            .then(data => {
                if (data.success && data.delivery_info) {
                    // Populate form fields with MongoDB data (priority over localStorage)
                    const info = data.delivery_info;
                    console.log('Found delivery info in MongoDB:', info);
                    
                    // Update the form with MongoDB data
                    populateDeliveryForm(info);
                    console.log('Delivery form updated with MongoDB data');
                    
                    // Also update localStorage to keep them in sync
                    try {
                        localStorage.setItem('userDeliveryInfo', JSON.stringify(info));
                        console.log('Updated localStorage with MongoDB data');
                    } catch (syncErr) {
                        console.warn('Could not sync localStorage with MongoDB data:', syncErr);
                    }
                } else {
                    console.log('No existing delivery info found in MongoDB');
                }
            })
            .catch(error => {
                console.warn('Error loading from MongoDB (non-critical):', error);
                console.log('Using localStorage data if available');
            });
    }
    
    // Helper function to populate the delivery form with data
    function populateDeliveryForm(info) {
        if (fields.name) fields.name.value = info.name || '';
        if (fields.phone) fields.phone.value = info.phone || '';
        if (fields.address) fields.address.value = info.address || '';
        if (fields.suburb) fields.suburb.value = info.suburb || '';
        if (fields.city) fields.city.value = info.city || '';
        if (fields.postalCode) fields.postalCode.value = info.postalCode || '';
        if (fields.instructions) fields.instructions.value = info.instructions || '';
    }
    
    // Save delivery information to MongoDB
    deliveryInfoForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Check if user is logged in
        const isLoggedIn = document.querySelector('[data-auth="true"]') !== null;
        console.log('User authentication status:', isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN');
        
        // Also log session data if it exists
        const sessionElement = document.querySelector('#user-session-data');
        if (sessionElement) {
            console.log('Session data found:', sessionElement.dataset);
        } else {
            console.log('No session data element found');
        }
        
        if (!isLoggedIn) {
            console.error('User is not logged in - cannot save delivery info to their profile');
            showFeedback('Please log in to save delivery information', 'danger');
            return;
        }
        
        console.log('User is logged in, proceeding to save delivery info to their MongoDB profile');
        
        // Get form data
        const deliveryInfo = {
            name: fields.name ? fields.name.value : '',
            phone: fields.phone ? fields.phone.value : '',
            address: fields.address ? fields.address.value : '',
            suburb: fields.suburb ? fields.suburb.value : '',
            city: fields.city ? fields.city.value : '',
            postalCode: fields.postalCode ? fields.postalCode.value : '',
            instructions: fields.instructions ? fields.instructions.value : ''
        };
        
        // Validate required fields
        if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address || 
            !deliveryInfo.suburb || !deliveryInfo.city || !deliveryInfo.postalCode) {
            showFeedback('Please fill in all required fields', 'danger');
            return;
        }
        
        // Show saving indicator
        showFeedback('Saving delivery information to MongoDB...', 'info');
        
        // Use the direct MongoDB delivery save endpoint that uses the User model connection
        console.log('Saving delivery info directly to MongoDB...');
        
        // Attempt to save directly to MongoDB
        fetch('/api/direct-delivery-save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deliveryInfo)
        })
        .then(response => {
            console.log('MongoDB direct save response status:', response.status);
            if (response.ok) {
                return response.json();
            } else {
                console.error('MongoDB direct save failed with status:', response.status);
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to save to MongoDB');
                });
            }
        })
        .then(data => {
            if (data.success) {
                console.log('Successfully saved delivery info to MongoDB');
                showFeedback('Delivery information saved successfully to your account', 'success');
                
                // If MongoDB save worked, also save to localStorage as a cache
                try {
                    localStorage.setItem('userDeliveryInfo', JSON.stringify(deliveryInfo));
                    console.log('Delivery info also cached in localStorage');
                } catch (localErr) {
                    console.warn('Could not cache in localStorage:', localErr);
                }
            } else {
                console.error('MongoDB direct save returned error:', data.error);
                showFeedback(data.error || 'Failed to save delivery information', 'danger');
            }
        })
        .catch(error => {
            console.error('Error saving to MongoDB:', error);
            showFeedback('Error saving delivery information: ' + error.message, 'danger');
        });
    });
    
    // Show feedback message
    function showFeedback(message, type) {
        if (!feedbackElement) return;
        
        // Set appropriate Bootstrap alert class
        feedbackElement.className = `alert alert-${type}`;
        feedbackElement.textContent = message;
        
        // Clear success/info messages after 3 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                feedbackElement.textContent = '';
                feedbackElement.className = '';
            }, 3000);
        }
    }
});
