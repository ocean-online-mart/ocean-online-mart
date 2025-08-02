let cart = [];
const DELIVERY_CHARGE = 5.00;

// Get subcategory_id from URL query parameter
const params = new URLSearchParams(window.location.search);
const encodedId = params.get('subcategory_id');
const subcategoryId = encodedId ? atob(encodedId) : null;
const categoryId ='' ;
 function updateProductTotal(id) {
            const quantityInput = document.querySelector(`.product-quantity[data-id="${id}"]`);
            const totalSpan = document.querySelector(`.product-total[data-id="${id}"]`);
            const price = parseFloat(document.querySelector(`.add-to-cart[data-id="${id}"]`).dataset.price);
            const quantity = parseFloat(quantityInput.value);
            if (totalSpan && !isNaN(quantity) && !isNaN(price)) {
                totalSpan.textContent = `₹`+(price * quantity).toFixed(2);
            }
        }


// Fetch and render product details
function fetchAndRenderProductDetails() {
    if (!subcategoryId) {
        document.getElementById('product-details').innerHTML = `
            <div class="col-12 text-center py-5">
                <h4>Product not found</h4>
                <p>Please select a valid product.</p>
                <a href="listingpage.html" class="btn btn-success mt-2">Back to Products</a>
            </div>`;
        return;
    }
    fetch(`http://localhost/Projects/panel.oceanonlinemart.com/ajax/get_product_details.php?subcategory_id=${subcategoryId}`)
        .then(res => res.json())
        .then(response => {
            // console.log(response);
            const container = document.getElementById('product-details');
            if (response.status === 'success' && response.data) {
                const product = response.data.product;
                // console.log(product.category_id);
                // console.log(product.subcategory_id);
                
                // categoryId = response.data.product.category_id;
                const variations = response.data.variations || [];
                // console.log(variations);
                let variationsHtml = variations.length > 0 ? variations.map(v => `
                    <p class="text-dark" style="margin-top:16px;">${v.variety_name}</p>
                    <h5 class="${v.qty > 0 ? 'text-success' : 'text-danger'}">${v.qty > 0 ? 'In Stock' : 'Out of Stock'}</h5>
                `).join('') : `
                    <p class="text-dark" style="margin-top:16px;">${product.subcategory_name} (Default)</p>
                    <h5 class="text-success">In Stock</h5>
                `;
                container.innerHTML = `
                    <div class="col-12 col-lg-6">
                        <div class="position-relative mx-auto text-center">
                            <div class="main-img-wrapper overflow-hidden rounded shadow">
                                <img id="mainImage" src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img1}" 
                                class="main-img" alt="${product.subcategory_name}" id="mainImage">
                            </div>                 
                            <div class="d-flex justify-content-center gap-2 mt-3">
                                <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img1}" class="thumb-img active" onclick="changeImage(this)">
                                <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img2}" class="thumb-img" onclick="changeImage(this)">
                                <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img3}" class="thumb-img" onclick="changeImage(this)">
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12 col-lg-6">
                        <h2 class="fw-bold text-dark mb-2 card-title">${product.subcategory_name}</h2>
                         <p class="text-muted">Category: ${product.category_name || 'Seafood'}</p>
                        <p class="text-muted mb-3">${product.description || 'No description available.'}</p>
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-3">
                                <div class="quantity-control">
                                    <button class="btn btn-outline-secondary btn-sm product-decrement" data-id="${product.subcategory_id}">-</button>
                                    <input type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                                    <button class="btn btn-outline-secondary btn-sm product-increment" data-id="${product.subcategory_id}">+</button>
                                </div>
                                
                            </div>
                        </div>
                        <div>
                        <div class="d-flex flex-wrap gap-2"></span> 
                                <p class="card-text">
                                <h4 class="product-total pt-3" data-id="${product.subcategory_id}">₹ 15.00</h4>
                                </p>
                            <button class="btn btn-outline-success flex-fill flex-md-grow-0 px-4 add-to-cart" data-id="${product.subcategory_id}"
                            data-name="${product.subcategory_name}" data-img="${product.img1}" data-price="${product.offer_price}" style="margin-top: 5px;" 
                            id="cartButton" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas">Add to Cart</button>
                        </div>
                        <div class="text-dark" style="font-size: medium; font-weight:bolder;">
                            ${variationsHtml}
                        </div>
                        <div class="mt-3 small text-muted">Delivered within 1 hour • Quality guaranteed • Freshly packed</div>
                        </div>
                    </div>`;
                initializeProductControls();
                initializeAddToCart();
                updateProductTotal(product.subcategory_id);
                fetchAndRenderRelatedProdct();
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <h4>Product not found</h4>
                        <p>Please select a valid product.</p>
                        <a href="listingpage.html" class="btn btn-success mt-2">Back to Products</a>
                    </div>`;
            }
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            document.getElementById('product-details').innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4>Error loading product details</h4>
                    <p>Please try again later.</p>
                    <a href="listingpage.html" class="btn btn-success mt-2">Back to Products</a>
                </div>`;
        });
}

// Change main image on thumbnail click
function changeImage(element) {
    document.querySelectorAll('.thumbnail-img').forEach(img => img.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('mainImage').src = element.src;
}

// Product quantity controls
function initializeProductControls() {
    document.querySelectorAll('.product-increment').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
            input.value = parseInt(input.value) + 1;
            updateProductTotal(id);
        });
    });

    document.querySelectorAll('.product-decrement').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const input = document.querySelector(`.product-quantity[data-id="${id}"]`);
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
                updateProductTotal(id);
            }
        });
    });

    document.querySelectorAll('.product-quantity').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.dataset.id;
            if (parseInt(input.value) < 1) {
                input.value = 1;
            }
            updateProductTotal(id);
        });
    });
}

