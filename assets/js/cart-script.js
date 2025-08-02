let cart = [];
const DELIVERY_CHARGE = 5.00;



// Update cart display
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
    let totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML =
        //  '<p>Your cart is empty</p>';
        `<div class="container-fluid  mt-100">
                  <div class="row">
                    <div class="col-md-12">
                      <div class="card-body cart">
                          <div class="col-sm-12 empty-cart-cls text-center">
                            <img src="assets/img/cart-asset/empty-cart.gif"  class="img-fluid mb-4 mr-3">
                            <h4><strong>Your cart awaits your orders</strong></h4>
                            <a href="listingpage.html" class="btn btn-success w-100 mt-2" data-abc="true">continue shopping</a>
                          </div>
                      </div>
                    </div>
                    </div>
                  </div>
				        </div>`;
        cartSummary.style.display = 'none';
        paymentSection.style.display = 'none';
        otpSection.style.display = 'none';
        addressSection.style.display = 'none';
        document.getElementById('proceedToPayment').style.display = 'block';
    } else {
        cartSummary.style.display = 'block';
        cart.forEach(item => {
            const quantity = parseFloat(item.quantity);
            subtotal += item.price * item.quantity;
            totalQuantity += quantity;
            cartItems.innerHTML += `
                 <div class="cart-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6>${item.name}</h6>
                                <p>$${item.price} x ${item.quantity}</p>
                            </div>
                            <div class="quantity-control flex-column align-items-end">
                                <button class="btn btn-sm remove-item p-2 border border-0" data-id="${item.id}"><i class="bi bi-trash3-fill trash-icon"></i></button>
                                <div class="d-flex align-items-center mt-1">
                                  <button class="btn btn-outline-secondary  cart-decrement canbtn" data-id="${item.id}">-</button>
                                  <input type="number" class="form-control cart-quantity" data-id="${item.id}" value="${item.quantity}" min="1">
                                  <button class="btn btn-outline-secondary  cart-increment canbtn" data-id="${item.id}">+</button>
                                </div>
                            </div>
                        </div>
            `;
        });
    }

    cartSubtotal.textContent = subtotal.toFixed(2);
    cartTotal.textContent = (subtotal + DELIVERY_CHARGE).toFixed(2);
    finalSubtotal.textContent = subtotal.toFixed(2);
    finalTotal.textContent = (subtotal + DELIVERY_CHARGE).toFixed(2);
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Add event listeners for cart quantity controls
    document.querySelectorAll('.cart-increment').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity++;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.cart-decrement').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.cart-quantity').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            const value = parseInt(input.value);
            const item = cart.find(item => item.id === id);
            if (item && value >= 1) {
                item.quantity = value;
                updateCart();
            } else if (item) {
                input.value = item.quantity;
            }
        });
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
}

// Prevent offcanvas opening when cart is empty (for cart icon)
document.getElementById('cartButton')?.addEventListener('click', (e) => {
    if (cart.length === 0) {
        e.preventDefault();
        // alert('Your cart is empty!');
        return false;
    }
});

// Product quantity controls
function initializeProductControls() {
    document.querySelectorAll('.product-increment').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
            input.value = parseInt(input.value) + 1;
           
        });
    });

    document.querySelectorAll('.product-decrement').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
               
            }
        });
    });

    document.querySelectorAll('.product-quantity').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            if (parseInt(input.value) < 1) {
                input.value = 1;
               
            }
        });
    });
}

// Proceed to payment
document.getElementById('proceedToPayment')?.addEventListener('click', () => {
    if (cart.length === 0) {
        return;
    }
    document.querySelector('.payment-section').style.display = 'block';
    document.getElementById('proceedToPayment').style.display = 'none';
});

