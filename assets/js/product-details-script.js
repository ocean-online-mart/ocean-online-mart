let cart = JSON.parse(localStorage.getItem('cart')) || [];
const DELIVERY_CHARGE = 5.00;
let cartTotalCount = JSON.parse(localStorage.getItem('updatedCount')) || '';
// Get subcategory_id from URL query parameter
const params = new URLSearchParams(window.location.search);
const encodedId = params.get('subcategory_id');
const subcategoryId = encodedId ? atob(encodedId) : null;
let categoryId = ''; // Will be set after fetching product details
function updateProductTotal(id) {
    const quantityInput = document.querySelector(`.product-quantity[data-id="${id}"]`);
    const totalSpan = document.querySelector(`.product-total[data-id="${id}"]`);
    const priceElement = document.querySelector(`.add-to-cart[data-id="${id}"]`);
    if (!quantityInput || !totalSpan || !priceElement) return;
    
    const price = parseFloat(priceElement.dataset.price);
    const quantity = parseFloat(quantityInput.value);
    if (!isNaN(quantity) && !isNaN(price)) {
        totalSpan.textContent = `₹${(price * quantity).toFixed(2)}`;
    }else{
           totalSpan.textContent = 0;
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
    
    fetch(`${config.API_BASE_URL}/get_product_details.php?subcategory_id=${subcategoryId}`)
        .then(res => res.json())
        .then(response => {
            const container = document.getElementById('product-details');
            if (response.status === 'success' && response.data) {
                const product = response.data.product;
                categoryId = product.category_id; // Set categoryId for related products
                const variations = response.data.variations || [];
                
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
                                <img id="mainImage" src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img1}" 
                                class="main-img" alt="${product.subcategory_name}">
                            </div>                 
                            <div class="d-flex justify-content-center gap-2 mt-3">
                                <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img1}" class="thumb-img active" onclick="changeImage(this)">
                                <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img2}" class="thumb-img" onclick="changeImage(this)">
                                <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img3}" class="thumb-img" onclick="changeImage(this)">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <h2 class="fw-bold text-dark mb-2 card-title">${product.subcategory_name}</h2>
                        <p class="text-muted">Category: ${product.category_name || 'Seafood'}</p>
                        <p class="text-muted mb-3">${product.description || 'No description available.'}</p>
                        <div class="my-3">
                            <div class="d-flex align-items-center gap-5 mb-3 justify-content-between justify-content-sm-start">
                                <div class="quantity-control">
                                    <button class="btn btn-outline-secondary btn-sm product-decrement" data-id="${product.subcategory_id}">-</button>
                                    <input type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                                    <button class="btn btn-outline-secondary btn-sm product-increment" data-id="${product.subcategory_id}">+</button> 
                                    <h6 class="pt-2 px-2"> KG</h6>
                                </div>
                                 <h4 class="product-total pt-2" data-id="${product.subcategory_id}">₹${(product.offer_price * 1).toFixed(2)}</h4>
                            </div>
                        </div>
                        <div>
                            <div class="d-flex flex-wrap gap-2">
                                <button class="btn btn-outline-success btn-lg btn-block flex-fill  flex-md-grow-0 px-4 add-to-cart w-100 " 
                                    data-id="${product.subcategory_id}" 
                                    data-name="${product.subcategory_name}" 
                                    data-price="${product.offer_price}" 
                                    data-img="${product.img1}"
                                    style="margin-top: 5px;" 
                                    data-bs-toggle="offcanvas" 
                                    data-bs-target="#cartOffcanvas">Add to Cart</button>
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
                fetchAndRenderRelatedProdct(); // Fetch related products after setting categoryId
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
    document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active'));
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
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Remove existing listeners to prevent duplicates
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    const button = e.target.closest('.add-to-cart');
    if (!button) return;
    
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    const quantityInput = document.querySelector(`.product-quantity[data-id="${id}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    const productImg = button.dataset.img;
    // console.log(productImg);
    

    if (isNaN(price) || isNaN(quantity) || quantity < 1) {
        console.error('Invalid price or quantity');
        return;
    }

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, quantity,productImg });
    }
    
    updateCart();
    
    // Reset quantity input if it exists
    if (quantityInput) {
        quantityInput.value = 1;
        updateProductTotal(id);
    }

    //  const offcanvasElement = document.getElementById('cartOffcanvas');
    //     const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    //     offcanvas.show();

    // Open the offcanvas
    // const offcanvasElement = document.getElementById('cartOffcanvas');
    // if (offcanvasElement) {
    //     const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    //     offcanvas.show();
    // }
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');
    const mobileCartCount = document.querySelector('.mobile-cart');
    const cartSummary = document.getElementById('cartSummary');
    const paymentSection = document.querySelector('.payment-section');
    const otpSection = document.querySelector('.otp-section');
    // const addressSection = document.querySelector('.address-section');
    const finalSubtotal = document.getElementById('finalSubtotal');
    const finalTotal = document.getElementById('finalTotal');
   
    
    cartItems.innerHTML = '';
    let subtotal = 0;
    let totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="container-fluid mt-100">
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
        // addressSection.style.display = 'none';
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
                         <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${item.productImg}" alt="Product" width="50" class="rounded me-2">
                        <h6>${item.name}</h6>
                        <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
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
   cartCount.textContent = cart.length;
   cartTotalCount = cart.length;
   mobileCartCount.textContent = cart.length;
   localStorage.setItem('cart', JSON.stringify(cart));
   localStorage.setItem('updatedCount',cartTotalCount);
    // Add event listeners for cart quantity controls
    document.querySelectorAll('.cart-increment').forEach(button => {
        button.removeEventListener('click', handleCartIncrement);
        button.addEventListener('click', handleCartIncrement);
    });

    document.querySelectorAll('.cart-decrement').forEach(button => {
        button.removeEventListener('click', handleCartDecrement);
        button.addEventListener('click', handleCartDecrement);
    });

    document.querySelectorAll('.cart-quantity').forEach(input => {
        input.removeEventListener('change', handleCartQuantityChange);
        input.addEventListener('change', handleCartQuantityChange);
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.removeEventListener('click', handleRemoveItem);
        button.addEventListener('click', handleRemoveItem);
    });
}

// Cart event handlers
function handleCartIncrement(e) {
    const id = e.target.dataset.id;
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

function handleCartDecrement(e) {
    const id = e.target.dataset.id;
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        updateCart();
    }
}

function handleCartQuantityChange(e) {
    const id = e.target.dataset.id;
    const value = parseInt(e.target.value);
    const item = cart.find(item => item.id === id);
    if (item && value >= 1) {
        item.quantity = value;
        updateCart();
    } else if (item) {
        e.target.value = item.quantity;
    }
}

function handleRemoveItem(e) {
    const id = e.target.closest('.remove-item').dataset.id;
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

document.getElementById('mobileCart')?.addEventListener('click',(e)=>{
    //  console.log(cart);
     updateCart();
});
// Prevent offcanvas opening when cart is empty
document.querySelector('.cartButton')?.addEventListener('click', (e) => {
    // alert('hi');
    // console.log(cart);
         updateCart();
});

// Proceed to payment
document.getElementById('proceedToPayment')?.addEventListener('click', () => {
    if (cart.length === 0) return;
   document.querySelector('.payment-section').style.display = 'block';
    document.getElementById('proceedToPayment').style.display = 'none';
    //  window.location.href = 'checkout.html';
});

// Send OTP
document.getElementById('sendOtp')?.addEventListener('click', async() => {
    const email = document.getElementById('emailID').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Enter a valid email address');
            return;
        }
        document.getElementById('sendOtp').disabled = true;
            // document.querySelector('.otp-section').style.display = 'block';
            // document.querySelector('.payment-section').style.display = 'none';
     try {    
        const response = await fetch(`${config.API_BASE_URL}/otp.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })  // Only phone sent during OTP send
        });

        const data = await response.json();
        // console.log(data);
        
        if (data.status) {
            alert("OTP sent to this email address: " + email); 
            document.getElementById('sendOtp').disabled = false;
            localStorage.setItem('user_mail', JSON.stringify(email));
            document.querySelector('.otp-section').style.display = 'block';
            document.querySelector('.payment-section').style.display = 'none';
        } else {
            const msg = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
            alert("Error: " + msg);
            console.error("Server responded with error:", data);  
        }
    } catch (error) {
        alert("Failed to send OTP. Server not reachable.");
        console.error("Fetch error (sendOtp):", error);
    }
});

