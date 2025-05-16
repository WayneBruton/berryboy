/**
 * Direct Delivery Info Loader
 * Simple standalone script to load delivery info directly from MongoDB
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct Delivery Loader: Initializing');
    
    // Add a manual load button to the page
    const deliveryForm = document.getElementById('delivery-info-form');
    if (deliveryForm) {
        console.log('Direct Delivery Loader: Found delivery form');
        
        // Create the load button
        const loadButton = document.createElement('button');
        loadButton.type = 'button';
        loadButton.className = 'btn btn-info mt-2 mb-2';
        loadButton.innerHTML = '<i class="fas fa-sync-alt me-2"></i> Load Saved Delivery Info';
        loadButton.id = 'direct-load-delivery-btn';
        
        // Create a feedback element
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'direct-delivery-feedback';
        feedbackDiv.className = 'mt-2';
        
        // Insert the button at the top of the form
        deliveryForm.insertBefore(loadButton, deliveryForm.firstChild);
        deliveryForm.insertBefore(feedbackDiv, deliveryForm.firstChild);
        
        console.log('Direct Delivery Loader: Added load button to form');
        
        // Add click handler to the button
        loadButton.addEventListener('click', function() {
            console.log('Direct Delivery Loader: Load button clicked');
            loadDeliveryInfo();
        });
        
        // Function to load delivery info
        function loadDeliveryInfo() {
            console.log('Direct Delivery Loader: Loading delivery info');
            
            // Show loading message
            feedbackDiv.innerHTML = '<div class="alert alert-info">Loading saved delivery information...</div>';
            
            // Fetch delivery info from API
            fetch('/api/direct-delivery-save')
                .then(response => {
                    console.log('Direct Delivery Loader: API response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Direct Delivery Loader: API response:', data);
                    
                    if (data.success && data.delivery_info) {
                        const info = data.delivery_info;
                        console.log('Direct Delivery Loader: Found delivery info:', info);
                        
                        // Get form fields
                        const nameField = document.getElementById('delivery-name');
                        const phoneField = document.getElementById('delivery-phone');
                        const addressField = document.getElementById('delivery-address');
                        const suburbField = document.getElementById('delivery-suburb');
                        const cityField = document.getElementById('delivery-city');
                        const postalCodeField = document.getElementById('delivery-postal-code');
                        const instructionsField = document.getElementById('delivery-instructions');
                        
                        // Log field elements
                        console.log('Direct Delivery Loader: Form fields:', {
                            name: nameField,
                            phone: phoneField,
                            address: addressField,
                            suburb: suburbField,
                            city: cityField,
                            postalCode: postalCodeField,
                            instructions: instructionsField
                        });
                        
                        // If info is empty (no keys), only clear fields if they are all empty
                        if (Object.keys(info).length === 0) {
                            const allEmpty = [nameField, phoneField, addressField, suburbField, cityField, postalCodeField, instructionsField].every(f => !f || f.value.trim() === '');
                            if (allEmpty) {
                                if (nameField) nameField.value = '';
                                if (phoneField) phoneField.value = '';
                                if (addressField) addressField.value = '';
                                if (suburbField) suburbField.value = '';
                                if (cityField) cityField.value = '';
                                if (postalCodeField) postalCodeField.value = '';
                                if (instructionsField) instructionsField.value = '';
                                feedbackDiv.innerHTML = '<div class="alert alert-warning">No saved delivery information found.</div>';
                                setTimeout(function() { feedbackDiv.innerHTML = ''; }, 3000);
                                console.log('Direct Delivery Loader: Cleared all delivery form fields (no info found)');
                            } else {
                                console.log('Direct Delivery Loader: Fields already have values, not clearing');
                            }
                            return;
                        }
                        
                        // Populate fields if they exist
                        if (nameField) {
                            console.log('Direct Delivery Loader: Setting name field to:', info.name);
                            nameField.value = info.name || '';
                        }
                        
                        if (phoneField) {
                            console.log('Direct Delivery Loader: Setting phone field to:', info.phone);
                            phoneField.value = info.phone || '';
                        }
                        
                        if (addressField) {
                            console.log('Direct Delivery Loader: Setting address field to:', info.address);
                            addressField.value = info.address || '';
                        }
                        
                        if (suburbField) {
                            console.log('Direct Delivery Loader: Setting suburb field to:', info.suburb);
                            suburbField.value = info.suburb || '';
                        }
                        
                        if (cityField) {
                            console.log('Direct Delivery Loader: Setting city field to:', info.city);
                            cityField.value = info.city || '';
                        }
                        
                        if (postalCodeField) {
                            console.log('Direct Delivery Loader: Setting postal code field to:', info.postalCode);
                            postalCodeField.value = info.postalCode || '';
                        }
                        
                        if (instructionsField) {
                            console.log('Direct Delivery Loader: Setting instructions field to:', info.instructions);
                            instructionsField.value = info.instructions || '';
                        }
                        
                        // Show success message
                        feedbackDiv.innerHTML = '<div class="alert alert-success">Delivery information loaded successfully!</div>';
                        
                        // Clear feedback after 3 seconds
                        setTimeout(function() {
                            feedbackDiv.innerHTML = '';
                        }, 3000);
                        
                        console.log('Direct Delivery Loader: Form population complete');
                    } else {
                        console.log('Direct Delivery Loader: No delivery info found in response');
                        feedbackDiv.innerHTML = '<div class="alert alert-warning">No saved delivery information found.</div>';
                    }
                })
                .catch(error => {
                    console.error('Direct Delivery Loader: Error loading delivery info:', error);
                    feedbackDiv.innerHTML = '<div class="alert alert-danger">Error loading delivery information. Please try again.</div>';
                });
        }
    } else {
        console.log('Direct Delivery Loader: Delivery form not found');
    }
});
