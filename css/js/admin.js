// Управление админ-панелью
const admin = {
    currentStatus: 'all',
    orders: [],

    init: () => {
        // Проверка авторизации
        if (!admin.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }

        // Инициализация фильтров
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                admin.currentStatus = btn.dataset.status;
                admin.filterOrders();
            });
        });

        // Инициализация кнопки выхода
        document.getElementById('logoutBtn').addEventListener('click', () => {
            admin.logout();
        });

        // Загрузка заказов
        admin.loadOrders();
    },

    checkAuth: () => {
        // В реальном приложении здесь должна быть проверка прав администратора
        return true;
    },

    logout: () => {
        window.location.href = 'index.html';
    },

    loadOrders: async () => {
        try {
            const db = window.db.initDatabase();
            db.transaction(tx => {
                tx.executeSql(`
                    SELECT o.*, u.phone, u.name as user_name,
                           GROUP_CONCAT(p.name || ' x' || oi.quantity) as items
                    FROM orders o
                    LEFT JOIN users u ON o.user_id = u.id
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    LEFT JOIN products p ON oi.product_id = p.id
                    GROUP BY o.id
                    ORDER BY o.created_at DESC
                `, [], (tx, result) => {
                    admin.orders = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        admin.orders.push(result.rows.item(i));
                    }
                    admin.renderOrders();
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    },

    filterOrders: () => {
        const filteredOrders = admin.currentStatus === 'all'
            ? admin.orders
            : admin.orders.filter(order => order.status === admin.currentStatus);
        admin.renderOrders(filteredOrders);
    },

    renderOrders: (orders = admin.orders) => {
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">Заказов нет</p>';
            return;
        }

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-card';
            orderElement.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number">Заказ #${order.id}</div>
                        <div class="order-date">${new Date(order.created_at).toLocaleString()}</div>
                        <div>Клиент: ${order.user_name || 'Гость'} (${order.phone})</div>
                    </div>
                    <div class="order-status ${order.status}">
                        ${order.status === 'new' ? 'Новый' : 'Выполнен'}
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.split(',').map(item => `
                        <div class="order-item">
                            <span>${item}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <span>Итого:</span>
                    <span>${order.total_amount} ₽</span>
                </div>
                <div class="order-actions">
                    ${order.status === 'new' ? `
                        <button class="action-btn complete-btn" data-id="${order.id}">
                            Отметить как выполненный
                        </button>
                    ` : ''}
                    <button class="action-btn delete-btn" data-id="${order.id}">
                        Удалить заказ
                    </button>
                </div>
            `;

            // Добавляем обработчики для кнопок
            const completeBtn = orderElement.querySelector('.complete-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    admin.updateOrderStatus(order.id, 'completed');
                });
            }

            const deleteBtn = orderElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
                    admin.deleteOrder(order.id);
                }
            });

            ordersList.appendChild(orderElement);
        });
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const db = window.db.initDatabase();
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE orders SET status = ? WHERE id = ?',
                    [status, orderId],
                    () => {
                        admin.loadOrders();
                    }
                );
            });
        } catch (error) {
            console.error('Ошибка обновления статуса заказа:', error);
            alert('Произошла ошибка при обновлении статуса заказа');
        }
    },

    deleteOrder: async (orderId) => {
        try {
            const db = window.db.initDatabase();
            db.transaction(tx => {
                // Сначала удаляем элементы заказа
                tx.executeSql(
                    'DELETE FROM order_items WHERE order_id = ?',
                    [orderId],
                    () => {
                        // Затем удаляем сам заказ
                        tx.executeSql(
                            'DELETE FROM orders WHERE id = ?',
                            [orderId],
                            () => {
                                admin.loadOrders();
                            }
                        );
                    }
                );
            });
        } catch (error) {
            console.error('Ошибка удаления заказа:', error);
            alert('Произошла ошибка при удалении заказа');
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    admin.init();
}); 