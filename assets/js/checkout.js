// Retrieve cart data from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const userContactNumber = JSON.parse(localStorage.getItem('user_number')) || '';
// console.log(userContactNumber);
// console.log(cart);

const DELIVERY_CHARGE = 25.00; // As per your HTML
const DISCOUNT = 20.00; // As per your HTML

// console.log(cart);

// Display order summary
function displayOrderSummary() {
    const cartItemsContainer = document.querySelector('.card-body .d-flex.mb-2').parentElement;
    const subtotalSpan = document.querySelector('.d-flex.justify-content-between.small.mb-2 span:last-child');
    const shippingSpan = document.getElementById('shippingCharge');
    const discountSpan = document.getElementById('discountAmount');
    const totalSpan = document.getElementById('finalTotal');

    // Clear existing product items (but keep the structure)
    const existingItems = cartItemsContainer.querySelectorAll('.d-flex.justify-content-between.align-items-center.mb-2');
    existingItems.forEach(item => item.remove());

    if (cart.length === 0) {
        cartItemsContainer.insertAdjacentHTML('afterbegin', `
            <div class="text-center py-3">
                <h6>Your cart is empty</h6>
                <a href="listingpage.html" class="btn btn-outline-secondary mt-2">Continue Shopping</a>
            </div>`);
        subtotalSpan.textContent = '₹0.00';
        shippingSpan.textContent = '₹0.00';
        discountSpan.textContent = '- ₹0.00';
        totalSpan.textContent = '₹0.00';
        document.querySelector('.paymnet-submit').disabled = true; // Disable Proceed to Payment
        return;
    }

    let subtotal = 0;
    // console.log(cart);
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartItemsContainer.insertAdjacentHTML('afterbegin', `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                    <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${item.productImg}" alt="${item.name}" width="50" class="rounded me-2">
                    <div>
                        <div class="small fw-bold">${item.name}</div>
                        <div class="d-flex justify-content-between">
                            <div class="small text-muted">Qty: ${item.quantity}</div>
                            <div class="fw-bold">₹${itemTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>`);
    });

    subtotalSpan.textContent = `₹${subtotal.toFixed(2)}`;
    shippingSpan.textContent = `₹${DELIVERY_CHARGE.toFixed(2)}`;
    discountSpan.textContent = `- ₹${DISCOUNT.toFixed(2)}`;
    totalSpan.textContent = `₹${(subtotal + DELIVERY_CHARGE - DISCOUNT).toFixed(2)}`;
}

document.getElementById('proceedToPayment')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
        const shippingDetails = {
            fullName: document.getElementById('fullName').value.trim(),
            phoneNumber: phoneInput,
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            pinCode: document.getElementById('pinCode').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            saveAddress: document.getElementById('saveAddress').checked
        };    
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const orderData = {
            cart,
            shippingDetails,
            paymentMethod,
            subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            shipping: DELIVERY_CHARGE,
            discount: DISCOUNT,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + DELIVERY_CHARGE - DISCOUNT
        };

    try {
        if (paymentMethod === 'cod') {
            // Submit order for COD
            const response = await fetch('http://localhost/Projects/panel.oceanonlinemart.com/ajax/create_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (result.status === 'success') {
                localStorage.removeItem('cart');
                localStorage.removeItem('deliveryCharge');
                window.location.href = 'thankyou.html';
            } else {
                alert('Error processing order: ' + result.message);
            }
        } else {
            // Razorpay payment (UPI or Card)
            const response = await fetch('http://localhost/Projects/panel.oceanonlinemart.com/ajax/create_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (result.status !== 'success' || !result.order_id) {
                alert('Error creating order: ' + result.message);
                return;
            }

            const options = {
                key: 'rzp_test_TXTvjbW0djSCaJ', // Replace with your Razorpay Key ID
                amount: orderData.total * 100, // Amount in paise
                currency: 'INR',
                name: 'Ocean Online Mart',
                description: 'Order Payment',
                image: 'assets/img/logo.png', // Replace with your logo
                order_id: result.order_id, // Razorpay order ID from server
                handler: async function (response) {
                    // Verify payment on server
                    const verifyResponse = await fetch('http://localhost/Projects/panel.oceanonlinemart.com/ajax/verify_payment.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData
                        })
                    });
                    const verifyResult = await verifyResponse.json();
                    if (verifyResult.status === 'success') {
                        localStorage.removeItem('cart');
                        localStorage.removeItem('deliveryCharge');
                        window.location.href = 'thankyou.html';
                    } else {
                        alert('Payment verification failed: ' + verifyResult.message);
                    }
                },
                prefill: {
                    name: shippingDetails.fullName,
                    contact: shippingDetails.phoneNumber,
                    email: 'customer@example.com' // You may want to add an email field to the form
                },
                theme: {
                    color: '#28a745' // Match your brand color (Bootstrap success green)
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function (response) {
                alert('Payment failed: ' + response.error.description);
            });
        }
    } catch (error) {
        console.error('Error processing order:', error);
        alert('An error occurred while processing your order. Please try again.');
    }
});

// Initialize order summary on page load
window.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
     const phoneInput = document.getElementById('phoneNumber');
        if (userContactNumber) {
            phoneInput.value = userContactNumber;
        }
        phoneInput.addEventListener('input', function() {

            localStorage.setItem('phoneNumber', phoneInput.value);
        });
});