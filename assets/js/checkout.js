// Retrieve cart data from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const userContactMail = JSON.parse(localStorage.getItem('user_mail')) || '';
const cartTotalCount = JSON.parse(localStorage.getItem('updatedCount')) || '';
const DELIVERY_CHARGE = 25.00;
const DISCOUNT = 20.00;

const form = document.getElementById('checkoutForm');
const proceedButton = document.getElementById('proceedToPayment');

const inputs = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phoneNumber: document.getElementById('phoneNumber'),
    Near: document.getElementById('Near'),
    address: document.getElementById('address'),
    state: document.getElementById('state'),
    pinCode: document.getElementById('pinCode'),
    payment: document.querySelectorAll('input[name="payment"]')
};

const errorMessages = {
    fullName: document.getElementById('fullNameError'),
    email: document.getElementById('emailError'),
    phoneNumber: document.getElementById('phoneNumberError'),
    Near: document.getElementById('nearerror'),
    address: document.getElementById('addressError'),
    state: document.getElementById('stateError'),
    pinCode: document.getElementById('pinCodeError'),
    payment: document.getElementById('paymentError')
};

const touched = {
    fullName: false,
    email: false,
    phoneNumber: false,
    Near: false,
    address: false,
    state: false,
    pinCode: false,
    payment: false
};

