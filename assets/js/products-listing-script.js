
// Update cart badge everywhere
function updateCartBadge() {
    const count = cart.length;
    const badges = document.querySelectorAll('#cartCount, .mobile-cart');
    badges.forEach(el => el && (el.textContent = count));
    localStorage.setItem('updatedCount', count);
}

// =============== ADD TO CART FROM LISTING ===============
function addToCartFromListing(button) {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    const img = button.dataset.img || 'default.jpg';

    if (!id || isNaN(price)) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity = (parseFloat(existing.quantity || 0.5) + 0.5).toFixed(1);
    } else {
        cart.push({ id, name, price, quantity: "0.5", productImg: img });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();

    // Success animation
    const original = button.innerHTML;
    button.innerHTML = 'Added!';
    button.classList.replace('btn-outline-success', 'success');
    setTimeout(() => {
        button.innerHTML = original;
        button.classList.replace('success', 'outline-success');
    }, 1500);

    // Auto open cart offcanvas
    const offcanvas = document.getElementById('cartOffcanvas');
    if (offcanvas) new bootstrap.Offcanvas(offcanvas).show();
}

// =============== LOAD CATEGORIES ===============
function loadCategories() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedId = urlParams.get('catid');
    const urlCategoryId = encodedId ? atob(encodedId) : null;

    fetch(`${config.API_BASE_URL}/get_categories.php`)
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") return;

            const container = document.getElementById('categoryTabs');
            let html = `
                <div class="category-item text-center flex-shrink-0 ${!urlCategoryId ? 'active' : ''}"
                     data-category-id="all" onclick="onCategorySelected(null)"
                     style="min-width:80px;cursor:pointer;">
                    <div class="rounded-circle bg-white shadow-sm  mb-2 mx-auto" style="width:60px;height:60px;">
                        <i class="fas fa-th-large text-primary"></i>
                    </div>
                    <img src="assets/img/1.png" class="all-fish" style="width:40px;height:40px;margin-top:-90px;">
                    <h6 class="small fw-bold mb-0">All</h6>
                </div>`;

            data.data.forEach(cat => {
                const active = urlCategoryId === cat.category_id ? 'active' : '';
                html += `
                    <div class="category-tab text-center flex-shrink-0 ${active}"
                         data-category-id="${cat.category_id}"
                         onclick="onCategorySelected(${cat.category_id})"
                         style="min-width:80px;cursor:pointer;">
                        <div class="rounded-circle bg-white shadow-sm  mb-2 mx-auto d-flex justify-content-between align-items-center" style="width:60px;height:60px;">
                            <img src="${config.CATEGORY_IMAGE_BASE_URL}/${cat.img}"
                                 alt="${cat.category_name}"
                                 onerror="this.onerror=null;this.src='assets/img/fallback.png';">
                        </div>
                          <h6 class="small fw-bold text-dark mb-0"
          style="white-space: normal; word-break: break-word; text-align: center;">
          ${cat.category_name}
      </h6>
                       
                    </div>`;
            });

            container.innerHTML = html;
            updateScrollButtons();

            // Auto select category from URL
            if (urlCategoryId) {
                onCategorySelected(urlCategoryId);
            } else {
                applyPriceFilter(null); // Load all products
            }
        })
        .catch(err => console.error("Categories load error:", err));
}

