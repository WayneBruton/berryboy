// Simple script to show the delivery form when delivery option is selected
document.addEventListener('DOMContentLoaded', function() {
    console.log('Show delivery form script loaded');
    
    // Get delivery option elements
    const deliveryOption = document.getElementById('deliveryOption');
    const collectionOption = document.getElementById('collectionOption');
    const deliveryInfoContainer = document.getElementById('delivery-info-container');
    
    // Check if we're on the right page
    if (deliveryOption && deliveryInfoContainer) {
        console.log('Delivery form elements found');
        
        // Direct event handlers
        deliveryOption.addEventListener('click', function() {
            console.log('Delivery option clicked');
            deliveryInfoContainer.style.display = 'block';
        });
        
        collectionOption.addEventListener('click', function() {
            console.log('Collection option clicked');
            deliveryInfoContainer.style.display = 'none';
        });
        
        // Check initial state
        if (deliveryOption.checked) {
            console.log('Delivery initially selected');
            deliveryInfoContainer.style.display = 'block';
        } else {
            console.log('Collection initially selected');
            deliveryInfoContainer.style.display = 'none';
        }
    } else {
        console.log('Delivery form elements not found');
    }
});
