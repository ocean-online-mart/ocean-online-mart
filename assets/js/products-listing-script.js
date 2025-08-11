let cart = JSON.parse(localStorage.getItem('cart')) || [];
const DELIVERY_CHARGE = 5.00;
let cartTotalCount = JSON.parse(localStorage.getItem('updatedCount')) || '';
// Function to fetch and render products based on category
// console.log(config.API_BASE_URL);

function fetchAndRenderProducts(categoryId) {
    const container = document.getElementById('product-list');
    container.innerHTML = ''; // Clear existing products
    const url = categoryId === 'all' 
        ? `${config.API_BASE_URL}/get_products.php`
        : `${config.API_BASE_URL}/get_products.php?category_id=${categoryId}`;

        // console.log(url);
        
    fetch(url)
        .then(res => res.json())
        .then(response => {
            if (response.status === 'success') {
                const products = response.data;
                // console.log(products.length);
                if (products.length === 0) {
                     container.innerHTML = `
                        <div class="col-12 text-center py-5">    
                            <h4>No products available in this category</h4>
                            <p>Explore other categories to find your favorite seafood!</p>
                        </div>`;
                } else {
                    
                    products.forEach((product, index) => {
                        const card = `
                            <div class="col-md-4 col-sm-6 te" data-aos="fade-up" id=${index}>
                                <div class="product-card shadow-sm rounded overflow-hidden bg-white">
                                     <a href="productdeteails.html?subcategory_id=${btoa(product.subcategory_id)}">
                                        <div class="product-img position-relative">
                                            <span class="discount-badge">${getDiscount(product.actual_price, product.offer_price)}% OFF</span>
                                            <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img1}" class="w-100 img-main" alt="Product Image" />
                                            <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img2}" class="w-100 img-hover" alt="Hover Image" />
                                        </div>
                                    </a>
                                    <div class="p-3">
                                        <h6 class="fw-bold mb-1">${product.subcategory_name}</h6>
                                        <div class="mb-2">
                                            <h6 class="mb-0">Weight: <b>${product.weight || '500g'}</b></h6>
                                            <input hidden type="number" class="form-control product-quantity" data-id="${product.subcategory_id}" value="1" min="1">
                                        </div>
                                        <div class="d-flex justify-content-between align-items-center mt-2">
                                            <span class="fw-bold text-danger">₹ ${product.offer_price} <del class="text-muted ms-1 fs-6">₹ ${product.actual_price}</del></span>
                                            <button type="button" 
                                                data-id="${product.subcategory_id}" 
                                                data-name="${product.subcategory_name}" 
                                                data-price="${product.offer_price}" 
                                                data-img="${product.img1}"
                                                class="btn btn-outline-success btn-sm add-to-cart">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        container.insertAdjacentHTML('beforeend', card);
                    });
    
                    // Reinitialize product quantity controls after rendering
                    initializeProductControls();
                }
            } else {
                console.error('Failed to fetch products:', response.message);
                container.innerHTML = '<p>No products found for this category.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            container.innerHTML = '<p>Error loading products. Please try again.</p>';
        });
}

// Modified filterCategory function to handle product filtering
function filterCategory(element, category) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    fetchAndRenderProducts(category);
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
                        <p>₹${item.price} x ${item.quantity}</p>
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
    // cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = cart.length;
    cartTotalCount = cart.length;
    localStorage.setItem('updatedCount',cartTotalCount);
     localStorage.setItem('cart', JSON.stringify(cart));
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
    updateCart();
    // if (cart.length === 0) {
    //     e.preventDefault();
    //      cartItems.innerHTML =
    //         `<div class="container-fluid mt-100">
    //             <div class="row">
    //                 <div class="col-md-12">
    //                     <div class="card-body cart">
    //                         <div class="col-sm-12 empty-cart-cls text-center">
    //                             <img src="assets/img/cart-asset/empty-cart.gif" class="img-fluid mb-4 mr-3">
    //                             <h4><strong>Your cart awaits your orders</strong></h4>
    //                             <a href="listingpage.html" class="btn btn-success w-100 mt-2" data-abc="true">continue shopping</a>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>`;
    //     cartSummary.style.display = 'none';
    //     paymentSection.style.display = 'none';
    //     otpSection.style.display = 'none';
    //     document.getElementById('proceedToPayment').style.display = 'block';
    //     return false;
    // }
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
// Send OTP
document.getElementById('sendOtp')?.addEventListener('click', () => {
    const phone = document.getElementById('phoneNumber').value.trim();
    if (phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }

    fetch('http://localhost/sendotp.php', { // change URL to your PHP path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ keep same PHP session
        body: JSON.stringify({ phone })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.querySelector('.payment-section').style.display = 'none';
            document.querySelector('.otp-section').style.display = 'block';
            alert('OTP sent to ' + phone);
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error('Error sending OTP:', err));
});

// Verify OTP
document.getElementById('verifyOtp')?.addEventListener('click', () => {
    const phone = document.getElementById('phoneNumber').value.trim();
    const otp = document.getElementById('otpInput').value.trim();

    if (otp.length !== 6) { // our PHP sends 6-digit OTP
        alert('Please enter the 6-digit OTP');
        return;
    }

    fetch('http://localhost/verifyotp.php', { // change URL to your PHP path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ keep same PHP session
        body: JSON.stringify({ phone, otp })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.querySelector('.otp-section').style.display = 'none';
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('deliveryCharge', DELIVERY_CHARGE.toFixed(2));
            window.location.href = 'checkout.html';
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error('Error verifying OTP:', err));
});

// Fetch categories and render tabs
fetch(`${config.API_BASE_URL}/get_categories.php`)
    .then(res => res.json())
    .then(response => {
        if (response.status === 'success') {
            const categories = response.data;
            const categoryContainer = document.getElementById('categoryTabs');
            categoryContainer.innerHTML = `
                <button class="category-tab active" onclick="filterCategory(this, 'all')">
                    <img src="assets/img/5.png" alt="All">
                    <span>All</span>
                </button>
            `;
            categoryContainer.innerHTML += categories.map(category => `
                <button class="category-tab" onclick="filterCategory(this, '${category.category_id}')">
                    <img src="${config.CATEGORY_IMAGE_BASE_URL}/${category.img}" alt="${category.category_name}">
                    <span>${category.category_name}</span>
                </button>
            `).join('');
            // Initialize product list with all products on page load
            fetchAndRenderProducts('all');
        } else {
            console.error('Failed to fetch categories:', response.message);
        }
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
    });

// Add event listener for product-list to handle add-to-cart
document.getElementById('product-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const button = e.target;
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const quantity = parseInt(document.querySelector(`.product-quantity[data-id="${id}"]`).value);
        const productImg = button.dataset.img;
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, name, price, quantity,productImg});
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

// Calculate discount
function getDiscount(original, offer) {
    const discount = ((original - offer) / original) * 100;
    return Math.round(discount);
}

function scrollCategory(direction) {
    const container = document.getElementById('categoryTabs');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const scrollAmount = 200;

    container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
    });

    setTimeout(() => {
        if (container.scrollLeft > 10) {
            scrollLeftBtn.classList.remove('d-none');
        } else {
            scrollLeftBtn.classList.add('d-none');
        }

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
            scrollRightBtn.classList.add('d-none');
        } else {
            scrollRightBtn.classList.remove('d-none');
        }
    }, 300);
}

function toggleFilter() {
    const filter = document.getElementById("filterSidebar");
    filter.classList.toggle("d-none");
}

window.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.category-tab.active');
    if (activeTab) filterCategory(activeTab, 'all');
    //  const cartCount = localStorage.getItem('updatedCount');
    //  console.log(cartCount);
      const cartCount = localStorage.getItem('updatedCount');
               if (cartCount > 0 ) {
                  document.getElementById('cartCount').innerHTML = cartCount; 
               } else {
                  console.log('cart is empty');
               }
});

