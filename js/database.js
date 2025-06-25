// Database configuration
const DB_NAME = 'seaToriDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    USERS: 'users',
    MENU_ITEMS: 'menuItems',
    ORDERS: 'orders',
    CART: 'cart'
};

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject('Database error: ' + event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create users store
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('phone', 'phone', { unique: true });
                userStore.createIndex('isAdmin', 'isAdmin', { unique: false });
            }

            // Create menu items store
            if (!db.objectStoreNames.contains(STORES.MENU_ITEMS)) {
                const menuStore = db.createObjectStore(STORES.MENU_ITEMS, { keyPath: 'id', autoIncrement: true });
                menuStore.createIndex('category', 'category', { unique: false });
                menuStore.createIndex('isPopular', 'isPopular', { unique: false });
            }

            // Create orders store
            if (!db.objectStoreNames.contains(STORES.ORDERS)) {
                const orderStore = db.createObjectStore(STORES.ORDERS, { keyPath: 'id', autoIncrement: true });
                orderStore.createIndex('userId', 'userId', { unique: false });
                orderStore.createIndex('status', 'status', { unique: false });
                orderStore.createIndex('date', 'date', { unique: false });
            }

            // Create cart store
            if (!db.objectStoreNames.contains(STORES.CART)) {
                const cartStore = db.createObjectStore(STORES.CART, { keyPath: 'id', autoIncrement: true });
                cartStore.createIndex('userId', 'userId', { unique: false });
            }
        };
    });
}

// Generic function to add data to a store
async function addData(storeName, data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to get data from a store
async function getData(storeName, id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to get all data from a store
async function getAllData(storeName) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to update data in a store
async function updateData(storeName, data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to delete data from a store
async function deleteData(storeName, id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Initialize default menu items
async function initializeMenuItems() {
    const menuItems = [
        {
            name: 'Филадельфия',
            description: 'Классический ролл с лососем и сливочным сыром',
            price: 450,
            category: 'rolls',
            image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
            isPopular: true,
            ingredients: ['лосось', 'сливочный сыр', 'рис', 'нори'],
            spicy: false,
            vegetarian: false
        },
        {
            name: 'Калифорния',
            description: 'Ролл с крабом, авокадо и икрой тобико',
            price: 380,
            category: 'rolls',
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
            isPopular: true,
            ingredients: ['краб', 'авокадо', 'икра тобико', 'рис', 'нори'],
            spicy: false,
            vegetarian: false
        },
        {
            name: 'Мисо суп',
            description: 'Традиционный японский суп с тофу и водорослями',
            price: 250,
            category: 'soups',
            image: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
            isPopular: true,
            ingredients: ['мисо паста', 'тофу', 'водоросли', 'зеленый лук'],
            spicy: false,
            vegetarian: true
        }
    ];

    for (const item of menuItems) {
        await addData(STORES.MENU_ITEMS, item);
    }
}

// Export functions
export {
    initDB,
    addData,
    getData,
    getAllData,
    updateData,
    deleteData,
    initializeMenuItems,
    STORES
}; 