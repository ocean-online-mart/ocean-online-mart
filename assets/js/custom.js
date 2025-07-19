/*
Template Name: Eatsie - Pick Up & Delivery Food Template
Author: Askbootstrap
Author URI: https://themeforest.net/user/askbootstrap
Version: 0.1
*/

/*
- Add Cart
- Tooltip
*/

(function($) {
  "use strict"; // Start of use strict

  // Add Cart
  $('.minus').click(function() {
      var $input = $(this).parent().find('.box');
      var count = parseInt($input.val()) - 1;
      count = count < 1 ? 1 : count;
      $input.val(count);
      $input.change();
      return false;
  });
  $('.plus').click(function() {
      var $input = $(this).parent().find('.box');
      $input.val(parseInt($input.val()) + 1);
      $input.change();
      return false;
  });

  // Tooltip
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

})(jQuery); // End of use strict



// for search listing

const products = [
  { name: "Fresh Prawns", price: "$12.99", image: "assets/img/1.png" },
  { name: "Live Crab", price: "$9.99", image: "assets/img/3.png" },
  { name: "Fish Curry Pack", price: "$7.99", image: "assets/img/4.png" },
  { name: "Organic Spices", price: "$5.99", image: "assets/img/2.png" },
  { name: "Salmon Fillet", price: "$14.99", image: "assets/img/5.png" },
  { name: "Fresh Squid", price: "$11.99", image: "assets/img/6.png" },
];

document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
});

document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  renderProducts(filtered);
  document.getElementById('productList').scrollIntoView({ behavior: 'smooth' });
});

function renderProducts(list) {
  const container = document.getElementById('productList');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No products found.</p>';
    return;
  }
  list.forEach(p => {
    container.innerHTML += `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="card h-100 shadow-sm">
          <img src="${p.image}" class="card-img-top" alt="${p.name}">
          <div class="card-body text-center">
            <h6 class="card-title mb-1">${p.name}</h6>
            <p class="text-muted small mb-0">${p.price}</p>
          </div>
        </div>
      </div>`;
  });
}


// deteils page
