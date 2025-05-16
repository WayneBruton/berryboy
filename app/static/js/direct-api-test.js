/**
 * Direct API Test
 * Simple script to test the delivery info API and form population
 */
console.log('DIRECT API TEST: Script loaded');

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DIRECT API TEST: DOM loaded');
    
    // Check if user is authenticated
    const isAuthenticated = document.querySelector('[data-auth="true"]') !== null;
    console.log('DIRECT API TEST: User authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
        console.log('DIRECT API TEST: User not authenticated, skipping delivery info load');
        return;
    }
    
    // Wait a bit to ensure everything is loaded
    setTimeout(function() {
        console.log('DIRECT API TEST: Testing delivery info API');
        
        // Make direct API call
        fetch('/api/direct-delivery-save')
            .then(response => {
                console.log('DIRECT API TEST: API response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('DIRECT API TEST: API response data:', data);
                
                if (data.success && data.delivery_info) {
                    const info = data.delivery_info;
                    console.log('DIRECT API TEST: Found delivery info:', info);
                    
                    // Get form fields
                    const fields = {
                        name: document.getElementById('delivery-name'),
                        phone: document.getElementById('delivery-phone'),
                        address: document.getElementById('delivery-address'),
                        suburb: document.getElementById('delivery-suburb'),
                        city: document.getElementById('delivery-city'),
                        postalCode: document.getElementById('delivery-postal-code'),
                        instructions: document.getElementById('delivery-instructions')
                    };
                    
                    console.log('DIRECT API TEST: Form fields:', fields);
                    
                    // Try to populate fields
                    for (const [key, element] of Object.entries(fields)) {
                        if (element && info[key]) {
                            try {
                                console.log(`DIRECT API TEST: Setting ${key} to "${info[key]}"`);
                                element.value = info[key];
                                console.log(`DIRECT API TEST: ${key} set successfully`);
                            } catch (error) {
                                console.error(`DIRECT API TEST: Error setting ${key}:`, error);
                            }
                        } else if (!element) {
                            console.warn(`DIRECT API TEST: Field ${key} not found`);
                        } else {
                            console.log(`DIRECT API TEST: No data for ${key}`);
                        }
                    }
                    
                    console.log('DIRECT API TEST: Form population complete');
                } else {
                    console.log('DIRECT API TEST: No delivery info found in API response');
                }
            })
            .catch(error => {
                console.error('DIRECT API TEST: Error:', error);
            });
    }, 1000); // Wait 1 second after DOM load
});
