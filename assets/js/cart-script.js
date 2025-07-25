let cart = [];
const DELIVERY_CHARGE = 5.00;

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    const cartSummary = document.getElementById('cartSummary');
    const paymentSection = document.querySelector('.payment-section');
    const otpSection = document.querySelector('.otp-section');
    const addressSection = document.querySelector('.address-section');
    const finalSubtotal = document.getElementById('finalSubtotal');
    const finalTotal = document.getElementById('finalTotal');

    cartItems.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        cartSummary.style.display = 'none';
        paymentSection.style.display = 'none';
        otpSection.style.display = 'none';
        addressSection.style.display = 'none';
        document.getElementById('proceedToPayment').style.display = 'block';
    } else {
        cartSummary.style.display = 'block';
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            cartItems.innerHTML += `
                <div class="cart-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${item.name}</h6>
                        <p>$${item.price} x ${item.quantity} ${item.unit_type === 'weight' ? 'kg' : 'pack(s)'}</p>
                    </div>
                    <div class="quantity-control">
                        <button class="btn btn-outline-secondary btn-sm cart-decrement" data-id="${item.id}">-</button>
                        <input type="number" class="form-control cart-quantity" data-id="${item.id}" 
                            data-unit="${item.unit_type}" value="${item.quantity}" 
                            min="${item.unit_type === 'weight' ? 0.5 : 1}" 
                            step="${item.unit_type === 'weight' ? 0.5 : 1}">
                        <button class="btn btn-outline-secondary btn-sm cart-increment" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">Remove</button>
                </div>
            `;
        });
    }

    cartSubtotal.textContent = subtotal.toFixed(2);
    cartTotal.textContent = (subtotal + DELIVERY_CHARGE).toFixed(2);
    finalSubtotal.textContent = subtotal.toFixed(2);
    finalTotal.textContent = (subtotal + DELIVERY_CHARGE).toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Quantity update buttons
    document.querySelectorAll('.cart-increment').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.cart-quantity[data-id="${id}"]`);
            const step = parseFloat(input.step);
            const item = cart.find(item => item.id === id);
            item.quantity = parseFloat((item.quantity + step).toFixed(2));
            updateCart();
        });
    });

    document.querySelectorAll('.cart-decrement').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.cart-quantity[data-id="${id}"]`);
            const step = parseFloat(input.step);
            const item = cart.find(item => item.id === id);
            const min = parseFloat(input.min);
            const newQty = parseFloat((item.quantity - step).toFixed(2));
            if (newQty >= min) {
                item.quantity = newQty;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.cart-quantity').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            const item = cart.find(item => item.id === id);
            const value = parseFloat(input.value);
            const min = parseFloat(input.min);
            if (item && value >= min) {
                item.quantity = value;
                updateCart();
            } else {
                input.value = item.quantity;
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
}

// Prevent offcanvas if cart empty
document.getElementById('cartButton').addEventListener('click', (e) => {
    if (cart.length === 0) {
        e.preventDefault();
        alert('Your cart is empty!');
        return false;
    }
});

// Add to cart logic
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
        const quantity = parseFloat(input.value);
        const unit_type = input.dataset.unit;

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, quantity, unit_type });
        }

        updateCart();

        // Reset input
        input.value = unit_type === 'weight' ? "0.5" : "1";
    });
});

// Product quantity buttons (product page)
document.querySelectorAll('.product-increment').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.dataset.id;
        const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
        const step = parseFloat(input.step);
        input.value = (parseFloat(input.value) + step).toFixed(2);
    });
});

document.querySelectorAll('.product-decrement').forEach(button => {
    button.addEventListener('click', () => {
        const id = button.dataset.id;
        const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
        const step = parseFloat(input.step);
        const min = parseFloat(input.min);
        const current = parseFloat(input.value);
        if (current - step >= min) {
            input.value = (current - step).toFixed(2);
        }
    });
});

document.querySelectorAll('.product-quantity').forEach(input => {
    input.addEventListener('change', () => {
        const min = parseFloat(input.min);
        if (parseFloat(input.value) < min) {
            input.value = min;
        }
    });
});

// Checkout Flow
document.getElementById('proceedToPayment').addEventListener('click', () => {
    if (cart.length === 0) return;
    document.querySelector('.payment-section').style.display = 'block';
    document.getElementById('proceedToPayment').style.display = 'none';
});

document.getElementById('sendOtp').addEventListener('click', () => {
    const phone = document.getElementById('phoneNumber').value;
    if (phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    document.querySelector('.payment-section').style.display = 'none';
    document.querySelector('.otp-section').style.display = 'block';
    alert('OTP sent to ' + phone);
});

document.getElementById('verifyOtp').addEventListener('click', () => {
    const otp = document.getElementById('otpInput').value;
    if (otp.length !== 4) {
        alert('Please enter a valid 4-digit OTP');
        return;
    }
    document.querySelector('.otp-section').style.display = 'none';
    document.querySelector('.address-section').style.display = 'block';
});

document.getElementById('completeOrder').addEventListener('click', () => {
    const address = document.getElementById('address').value;
    const paymentMode = document.getElementById('paymentMode').value;
    if (!address) {
        alert('Please enter delivery address');
        return;
    }
    alert(`Order placed!\nAddress: ${address}\nPayment: ${paymentMode}`);
    cart = [];
    updateCart();
    document.querySelector('.address-section').style.display = 'none';
    document.getElementById('proceedToPayment').style.display = 'block';
    document.getElementById('cartOffcanvas').classList.remove('show');
});

updateCart();