const validators = {
    fullName: /^[a-zA-Z\s-]{2,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneNumber: /^\d{10}$/,
    Near: /^.{5,}$/,
    address: /^.{5,}$/,
    state: /^[a-zA-Z\s]{2,}$/,
    pinCode: /^\d{6}$/,
    payment: () => document.querySelector('input[name="payment"]:checked') !== null
};

// Display order summary
function displayOrderSummary() {
    const cartItemsContainer = document.querySelector('.card-body .d-flex.mb-2').parentElement;
    const subtotalSpan = document.querySelector('.d-flex.justify-content-between.small.mb-2 span:last-child');
    const shippingSpan = document.getElementById('shippingCharge');
    const discountSpan = document.getElementById('discountAmount');
    const totalSpan = document.getElementById('finalTotal');

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
        document.querySelector('.paymnet-submit').disabled = true;
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        cartItemsContainer.insertAdjacentHTML('afterbegin', `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                    <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${item.productImg}" alt="${item.name}" width="50" class="rounded me-2">
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

function validateField(fieldName, value, showError = touched[fieldName]) {
    let isValid = false;
    if (fieldName === 'payment') {
        isValid = validators[fieldName]();
    } else {
        isValid = validators[fieldName].test(value.trim());
    }
    const input = fieldName === 'payment' ? inputs[fieldName][0].parentElement : inputs[fieldName];
    const error = errorMessages[fieldName];
    if (!isValid && showError) {
        input.classList.add('is-invalid');
        error.style.display = 'block';
    } else {
        input.classList.remove('is-invalid');
        error.style.display = 'none';
    }
    return isValid;
}

function validateForm() {
    const isValid = Object.keys(inputs).every(fieldName => {
        if (fieldName === 'payment') {
            return validateField('payment', null, false);
        }
        return validateField(fieldName, inputs[fieldName].value, false);
    });
    return isValid;
}

if (userContactMail) {
    inputs.email.value = userContactMail;
    touched.email = true;
    validateField('email', userContactMail);
}

function loadSavedAddress() {
    const savedAddress = JSON.parse(localStorage.getItem('savedAddress')) || null;
    if (savedAddress) {
        inputs.fullName.value = savedAddress.fullName || '';
        inputs.email.value = savedAddress.email || userEmail || '';
        inputs.phoneNumber.value = savedAddress.phoneNumber || '';
        inputs.Near.value = savedAddress.Near || '';
        inputs.address.value = savedAddress.address || '';
        inputs.state.value = savedAddress.state || '';
        inputs.pinCode.value = savedAddress.pinCode || '';
        document.getElementById('notes').value = savedAddress.notes || '';
        document.getElementById('saveAddress').checked = savedAddress.saveAddress || false;

        // Mark fields as touched and validate
        ['fullName', 'email', 'phoneNumber', 'Near', 'address', 'state', 'pinCode'].forEach(fieldName => {
            if (inputs[fieldName].value) {
                touched[fieldName] = true;
                validateField(fieldName, inputs[fieldName].value);
            }
        });
    } else if (userEmail) {
        inputs.email.value = userEmail;
        touched.email = true;
        validateField('email', userEmail);
    }
}

['fullName', 'email', 'phoneNumber', 'Near', 'address', 'state', 'pinCode'].forEach(fieldName => {
    inputs[fieldName].addEventListener('input', () => {
        touched[fieldName] = true;
        validateField(fieldName, inputs[fieldName].value);
        validateForm();
    });
});

inputs.payment.forEach(radio => {
    radio.addEventListener('change', () => {
        touched.payment = true;
        validateField('payment');
        validateForm();
    });
});

proceedButton.addEventListener('click', async (e) => {
    e.preventDefault();

    Object.keys(touched).forEach(field => touched[field] = true);
    const isValid = Object.keys(inputs).every(fieldName => {
        if (fieldName === 'payment') {
            return validateField('payment', null, true);
        }
        return validateField(fieldName, inputs[fieldName].value, true);
    });

    if (!form.checkValidity() || !isValid) {
        form.classList.add('was-validated');
        form.reportValidity();
        return;
    }

    const shippingDetails = {
        fullName: inputs.fullName.value.trim(),
        email: inputs.email.value.trim(),
        phoneNumber: inputs.phoneNumber.value.trim(),
        Near: inputs.Near.value.trim(),
        address: inputs.address.value.trim(),
        state: inputs.state.value.trim(),
        pinCode: inputs.pinCode.value.trim(),
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
    // console.log(orderData);
    
    try {
        if (paymentMethod === 'cod') {
            const response = await fetch(`${config.API_BASE_URL}/create_order.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            // console.log(result);
            
            if (result.status) {
                localStorage.setItem('user_phone', orderData.shippingDetails.phoneNumber);
                localStorage.removeItem('cart');
                localStorage.removeItem('deliveryCharge');
                localStorage.removeItem('updatedCount');
                window.location.href = 'success-order.html';
            } else {
                alert('Error processing order: ' + result.message);
            }
        } else {
            const response = await fetch(`${config.API_BASE_URL}/create_order.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (!result.status) {
                alert('Error creating order: ' + result.message);
                return;
            }

            const options = {
                key: 'rzp_test_HxdZAvLisBCGfP',
                amount: orderData.total * 100,
                currency: 'INR',
                name: 'Ocean Online Mart',
                description: 'Order Payment',
                image: 'assets/img/logo/logo-1.png',
                order_id: result.order_id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await fetch(`${config.API_BASE_URL}/verify_payment.php`, {
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

                        if (verifyResult.status) {
                            localStorage.setItem('user_phone', orderData.shippingDetails.phoneNumber);
                            localStorage.removeItem('cart');
                            localStorage.removeItem('deliveryCharge');
                            localStorage.removeItem('updatedCount');
                            window.location.href = 'success-order.html';
                        } else {
                            alert('Payment verification failed: ' + verifyResult.message);
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert('Error verifying payment: ' + error.message);
                    }
                },
                prefill: {
                    name: shippingDetails.fullName,
                    contact: shippingDetails.phoneNumber,
                    email: shippingDetails.email
                },
                theme: {
                    color: '#3cb0e6ff'
                },
                method: {
                    upi: {
                        flow: 'intent'
                    }
                },
                config: {
                    display: {
                        prefer: ['upi'],
                        upi: {
                            intent: true
                        }
                    }
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
        alert('An error occurred while processing your order: ' + error.message);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    const cartCount = localStorage.getItem('updatedCount');
    if (cartCount > 0) {
        document.getElementById('cartCount').innerHTML = cartCount;
        document.querySelector('.mobile-cart').innerHTML = cartCount;
    }
});