document.querySelector('.edit-mail')?.addEventListener('click', (e) => {
    e.preventDefault(); 
    document.querySelector('.otp-section').style.display = 'none';
    document.querySelector('.payment-section').style.display = 'block';
    document.getElementById('emailID').value = JSON.parse(localStorage.getItem('user_mail') || '""'); 
    document.getElementById('emailID').focus(); 
});
document.getElementById('verifyOtp').addEventListener('click', async () => {
    const otp = document.getElementById('otpInput').value.trim();
    const email = JSON.parse(localStorage.getItem('user_mail') || '""');
    console.log(email);
    
    if (otp.length !== 4 || isNaN(otp)) {
        alert('Please enter a valid 4-digit OTP');
        return;
    }
    // console.log(otp);

    if (otp) {
        const response = await fetch(`${config.API_BASE_URL}/verify_otp.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({otp , email })  
        });
        // console.log(response);
        
        const data = await response.json();
        // console.log(data);
        
        if (data.status === "success") {
            alert("OTP Verified Successfully!");
            localStorage.setItem('cart', JSON.stringify(cart));
            
            localStorage.setItem('deliveryCharge', DELIVERY_CHARGE.toFixed(2));
            window.location.href = 'checkout.html';
        } else {
            const msg = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
             console.error("Server responded with error:", data);
        }
    } else {
        alert("Failed to verify OTP. Server not reachable.");
        console.error("Fetch error (verifyOtp):", error); 
    }
});


// Calculate discount
function getDiscount(original, offer) {
    const discount = ((original - offer) / original) * 100;
    return Math.round(discount);
}

// Fetch and render related products
function fetchAndRenderRelatedProdct() {
    if (!categoryId) {
        console.error('Category ID or Subcategory ID not available');
        return;
    }
    fetch(`${config.API_BASE_URL}/get_related_products.php?&category_id=${categoryId}`)
        .then(res => res.json())
        .then(response => {
            const container = document.getElementById('related-scroll');
            if (response.status === 'success' && response.data) {
                container.innerHTML = '';
                response.data.forEach(product => {
                    const discount = getDiscount(product.actual_price, product.offer_price);
                    const productCard = `
                        <div class="card flex-shrink-0 product-image-wrapper mb-4" style="min-width: 220px;" id="related-product">
                              <a href="productdeteails.html?subcategory_id=${btoa(product.subcategory_id)}">
                            <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img1}"
                                class="card-img-top" alt="${product.subcategory_name}">
                            </a>
                            <div class="card-body">
                               <h6 class="fw-bold mb-1 product-title" title="${product.subcategory_name}">
                                    ${product.subcategory_name}
                                </h6>
                                <input hidden type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                                <p style="font-weight: bolder; font-size: medium;">
                                    <b>₹${product.offer_price}</b>
                                    <del class="text-muted" style="padding-right: 15px;">₹${product.actual_price}</del>
                                    <span class="off text-end">${discount}% off</span>
                                </p>
                                <button class="cartBtn add-to-cart " 
                                    data-id="${product.subcategory_id}" 
                                    data-name="${product.subcategory_name}" 
                                    data-price="${product.offer_price}" 
                                    data-img="${product.img1}"
                                    data-bs-toggle="offcanvas" 
                                    data-bs-target="#cartOffcanvas">
                                    <svg class="cart" fill="white" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
                                    </svg>
                                    ADD TO CART
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" fill="currentColor" class="product">
                                        <path d="M327.6 96c-49.2 0-94.2 17.3-131.1 45.7C156.7 112.2 128 96 96 96c-53 0-96 42.1-96 94.1 0 34.2 17.8 64.2 44.8 81.6C17.8 288.9 0 318.9 0 353.1 0 405.9 43 448 96 448c32 0 60.7-16.2 100.5-45.7C233.4 398.7 278.4 416 327.6 416c137.5 0 248.4-86 248.4-160S465.1 96 327.6 96zM96 400c-26.5 0-48-21.5-48-47.9 0-24.5 17.5-44.9 40.3-47.5l24.1-2.8-20.1-14.5c-16.6-12-26.3-31-26.3-51.2 0-26.4 21.5-47.9 48-47.9 13.7 0 26.3 6 35.1 15.7-23.5 26.5-40.4 58.4-48.3 93.1-7.9 34.7-6 69.4 4.3 102.6C113.2 396.7 104.8 400 96 400zm232-96c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>`;
                    container.insertAdjacentHTML('beforeend', productCard);
                });
                initializeAddToCart();
            } else {
                container.innerHTML = '<p>No related products found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching related products:', error);
            document.getElementById('related-scroll').innerHTML = '<p>Error loading related products.</p>';
        });
}

// Initialize product details on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProductDetails();
      const cartCounts = localStorage.getItem('updatedCount');
        if (cartCounts > 0 ) {
            document.getElementById('cartCount').innerHTML = cartCounts; 
            document.querySelector('.mobile-cart').innerHTML = cartCounts;
        } else {
            console.log('cart is empty');
        }
});