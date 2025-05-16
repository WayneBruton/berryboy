/**
 * Test Delivery Loader
 * Direct test script to diagnose delivery info loading issues
 */
console.log('TEST LOADER: Script loaded');

// Execute immediately
(function() {
    // Add a test button to the page body
    const testButton = document.createElement('button');
    testButton.textContent = 'TEST DELIVERY LOAD';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.backgroundColor = 'red';
    testButton.style.color = 'white';
    testButton.style.padding = '10px';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.cursor = 'pointer';
    
    // Add the button to the page
    document.body.appendChild(testButton);
    
    console.log('TEST LOADER: Test button added to page');
    
    // Add click handler
    testButton.addEventListener('click', function() {
        console.log('TEST LOADER: Test button clicked');
        
        // Create a test results container
        let resultsDiv = document.getElementById('test-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'test-results';
            resultsDiv.style.position = 'fixed';
            resultsDiv.style.top = '50px';
            resultsDiv.style.right = '10px';
            resultsDiv.style.width = '300px';
            resultsDiv.style.backgroundColor = 'white';
            resultsDiv.style.border = '1px solid black';
            resultsDiv.style.padding = '10px';
            resultsDiv.style.zIndex = '9999';
            resultsDiv.style.maxHeight = '80vh';
            resultsDiv.style.overflow = 'auto';
            document.body.appendChild(resultsDiv);
        }
        
        resultsDiv.innerHTML = '<h3>Testing Delivery Info Loading</h3><p>Fetching data...</p>';
        
        // Test the API
        console.log('TEST LOADER: Fetching from API');
        fetch('/api/direct-delivery-save')
            .then(response => {
                console.log('TEST LOADER: API response status:', response.status);
                resultsDiv.innerHTML += `<p>API Status: ${response.status}</p>`;
                return response.json();
            })
            .then(data => {
                console.log('TEST LOADER: API response data:', data);
                resultsDiv.innerHTML += `<p>API Response: ${JSON.stringify(data)}</p>`;
                
                if (data.success && data.delivery_info) {
                    const info = data.delivery_info;
                    console.log('TEST LOADER: Found delivery info:', info);
                    resultsDiv.innerHTML += `<p>Delivery Info Found: ${JSON.stringify(info)}</p>`;
                    
                    // Check form fields
                    const fields = {
                        name: document.getElementById('delivery-name'),
                        phone: document.getElementById('delivery-phone'),
                        address: document.getElementById('delivery-address'),
                        suburb: document.getElementById('delivery-suburb'),
                        city: document.getElementById('delivery-city'),
                        postalCode: document.getElementById('delivery-postal-code'),
                        instructions: document.getElementById('delivery-instructions')
                    };
                    
                    // Log field elements
                    console.log('TEST LOADER: Form fields:', fields);
                    resultsDiv.innerHTML += '<h4>Form Fields:</h4><ul>';
                    
                    for (const [key, element] of Object.entries(fields)) {
                        const status = element ? 'Found' : 'Missing';
                        console.log(`TEST LOADER: Field ${key}: ${status}`);
                        resultsDiv.innerHTML += `<li>${key}: ${status}</li>`;
                    }
                    
                    resultsDiv.innerHTML += '</ul>';
                    
                    // Try to populate fields
                    resultsDiv.innerHTML += '<h4>Attempting to populate fields:</h4><ul>';
                    
                    for (const [key, element] of Object.entries(fields)) {
                        if (element && info[key]) {
                            try {
                                console.log(`TEST LOADER: Setting ${key} to "${info[key]}"`);
                                element.value = info[key];
                                resultsDiv.innerHTML += `<li>${key}: Set to "${info[key]}"</li>`;
                            } catch (error) {
                                console.error(`TEST LOADER: Error setting ${key}:`, error);
                                resultsDiv.innerHTML += `<li>${key}: ERROR - ${error.message}</li>`;
                            }
                        } else if (!element) {
                            resultsDiv.innerHTML += `<li>${key}: Cannot set (element missing)</li>`;
                        } else {
                            resultsDiv.innerHTML += `<li>${key}: No data to set</li>`;
                        }
                    }
                    
                    resultsDiv.innerHTML += '</ul><p>Test complete</p>';
                } else {
                    console.log('TEST LOADER: No delivery info found');
                    resultsDiv.innerHTML += '<p>No delivery info found in API response</p>';
                }
            })
            .catch(error => {
                console.error('TEST LOADER: Error:', error);
                resultsDiv.innerHTML += `<p>Error: ${error.message}</p>`;
            });
    });
})();
