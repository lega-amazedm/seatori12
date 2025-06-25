// Управление корзиной
const cart = {
    items: [],
    total: 0,

    init: () => {
        // Инициализация модального окна корзины
        const cartModal = document.getElementById('cartModal');
        const cartBtn = document.getElementById('cartBtn');
        const closeBtn = cartModal.querySelector('.close');
        const checkoutBtn = document.getElementById('checkoutBtn');

        cartBtn.addEventListener('click', () => {
            cartModal.style.display = 'block';
            cart.updateCartDisplay();
        });

        closeBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
        });

        checkoutBtn.addEventListener('click', () => {
            cart.checkout();
        });

        // Загрузка корзины из localStorage
        cart.loadCart();
    },

    addItem: (product) => {
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        cart.updateTotal();
        cart.saveCart();
        cart.updateCartCount();
    },

    removeItem: (productId) => {
        cart.items = cart.items.filter(item => item.id !== productId);
        cart.updateTotal();
        cart.saveCart();
        cart.updateCartCount();
        cart.updateCartDisplay();
    },

    updateQuantity: (productId, quantity) => {
        const item = cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                cart.removeItem(productId);
            } else {
                cart.updateTotal();
                cart.saveCart();
                cart.updateCartCount();
                cart.updateCartDisplay();
            }
        }
    },

    updateTotal: () => {
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateCartCount: () => {
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    },

    updateCartDisplay: () => {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        cartItems.innerHTML = '';
        
        if (cart.items.length === 0) {
            cartItems.innerHTML = '<p>Корзина пуста</p>';
        } else {
            cart.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price} ₽ x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">×</button>
                    </div>
                `;
                cartItems.appendChild(itemElement);
            });

            // Добавляем обработчики событий для кнопок
            cartItems.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    const item = cart.items.find(item => item.id === id);
                    if (item) {
                        cart.updateQuantity(id, item.quantity - 1);
                    }
                });
            });

            cartItems.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    const item = cart.items.find(item => item.id === id);
                    if (item) {
                        cart.updateQuantity(id, item.quantity + 1);
                    }
                });
            });

            cartItems.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    cart.removeItem(id);
                });
            });
        }

        cartTotal.textContent = cart.total.toFixed(2);
    },

    saveCart: () => {
        localStorage.setItem('cart', JSON.stringify(cart.items));
    },

    loadCart: () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart.items = JSON.parse(savedCart);
            cart.updateTotal();
            cart.updateCartCount();
        }
    },

    clearCart: () => {
        cart.items = [];
        cart.total = 0;
        cart.saveCart();
        cart.updateCartCount();
        cart.updateCartDisplay();
    },

    checkout: async () => {
        if (!auth.currentUser) {
            alert('Пожалуйста, войдите в систему для оформления заказа');
            document.getElementById('authModal').style.display = 'block';
            return;
        }

        if (cart.items.length === 0) {
            alert('Корзина пуста');
            return;
        }

        try {
            const orderId = await db.orderDB.createOrder(
                auth.currentUser.id,
                cart.items,
                cart.total
            );

            alert('Заказ успешно оформлен!');
            cart.clearCart();
            document.getElementById('cartModal').style.display = 'none';
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте снова.');
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    cart.init();
}); 