// Send OTP
document.getElementById('sendOtp')?.addEventListener('click', () => {
    const phone = document.getElementById('phoneNumber').value;
    if (phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    document.querySelector('.payment-section').style.display = 'none';
    document.querySelector('.otp-section').style.display = 'block';
    alert('OTP sent to ' + phone);
});

// Verify OTP
document.getElementById('verifyOtp')?.addEventListener('click', () => {
    const otp = document.getElementById('otpInput').value;
    if (otp.length !== 4) {
        alert('Please enter a valid 4-digit OTP');
        return;
    }
    document.querySelector('.otp-section').style.display = 'none';
    document.querySelector('.address-section').style.display = 'block';
    console.log(cart);
});



// Fetch products and render them
fetch('http://localhost/Projects/panel.oceanonlinemart.com/ajax/get_products.php')
    .then(res => res.json())
    .then(response => {
        if (response.status === 'success') {
            const products = response.data;
            // console.log(products);
            const container = document.getElementById('product-list');
            products.forEach((product, index) => {
                const card = `
                    <div class="col-md-4 col-sm-6 te" data-aos="fade-up">
                       
                            <div class="product-card shadow-sm rounded overflow-hidden bg-white">
                              <a href="productdeteails.html?subcategory_id=${product.subcategory_id}">
                                    <div class="product-img position-relative">
                                        <span class="discount-badge">${getDiscount(product.actual_price, product.offer_price)}% OFF</span>
                                        <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img1}" class="w-100 img-main" alt="Product Image" />
                                        <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img2}" class="w-100 img-hover" alt="Hover Image" />
                                    </div>
                                </a>
                                <div class="p-3">
                                    <h6 class="fw-bold mb-1">${product.subcategory_name}</h6>
                                    
                                    <div class="mb-2">
                                        <h6 class="mb-0">Weight: <b>${product.weight || '250g'}</b></h6>
                                        <input hidden type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center mt-2">
                                        <span class="fw-bold text-danger">₹ ${product.offer_price} <del class="text-muted ms-1 fs-6">₹ ${product.actual_price}</del></span>
                                        <button type="button" data-id="${product.subcategory_id}" data-name="${product.subcategory_name}" data-price="${product.offer_price}" class="btn btn-outline-success btn-sm add-to-cart">Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        
                    </div>`;
                container.insertAdjacentHTML('beforeend', card);
            });

            // Initialize event delegation for add-to-cart buttons
            document.getElementById('product-list').addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    const button = e.target;
                    const id = button.dataset.id;
                    const name = button.dataset.name;
                    const price = parseFloat(button.dataset.price);
                    const quantity = parseInt(document.querySelector(`.product-quantity[data-id="${id}"]`).value);

                    const existingItem = cart.find(item => item.id === id);
                    if (existingItem) {
                        existingItem.quantity += quantity;
                    } else {
                        cart.push({ id, name, price, quantity });
                    }
                    updateCart();

                    // Reset quantity input
                    document.querySelector(`.product-quantity[data-id="${id}"]`).value = 1;
                   

                    // Programmatically open the offcanvas
                    const offcanvasElement = document.getElementById('cartOffcanvas');
                    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                    offcanvas.show();
                }
            });

            // Initialize product quantity controls
            initializeProductControls();
        }
    })
    .catch(error => {
        console.error('Error fetching products:', error);
    });

function getDiscount(original, offer) {
    // console.log('Original:', original, 'Offer:', offer);
    const discount = ((original - offer) / original) * 100;
    // console.log(discount);
    
    return Math.round(discount);
}

fetch('http://localhost/Projects/panel.oceanonlinemart.com/ajax/get_categories.php')
    .then(res => res.json())
    .then(response => {
        if (response.status === 'success') {
            const categories = response.data;
            // console.log('Categories:', categories);
            const categoryContainer = document.getElementById('categoryTabs');
            categoryTabs.innerHTML = `
                        <button class="category-tab active" onclick="filterCategory(this, 'all')">
                            <img src="assets/img/5.png" alt="All">
                            <span>All</span>
                        </button>
                    `;
            categoryTabs.innerHTML += categories.map(category => `
                        <button class="category-tab" onclick="filterCategory(this, '${category.category_id}')">
                            <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/cat_product/${category.img}" alt="${category.category_name}">
                            <span>${category.category_name}</span>
                        </button>
                    `).join('');
        } else {
            console.error('Failed to fetch categories:', response.message);
        }
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
    });