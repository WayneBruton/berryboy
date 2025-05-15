document.addEventListener('DOMContentLoaded', function() {
    // Get the delivery form
    const deliveryForm = document.getElementById('delivery-info-form');
    
    if (deliveryForm) {
        console.log('Simple delivery form handler initialized');
        
        // Handle form submission
        deliveryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading message
            const feedbackElement = document.getElementById('delivery-info-feedback') || createFeedbackElement();
            feedbackElement.innerHTML = '<div class="alert alert-info">Saving delivery information...</div>';
            
            // Gather form data
            const deliveryInfo = {
                name: document.getElementById('delivery-name').value,
                phone: document.getElementById('delivery-phone').value,
                address: document.getElementById('delivery-address').value,
                suburb: document.getElementById('delivery-suburb').value,
                city: document.getElementById('delivery-city').value,
                postalCode: document.getElementById('delivery-postal-code').value,
                instructions: document.getElementById('delivery-instructions').value || ''
            };
            
            console.log('Sending delivery info to MongoDB:', deliveryInfo);
            
            // Send to MongoDB directly via our simple API
            fetch('/api/save-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryInfo)
            })
            .then(response => response.json())
            .then(data => {
                console.log('API response:', data);
                
                if (data.success) {
                    // Success message
                    feedbackElement.innerHTML = '<div class="alert alert-success">Delivery information saved successfully!</div>';
                } else {
                    // Error message
                    feedbackElement.innerHTML = `<div class="alert alert-danger">Error: ${data.error || 'Unknown error'}</div>`;
                }
            })
            .catch(error => {
                console.error('Error saving delivery info:', error);
                feedbackElement.innerHTML = '<div class="alert alert-danger">Error saving delivery information. Please try again.</div>';
            });
        });
    }
    
    function createFeedbackElement() {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'delivery-info-feedback';
        feedbackDiv.className = 'mt-2';
        
        const buttonParent = document.querySelector('#save-delivery-info-btn').parentNode;
        buttonParent.appendChild(feedbackDiv);
        
        return feedbackDiv;
    }
});
