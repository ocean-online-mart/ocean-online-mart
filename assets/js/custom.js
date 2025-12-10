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

// Immediate zoom prevention - runs before page loads
(function() {
    // Prevent zoom immediately
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    // Prevent gesture events immediately
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturechange', function(e) {
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('gestureend', function(e) {
        e.preventDefault();
    }, { passive: false });
})();
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

 
 function getUserLocation() {
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
               alert("Geolocation is not supported by this browser.");
            }
         }    

         function showPosition(position) {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;

           

            fetch(`https://oceanonlinemart.com/panel/ajax/websiteAPI/calculate_shipping.php`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ latitude: lat, longitude: lng })
            })  
            .then(res => res.json())
            .then(data => {
              //  console.log(data);
               
               if (data.status === "not_deliverable") {
                     document.getElementById("location").innerHTML = `
                        🚫 Sorry, we don’t deliver to your location.<br>
                        Location: ${data.city}, ${data.state}<br>
                        
                     `;
               } else {
                     localStorage.setItem("deliveryCost" , data.shippingCost);
                     document.getElementById("location").innerHTML = `Delivery in ${data.deliveryTimeMinutes} minutes!`
                     document.getElementById("delivery-info").innerHTML = `
                     ${data.city}, ${data.state}`;
               }
            });
         }

         function showError(error) {
            switch(error.code) {
               case error.PERMISSION_DENIED:
                     alert("User denied the request for Geolocation.");
                     break;
               case error.POSITION_UNAVAILABLE:
                     alert("Location information is unavailable.");
                     break;
               case error.TIMEOUT:
                     alert("The request to get user location timed out.");
                     break;
            }
         }

document.addEventListener('DOMContentLoaded', () => {
    getUserLocation();
    const cartCount = localStorage.getItem('updatedCount');
        if (cartCount > 0 ) {
          document.getElementById('cartCount').innerHTML = cartCount; 
            document.querySelector('.mobile-cart').innerHTML = cartCount;
        } else {
          // console.log('cart is empty');
        }

  });

// add to offcanva script


      
                