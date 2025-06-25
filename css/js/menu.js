// Управление меню
const menu = {
    currentCategory: 'all',
    products: [],

    init: () => {
        // Инициализация фильтров категорий
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                menu.currentCategory = btn.dataset.category;
                menu.filterProducts();
            });
        });

        // Загрузка продуктов
        menu.loadProducts();
    },

    loadProducts: async () => {
        try {
            // Загрузка продуктов из базы данных
            const products = await db.productDB.getProducts();
            menu.products = products;
            menu.renderProducts();
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            // Если база данных пуста, добавляем тестовые данные
            menu.addTestProducts();
        }
    },

    addTestProducts: async () => {
        const testProducts = [
            {
                name: 'Филадельфия',
                description: 'Лосось, сливочный сыр, огурец',
                price: 350,
                category: 'rolls',
                image_url: 'images/philadelphia.jpg'
            },
            {
                name: 'Калифорния',
                description: 'Краб, авокадо, огурец',
                price: 320,
                category: 'rolls',
                image_url: 'images/california.jpg'
            },
            {
                name: 'Лосось',
                description: 'Свежий лосось, рис, нори',
                price: 280,
                category: 'sushi',
                image_url: 'images/salmon.jpg'
            },
            {
                name: 'Мисо-суп',
                description: 'Традиционный японский суп с тофу',
                price: 180,
                category: 'soups',
                image_url: 'images/miso.jpg'
            },
            {
                name: 'Зеленый чай',
                description: 'Традиционный японский зеленый чай',
                price: 120,
                category: 'drinks',
                image_url: 'images/green-tea.jpg'
            }
        ];

        // Добавление тестовых продуктов в базу данных
        const db = window.db.initDatabase();
        db.transaction(tx => {
            testProducts.forEach(product => {
                tx.executeSql(
                    'INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
                    [product.name, product.description, product.price, product.category, product.image_url]
                );
            });
        });

        // Загрузка продуктов после добавления тестовых данных
        menu.loadProducts();
    },

    filterProducts: () => {
        const filteredProducts = menu.currentCategory === 'all'
            ? menu.products
            : menu.products.filter(product => product.category === menu.currentCategory);
        menu.renderProducts(filteredProducts);
    },

    renderProducts: (products = menu.products) => {
        const menuGrid = document.getElementById('menuGrid');
        menuGrid.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'menu-item';
            productElement.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="menu-item-image">
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${product.name}</h3>
                        <span class="menu-item-price">${product.price} ₽</span>
                    </div>
                    <p class="menu-item-description">${product.description}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        Добавить в корзину
                    </button>
                </div>
            `;

            // Добавляем обработчик для кнопки "Добавить в корзину"
            const addToCartBtn = productElement.querySelector('.add-to-cart-btn');
            addToCartBtn.addEventListener('click', () => {
                cart.addItem(product);
            });

            menuGrid.appendChild(productElement);
        });
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    menu.init();
});

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    // Добавляем обработчики событий для кнопок фильтрации
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Удаляем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            // Фильтруем элементы меню
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'all' || category === itemCategory) {
                    item.style.display = 'block';
                    // Добавляем анимацию появления
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Добавляем эффект при наведении на элементы меню
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px)';
            item.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}); 