// Add to cart functionality
function initializeAddToCart() {
    document.querySelector('.add-to-cart').addEventListener('click', (e) => {
        const button = e.target;
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const quantity = parseInt(document.querySelector(`.product-quantity[data-id="${id}"]`).value);
        const productImg = button.dataset.img;
        console.log(productImg);
        
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, quantity });
        }
        updateCart();

        // Reset quantity input
        document.querySelector(`.product-quantity[data-id="${id}"]`).value = 1;
        updateProductTotal(id);

        // Open the offcanvas
        // const offcanvasElement = document.getElementById('cartOffcanvas');
        // const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
        // offcanvas.show();
    });
}

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
            `<div class="container-fluid mt-100">
                <div class="row">
                    <div class="col-md-12">
                        <div class="card-body cart">
                            <div class="col-sm-12 empty-cart-cls text-center">
                                <img src="assets/img/cart-asset/empty-cart.gif" class="img-fluid mb-4 mr-3">
                                <h4><strong>Your cart awaits your orders</strong></h4>
                                <a href="listingpage.html" class="btn btn-success w-100 mt-2" data-abc="true">continue shopping</a>
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
                        <img src="" alt="Product" width="50" class="rounded me-2">
                        <h6>${item.name}</h6>
                        <p>$${item.price} x ${item.quantity}</p>
                    </div>
                    <div class="quantity-control flex-column align-items-end">
                        <button class="btn btn-sm remove-item p-2 border border-0" data-id="${item.id}"><i class="bi bi-trash3-fill trash-icon"></i></button>
                        <div class="d-flex align-items-center mt-1">
                            <button class="btn btn-outline-secondary cart-decrement canbtn" data-id="${item.id}">-</button>
                            <input type="number" class="form-control cart-quantity" data-id="${item.id}" value="${item.quantity}" min="1">
                            <button class="btn btn-outline-secondary cart-increment canbtn" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>`;
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

// Prevent offcanvas opening when cart is empty
document.getElementById('cartButton')?.addEventListener('click', (e) => {
    if (cart.length === 0) {
        e.preventDefault();
        return false;
    }
});

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
    // console.log(cart);
});

// Calculate discount
function getDiscount(original, offer) {
    const discount = ((original - offer) / original) * 100;
    return Math.round(discount);
}

// Initialize product details on page load
function fetchAndRenderRelatedProdct() {

    fetch(`http://localhost/Projects/panel.oceanonlinemart.com/ajax/get_related_products.php?subcategory_id=22&category_id=1`)
     .then(res => res.json())
        .then(response => {
            // console.log(response.data);
            const container = document.getElementById('related-scroll');
            const relatedProducts = response.data;
            if (response.status === 'success' && response.data) {
                 relatedProducts.forEach((product, index) => {
                    const productCard = `
                         <div class="card flex-shrink-0 product-image-wrapper mb-4" style="min-width: 220px;" id="related-product">
                           <a href="productdeteails.html?subcategory_id=${product.subcategory_id}">
                            <img src="http://localhost/Projects/panel.oceanonlinemart.com/dynamic_img/sub_product/${product.img1}" class="card-img-top" alt="...">
                            </a>
                        <div class="card-body p-2">
                        <h6 class="fw-bold mb-1" style="font-weight: bolder;display: -webkit-box;line-clamp: 2;-webkit-line-clamp: 2;-webkit-box-orient: vertical">${product.subcategory_name}</h6>
                        
                        <p class="small text-muted mb-2">250g </p>
                        <input hidden type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                        <p style="font-weight: bolder; font-size: medium;"> <b>₹ ${product.offer_price} </b><del class="text-muted"
                            style="padding-right: 15px;">₹${product.actual_price}</del><span class="off text-end">17% off</span></p> 
                        <button class="cartBtn add-to-cart" data-id="${product.subcategory_id}" data-name="${product.subcategory_name}" data-price=" ${product.offer_price}" 
                        id="cartButton" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas">
                            <svg class="cart" fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path></svg>
                            ADD TO CART
                            
                            <!-- <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" class="product"><path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z"></path></svg> -->
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="currentColor" class="product">
                                <path d="M327.6 96c-49.2 0-94.2 17.3-131.1 45.7C156.7 112.2 128 96 96 96c-53 0-96 42.1-96 94.1 0 34.2 17.8 64.2 44.8 81.6C17.8 288.9 0 318.9 0 353.1 0 405.9 43 448 96 448c32 0 60.7-16.2 100.5-45.7C233.4 398.7 278.4 416 327.6 416c137.5 0 248.4-86 248.4-160S465.1 96 327.6 96zM96 400c-26.5 0-48-21.5-48-47.9 0-24.5 17.5-44.9 40.3-47.5l24.1-2.8-20.1-14.5c-16.6-12-26.3-31-26.3-51.2 0-26.4 21.5-47.9 48-47.9 13.7 0 26.3 6 35.1 15.7-23.5 26.5-40.4 58.4-48.3 93.1-7.9 34.7-6 69.4 4.3 102.6C113.2 396.7 104.8 400 96 400zm232-96c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z"/>
                            </svg>
                        </button>
                        </div>
                    </div>`;

                     container.insertAdjacentHTML('beforeend', productCard);
                      
                 });
                 initializeAddToCart(); 
            }
        })
}

window.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProductDetails();
    // console.log(categoryId);    
    
});