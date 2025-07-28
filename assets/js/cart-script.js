   let cart = [];
        const DELIVERY_CHARGE = 5.00;


          function updateProductTotal(id) {
            const quantityInput = document.querySelector(`.product-quantity[data-id="${id}"]`);
            const totalSpan = document.querySelector(`.product-total[data-id="${id}"]`);
            const price = parseFloat(document.querySelector(`.add-to-cart[data-id="${id}"]`).dataset.price);
            const quantity = parseFloat(quantityInput.value);
            if (totalSpan && !isNaN(quantity) && !isNaN(price)) {
                totalSpan.textContent = `₹`+(price * quantity).toFixed(2);
            }
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
            const priceElement = document.getElementById("totalPrice");
            
            cartItems.innerHTML = '';
            let subtotal = 0;
            let totalQuantity = 0;

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
                   const quantity = parseFloat(item.quantity);  
                    subtotal += item.price * item.quantity;
                   totalQuantity += quantity;
                    cartItems.innerHTML += `
                        <div class="cart-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6>${item.name}</h6>
                                <p>$${item.price} x ${item.quantity}</p>
                            </div>
                            <div class="quantity-control">
                                <button class="btn btn-outline-secondary btn-sm cart-decrement" data-id="${item.id}">-</button>
                                <input type="number" class="form-control cart-quantity" data-id="${item.id}" value="${item.quantity}" min="1">
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

            // Add event listeners for cart quantity controls
            document.querySelectorAll('.cart-increment').forEach(button => {
                button.addEventListener('click', () => {
                    const id = button.dataset.id;
                    const item = cart.find(item => item.id === id);
                    if (item) {
                        item.quantity ++;
                       
                        updateCart();
                    }
                });
            });

            document.querySelectorAll('.cart-decrement').forEach(button => {
                button.addEventListener('click', () => {
                    const id = button.dataset.id;
                    const item = cart.find(item => item.id === id);
                    if (item && item.quantity > 1) {
                        item.quantity --;
                      
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
        document.getElementById('cartButton').addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault();
                alert('Your cart is empty!');
                return false;
            }
        });

        // Add to cart with quantity
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
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
                 updateProductTotal(id);
            });
        });

        // Product quantity controls
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
                if (parseInt(input.value) < 1) {
                    input.value = 1;
                     updateProductTotal(id);
                }
            });
        });

        // Proceed to payment
        document.getElementById('proceedToPayment').addEventListener('click', () => {
            if (cart.length === 0) {
                // alert('Cart is empty!');
                return;
            }
            document.querySelector('.payment-section').style.display = 'block';
            document.getElementById('proceedToPayment').style.display = 'none';
        });

        // Send OTP
        document.getElementById('sendOtp').addEventListener('click', () => {
            const phone = document.getElementById('phoneNumber').value;
            if (phone.length < 10) {
                alert('Please enter a valid phone number');
                return;
            } 
            document.querySelector('.payment-section').style.display = 'none';
            document.querySelector('.otp-section').style.display = 'block';
            // Simulate OTP sending
            alert('OTP sent to ' + phone);
        });

        // Verify OTP
        document.getElementById('verifyOtp').addEventListener('click', () => {
            const otp = document.getElementById('otpInput').value;
            if (otp.length !== 4) {
                alert('Please enter a valid 4-digit OTP');
                return;
            }
            document.querySelector('.otp-section').style.display = 'none';
            document.querySelector('.address-section').style.display = 'block';
            console.log(cart);
            
            // window.location.href = 'http://127.0.0.1:5500/checkout.html';
             
        });

        // document.getElementById('verifyOtp').addEventListener('click', async () => {
        //     const otp = document.getElementById('otpInput').value;
        //     if (otp.length !== 4) {
        //         alert('Please enter a valid 4-digit OTP');
        //         return;
        //     }

        //     try {
        //         // Show a loading state (optional, for better UX)
        //         document.getElementById('verifyOtp').disabled = true;
        //         document.getElementById('verifyOtp').textContent = 'Verifying...';

        //         // Make API call to validate OTP
        //         const response = await fetch('https://your-api-endpoint.com/verify-otp', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },0
        //             body: JSON.stringify({ otp: otp })
        //         });

        //         const data = await response.json();

        //         if (response.ok && data.success) {
        //             // OTP is valid, redirect to the next page
        //             window.location.href = 'https://example.com/next-page'; // Replace with your target URL
        //         } else {
        //             // OTP validation failed
        //             alert(data.message || 'Invalid OTP. Please try again.');
        //         }
        //     } catch (error) {
        //         // Handle network or other errors
        //         alert('Something went wrong. Please try again later.');
        //         console.error('Error:', error);
        //     } finally {. 
        //         // Reset button state
        //         document.getElementById('verifyOtp').disabled = false;
        //         document.getElementById('verifyOtp').textContent = 'Verify OTP';
        //     }
        // });

        // Complete Order
        document.getElementById('completeOrder').addEventListener('click', () => {
            const address = document.getElementById('address').value;
            const paymentMode = document.getElementById('paymentMode').value;
            
            if (!address) {
                alert('Please enter delivery address');
                return;
            }

            alert(`Order placed successfully!\nAddress: ${address}\nPayment Mode: ${paymentMode}`);
            cart = [];
            updateCart();
            document.querySelector('.address-section').style.display = 'none';
            document.getElementById('proceedToPayment').style.display = 'block';
            document.getElementById('cartOffcanvas').classList.remove('show');
        });
        updateCart();