// =============== APPLY FILTERS (Price + Cut + Sort) ===============
function applyPriceFilter(categoryId = null) {
    const maxPrice = document.getElementById('priceRange')?.value || 99999;
    const sortBy = document.getElementById('sortBy')?.value || '';
    const selectedCuts = [...document.querySelectorAll('.cut-type:checked')].map(cb => cb.value);

    let url = `${config.API_BASE_URL}/filter_product.php?max_price=${maxPrice}&sort=${sortBy}&cuts=${JSON.stringify(selectedCuts)}`;
    if (categoryId) url += `&category_id=${categoryId}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('product-list');
            container.innerHTML = '';

            if (!data.data || data.data.length === 0) {
                container.innerHTML = `
                     <div class="col-12 text-center py-5">
                   <h4>No products available in this category</h4>
                   <p>Explore other categories to find your favorite seafood!</p>
               </div>`;
                return;
            }

            data.data.forEach(product => {
                const discount = Math.round(((product.actual_price - product.offer_price) / product.actual_price) * 100);
                const cardHTML = `
                   <div class="col-md-4 col-sm-6 mb-4" data-aos="fade-up">
                        <a href="productdeteails.html?subcategory_id=${btoa(product.subcategory_id)}" class="text-decoration-none text-dark">
                            <div class="product-card shadow-sm rounded overflow-hidden bg-white h-100">
                                <div class="product-img position-relative">
                                    <span class="discount-badge">${discount}% OFF</span>
                                    <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img1}" class="w-100 img-main" alt="${product.subcategory_name}">
                                    <img src="${config.PRODUCTS_IMAGE_BASE_URL}/${product.img3 || product.img2}" class="w-100 img-hover" alt="">
                                </div>
                                <div class="p-3">
                                    <h6 class="fw-bold mb-1">${product.subcategory_name}</h6>
                                    <p class="small text-muted mb-2">Weight: <b>${product.weight || '500g'}</b></p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="fw-bold text-danger">₹${product.offer_price}</span>
                                            <del class="text-muted small ms-1">₹${product.actual_price}</del>
                                        </div>
                                        <button type="button"
                                            class="btn btn-outline-success btn-sm add-to-cart-listing">
                                           
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>`;
                container.innerHTML += cardHTML;
            });

            // Re-attach Add to Cart buttons
            document.querySelectorAll('.add-to-cart-listing').forEach(btn => {
                btn.onclick = () => addToCartFromListing(btn);
            });
        })
        .catch(err => {
            console.error(err);
             console.error("Error applying filter:", err);
         const productList = document.getElementById('product-list');
         productList.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4 class="text-danger">Error loading products</h4>
                <p>Please try again later.</p>
            </div>`;
        });
}

// =============== CUT TYPES FILTER ===============
function loadCutTypes(categoryId = null) {
    const container = document.getElementById('cutTypeFilters');
    container.innerHTML = '<small class="text-muted">Loading cuts...</small>';

    const defaultCuts = ["Whole", "Boneless", "Curry Cut", "Fillet"];

    if (!categoryId) {
        renderCutCheckboxes(defaultCuts);
        return;
    }

    fetch(`${config.API_BASE_URL}/get_cut_type.php?category_id=${categoryId}`)
        .then(res => res.json())
        .then(res => {
            const cuts = (res.status === "success" && res.data.length > 0) ? res.data : defaultCuts;
            renderCutCheckboxes(cuts);
        })
        .catch(() => renderCutCheckboxes(defaultCuts));

    function renderCutCheckboxes(cuts) {
        container.innerHTML = cuts.map((cut, i) => `
            <div class="form-check">
                <input class="form-check-input cut-type" type="checkbox" id="cut_${i}" value="${cut}">
                <label class="form-check-label" for="cut_${i}">${cut}</label>
            </div>`).join('');

        // Re-bind checkbox events
        document.querySelectorAll('.cut-type').forEach(cb => {
            cb.onchange = () => applyPriceFilter(categoryId);
        });
    }
}

// =============== CATEGORY SELECTION ===============
function onCategorySelected(categoryId) {
    // Update active tab
    document.querySelectorAll('[data-category-id]').forEach(el => el.classList.remove('active'));
    const target = document.querySelector(`[data-category-id="${categoryId || 'all'}"]`) || document.querySelector('[data-category-id="all"]');
    if (target) target.classList.add('active');

    // Reset cut filters
    document.querySelectorAll('.cut-type').forEach(cb => cb.checked = false);

    loadCutTypes(categoryId);
    applyPriceFilter(categoryId);
}

// =============== SCROLL BUTTONS ===============
function scrollCategory(direction) {
    const container = document.getElementById('categoryTabs');
    const amount = direction === 'left' ? -200 : 200;
    container.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
}

function updateScrollButtons() {
    const c = document.getElementById('categoryTabs');
    const l = document.getElementById('scrollLeft');
    const r = document.getElementById('scrollRight');
    if (!c || !l || !r) return;
    l.classList.toggle('d-none', c.scrollLeft <= 10);
    r.classList.toggle('d-none', c.scrollLeft >= (c.scrollWidth - c.clientWidth - 10));
}

// =============== PRICE RANGE UPDATE ===============
function updatePrice(val) {
    document.getElementById('priceValue').textContent = val;
}

// =============== FILTER TOGGLE (Mobile) ===============
function toggleFilter() {
    document.getElementById('filterSidebar')?.classList.toggle('d-none');
}

// =============== DOM READY ===============
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true, mirror: true });

    loadCategories();
    updateCartBadge();

    // Price range live update
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            updatePrice(this.value);
            applyPriceFilter();
        });
    }

    // Sort dropdown
    const sortBy = document.getElementById('sortBy');
    if (sortBy) sortBy.addEventListener('change', () => applyPriceFilter());

    // Scroll buttons
    updateScrollButtons();
    document.getElementById('categoryTabs')?.addEventListener('scroll', updateScrollButtons);
});