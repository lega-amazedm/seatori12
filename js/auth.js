import { addData, getData, getAllData, updateData, deleteData, STORES } from './database.js';

document.addEventListener('DOMContentLoaded', function() {
    // Получаем все необходимые элементы
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const closeModalBtn = document.querySelector('.close-modal');
    const captchaImg = document.getElementById('captchaImg');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const userProfile = document.querySelector('.user-profile');
    const adminPanel = document.querySelector('.admin-panel');
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    let currentCaptcha = '';

    // Инициализация администратора
    async function initializeAdmin() {
        try {
            const users = await getAllData(STORES.USERS);
            const adminExists = users.some(user => user.isAdmin);
            
            if (!adminExists) {
                const admin = {
                    phone: '+7 (999) 123-45-67',
                    password: 'admin123',
                    isAdmin: true,
                    orders: []
                };
                await addData(STORES.USERS, admin);
            }
        } catch (error) {
            console.error('Error initializing admin:', error);
        }
    }

    // Функция для обновления видимости профиля
    function updateProfileVisibility() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            if (currentUser.isAdmin) {
                adminPanel.style.display = 'block';
            } else {
                adminPanel.style.display = 'none';
            }
            // Обновляем отображение телефона в профиле
            document.querySelector('.user-phone').textContent = currentUser.phone;
            document.querySelector('.profile-info .phone').textContent = currentUser.phone;
        } else {
            loginBtn.style.display = 'block';
            userProfile.style.display = 'none';
            adminPanel.style.display = 'none';
        }
    }

    // Открытие модального окна
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
        showLoginForm();
    });

    // Закрытие модального окна
    closeModalBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Закрытие по клику вне модального окна
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // Переключение между формами
    loginTab.addEventListener('click', showLoginForm);
    registerTab.addEventListener('click', showRegisterForm);

    function showLoginForm() {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    }

    function showRegisterForm() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        generateCaptcha();
    }

    // Генерация капчи
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentCaptcha = captcha;
        captchaImg.src = `https://dummyimage.com/200x80/000/fff&text=${captcha}`;
    }

    // Обновление капчи
    refreshCaptchaBtn.addEventListener('click', generateCaptcha);

    // Обработка входа
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const phone = this.querySelector('input[type="tel"]').value;
        const password = this.querySelector('input[type="password"]').value;

        try {
            const users = await getAllData(STORES.USERS);
            const user = users.find(u => u.phone === phone && u.password === password);

            if (user) {
                // Сохраняем текущего пользователя
                localStorage.setItem('currentUser', JSON.stringify(user));
                authModal.style.display = 'none';
                updateProfileVisibility();
                alert('Вход выполнен успешно!');
            } else {
                alert('Неверный номер телефона или пароль');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Произошла ошибка при входе');
        }
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const phone = this.querySelector('input[type="tel"]').value;
        const password = this.querySelector('input[type="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
        const captcha = this.querySelector('input[name="captcha"]').value;

        // Проверка паролей
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        // Проверка капчи
        if (captcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
            alert('Неверная капча');
            generateCaptcha();
            return;
        }

        try {
            // Получаем существующих пользователей
            const users = await getAllData(STORES.USERS);

            // Проверка на существующий номер телефона
            if (users.some(u => u.phone === phone)) {
                alert('Пользователь с таким номером телефона уже существует');
                return;
            }

            // Создаем нового пользователя
            const newUser = {
                phone,
                password,
                isAdmin: false,
                orders: []
            };

            // Добавляем пользователя в базу данных
            const userId = await addData(STORES.USERS, newUser);
            newUser.id = userId;

            // Автоматически входим в систему
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            authModal.style.display = 'none';
            updateProfileVisibility();
            alert('Регистрация успешна!');
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Произошла ошибка при регистрации');
        }
    });

    // Обработка выхода
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        updateProfileVisibility();
        profileDropdown.classList.remove('active');
    });

    // Обработка клика по кнопке профиля
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    // Закрытие выпадающего меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // Инициализация при загрузке страницы
    initializeAdmin();
    updateProfileVisibility();
}); 