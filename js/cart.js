import { addData, getData, getAllData, updateData, deleteData, STORES } from './database.js';

class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    async init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const cartItems = await getAllData(STORES.CART);
            this.items = cartItems.filter(item => item.userId === currentUser.id);
            this.calculateTotal();
            this.updateCartUI();
        }
    }

    async addItem(menuItem, quantity = 1) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
            return;
        }

        const existingItem = this.items.find(item => item.menuItemId === menuItem.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            await updateData(STORES.CART, existingItem);
        } else {
            const cartItem = {
                userId: currentUser.id,
                menuItemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity,
                image: menuItem.image
            };
            const id = await addData(STORES.CART, cartItem);
            cartItem.id = id;
            this.items.push(cartItem);
        }

        this.calculateTotal();
        this.updateCartUI();
    }

    async removeItem(itemId) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            await deleteData(STORES.CART, itemId);
            this.items.splice(itemIndex, 1);
            this.calculateTotal();
            this.updateCartUI();
        }
    }

    async updateQuantity(itemId, quantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            await updateData(STORES.CART, item);
            this.calculateTotal();
            this.updateCartUI();
        }
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const cartItems = document.getElementById('cartItems');
        
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }

        if (cartTotal) {
            cartTotal.textContent = `${this.total} ₽`;
        }

        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.price} ₽</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" value="${item.quantity}" min="1" max="99">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    <button class="remove-item">&times;</button>
                </div>
            `).join('');

            // Add event listeners for quantity controls
            cartItems.querySelectorAll('.quantity-controls input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                    const quantity = parseInt(e.target.value);
                    this.updateQuantity(itemId, quantity);
                });
            });

            cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.target.parentElement.querySelector('input');
                    const currentValue = parseInt(input.value);
                    const newValue = e.target.classList.contains('plus') ? currentValue + 1 : currentValue - 1;
                    
                    if (newValue >= 1 && newValue <= 99) {
                        input.value = newValue;
                        const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                        this.updateQuantity(itemId, newValue);
                    }
                });
            });

            cartItems.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                    this.removeItem(itemId);
                });
            });
        }
    }

    async clearCart() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            for (const item of this.items) {
                await deleteData(STORES.CART, item.id);
            }
            this.items = [];
            this.calculateTotal();
            this.updateCartUI();
        }
    }
}

// Create and export cart instance
const cart = new Cart();
export default cart; 