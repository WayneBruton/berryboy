/**
 * Simple Delivery Info Loader
 * Standalone script to load delivery info from MongoDB and populate the form
 */
(function() {
    console.log('Delivery Loader: Script initialized');
    
    // Run when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Delivery Loader: DOM loaded');
        
        // Get form elements directly
        const deliveryOption = document.getElementById('deliveryOption');
        const formFields = {
            name: document.getElementById('delivery-name'),
            phone: document.getElementById('delivery-phone'),
            address: document.getElementById('delivery-address'),
            suburb: document.getElementById('delivery-suburb'),
            city: document.getElementById('delivery-city'),
            postalCode: document.getElementById('delivery-postal-code'),
            instructions: document.getElementById('delivery-instructions')
        };
        
        // Check if we're on the right page
        if (!deliveryOption) {
            console.log('Delivery Loader: Not on cart page, exiting');
            return;
        }
        
        console.log('Delivery Loader: Found delivery option element');
        
        // Log form field elements
        console.log('Delivery Loader: Form fields:', formFields);
        
        // Function to load and populate delivery info
        function loadDeliveryInfo() {
            console.log('Delivery Loader: Loading delivery info...');
            
            // Fetch from API
            fetch('/api/direct-delivery-save')
                .then(response => {
                    console.log('Delivery Loader: API response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Delivery Loader: API response data:', data);
                    
                    if (data.success && data.delivery_info) {
                        const info = data.delivery_info;
                        console.log('Delivery Loader: Found delivery info:', info);
                        
                        // Populate form fields
                        populateForm(info);
                    } else {
                        console.log('Delivery Loader: No delivery info found or API error');
                    }
                })
                .catch(error => {
                    console.error('Delivery Loader: API error:', error);
                });
        }
        
        // Function to populate form fields
        function populateForm(info) {
            console.log('Delivery Loader: Populating form with data');
            
            // Populate each field if it exists
            Object.keys(formFields).forEach(field => {
                if (formFields[field] && info[field]) {
                    console.log(`Delivery Loader: Setting ${field} to "${info[field]}"`);
                    formFields[field].value = info[field];
                } else if (!formFields[field]) {
                    console.warn(`Delivery Loader: Form field ${field} not found`);
                } else {
                    console.log(`Delivery Loader: No data for ${field}`);
                }
            });
            
            console.log('Delivery Loader: Form population complete');
        }
        
        // Add click handler for delivery option
        deliveryOption.addEventListener('click', function() {
            console.log('Delivery Loader: Delivery option clicked');
            if (this.checked) {
                loadDeliveryInfo();
            }
        });
        
        // Check initial state
        if (deliveryOption.checked) {
            console.log('Delivery Loader: Delivery initially selected, loading info');
            loadDeliveryInfo();
        }
        
        // Also add a manual trigger function to the window object
        window.loadDeliveryInfo = loadDeliveryInfo;
        console.log('Delivery Loader: Added global loadDeliveryInfo function');
    });
})();
