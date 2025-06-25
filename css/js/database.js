// Инициализация базы данных
const initDatabase = () => {
    const db = openDatabase('sea_tori', '1.0', 'Sea Tori Database', 2 * 1024 * 1024);

    db.transaction(tx => {
        // Создание таблицы пользователей
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT UNIQUE NOT NULL,
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Создание таблицы заказов
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                total_amount DECIMAL(10,2) NOT NULL,
                status TEXT DEFAULT 'new',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Создание таблицы товаров
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT
            )
        `);

        // Создание таблицы элементов заказа
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);
    });

    return db;
};

// Функции для работы с пользователями
const userDB = {
    createUser: (phone, name) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'INSERT INTO users (phone, name) VALUES (?, ?)',
                    [phone, name],
                    (tx, result) => resolve(result.insertId),
                    (tx, error) => reject(error)
                );
            });
        });
    },

    getUserByPhone: (phone) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM users WHERE phone = ?',
                    [phone],
                    (tx, result) => resolve(result.rows.item(0)),
                    (tx, error) => reject(error)
                );
            });
        });
    }
};

// Функции для работы с заказами
const orderDB = {
    createOrder: (userId, items, totalAmount) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
                    [userId, totalAmount],
                    (tx, result) => {
                        const orderId = result.insertId;
                        items.forEach(item => {
                            tx.executeSql(
                                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                                [orderId, item.id, item.quantity, item.price]
                            );
                        });
                        resolve(orderId);
                    },
                    (tx, error) => reject(error)
                );
            });
        });
    },

    getOrders: (userId) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
                    [userId],
                    (tx, result) => {
                        const orders = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            orders.push(result.rows.item(i));
                        }
                        resolve(orders);
                    },
                    (tx, error) => reject(error)
                );
            });
        });
    },

    updateOrderStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE orders SET status = ? WHERE id = ?',
                    [status, orderId],
                    (tx, result) => resolve(result),
                    (tx, error) => reject(error)
                );
            });
        });
    }
};

// Функции для работы с товарами
const productDB = {
    getProducts: (category = null) => {
        return new Promise((resolve, reject) => {
            const db = initDatabase();
            db.transaction(tx => {
                const query = category 
                    ? 'SELECT * FROM products WHERE category = ?'
                    : 'SELECT * FROM products';
                const params = category ? [category] : [];

                tx.executeSql(
                    query,
                    params,
                    (tx, result) => {
                        const products = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            products.push(result.rows.item(i));
                        }
                        resolve(products);
                    },
                    (tx, error) => reject(error)
                );
            });
        });
    }
};

// Экспорт функций
window.db = {
    initDatabase,
    userDB,
    orderDB,
    productDB
};

// Initialize the database
const database = {
    // Инициализация базы данных
    init() {
        // Проверяем, есть ли уже данные в localStorage
        if (!localStorage.getItem('users')) {
            // Создаем админа по умолчанию
            const defaultAdmin = {
                phone: '+7999999999',
                password: 'admin123',
                role: 'admin'
            };
            localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        }
    },

    // Получение всех пользователей
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },

    // Получение пользователя по телефону
    getUserByPhone(phone) {
        const users = this.getAllUsers();
        return users.find(user => user.phone === phone);
    },

    // Добавление нового пользователя
    addUser(user) {
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    },

    // Обновление данных пользователя
    updateUser(phone, newData) {
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.phone === phone);
        if (index !== -1) {
            users[index] = { ...users[index], ...newData };
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        }
        return false;
    },

    // Удаление пользователя
    deleteUser(phone) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(user => user.phone !== phone);
        if (filteredUsers.length !== users.length) {
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            return true;
        }
        return false;
    },

    // Получение всех заказов
    getAllOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    },

    // Получение заказа по ID
    getOrderById(id) {
        const orders = this.getAllOrders();
        return orders.find(order => order.id === id);
    },

    // Добавление нового заказа
    addOrder(order) {
        const orders = this.getAllOrders();
        const newOrder = {
            ...order,
            id: Date.now().toString(),
            status: 'new',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    },

    // Обновление заказа
    updateOrder(id, newData) {
        const orders = this.getAllOrders();
        const index = orders.findIndex(order => order.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...newData };
            localStorage.setItem('orders', JSON.stringify(orders));
            return true;
        }
        return false;
    },

    // Удаление заказа
    deleteOrder(id) {
        const orders = this.getAllOrders();
        const filteredOrders = orders.filter(order => order.id !== id);
        if (filteredOrders.length !== orders.length) {
            localStorage.setItem('orders', JSON.stringify(filteredOrders));
            return true;
        }
        return false;
    },

    // Получение заказов пользователя
    getUserOrders(phone) {
        const orders = this.getAllOrders();
        return orders.filter(order => order.userPhone === phone);
    },

    menu: [
        // ... existing menu items ...
    ]
};

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('seaToriDB', JSON.stringify(database));
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedDB = localStorage.getItem('seaToriDB');
    if (savedDB) {
        Object.assign(database, JSON.parse(savedDB));
    }
}

// Initialize database on load
loadFromLocalStorage();

// Initialize database
database.init();

// Export for use in other files
window.db = database; 