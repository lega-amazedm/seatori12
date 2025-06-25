// Управление аутентификацией
const auth = {
    currentUser: null,

    init: () => {
        // DOM Elements
        const authModal = document.querySelector('.auth-modal');
        const authBtn = document.querySelector('.auth-btn');
        const closeModal = document.querySelector('.close-modal');
        const authTabs = document.querySelectorAll('.auth-tab');
        const authForms = document.querySelectorAll('.auth-form');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const captchaImage = document.getElementById('captcha-image');
        const refreshCaptcha = document.getElementById('refresh-captcha');
        const userProfile = document.querySelector('.user-profile');
        const profileBtn = document.querySelector('.profile-btn');
        const profileDropdown = document.querySelector('.profile-dropdown');
        const userPhone = document.querySelector('.user-phone');
        const profilePhone = document.querySelector('.profile-info .phone');
        const logoutBtn = document.querySelector('.profile-action-btn.logout');

        // Инициализация базы данных
        database.init();

        // Initialize
        function init() {
            // Check if user is already logged in
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateAuthUI();
            }

            // Generate initial captcha
            generateCaptcha();
        }

        // Event Listeners
        authBtn.addEventListener('click', () => {
            authModal.classList.add('active');
        });

        closeModal.addEventListener('click', () => {
            authModal.classList.remove('active');
        });

        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                
                // Обновляем активные классы вкладок
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Показываем соответствующую форму
                authForms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${tabName}-form`) {
                        form.classList.add('active');
                    }
                });
            });
        });

        document.getElementById('refresh-captcha').addEventListener('click', refreshCaptcha);

        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegistration);

        // Функция для обновления видимости профиля
        function updateProfileVisibility() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                authBtn.style.display = 'none';
                userProfile.classList.add('active');
                userPhone.textContent = currentUser.phone;
                profilePhone.textContent = currentUser.phone;
            } else {
                authBtn.style.display = 'block';
                userProfile.classList.remove('active');
                profileDropdown.classList.remove('active');
            }
        }

        // Функция для обновления видимости админ-панели
        function updateAdminLinkVisibility() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const adminLink = document.querySelector('a[href="admin.html"]');
            if (currentUser && currentUser.phone === '+7999999999') {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }

        // Генерация капчи
        function generateCaptcha() {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let captcha = '';
            for (let i = 0; i < 6; i++) {
                captcha += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return captcha;
        }

        // Обновление капчи
        function updateCaptcha() {
            const captcha = generateCaptcha();
            captchaImage.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width="150" height="50" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#f0f0f0"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" dy=".3em">${captcha}</text>
                </svg>
            `)}`;
            return captcha;
        }

        let currentCaptcha = updateCaptcha();

        // Обновление капчи по клику
        refreshCaptcha.addEventListener('click', () => {
            currentCaptcha = updateCaptcha();
        });

        // Обработка входа
        async function handleLogin(e) {
            e.preventDefault();
            
            const phone = document.getElementById('login-phone').value;
            const password = document.getElementById('login-password').value;
            
            // Валидация телефона
            if (!phone.match(/^\+7\d{10}$/)) {
                alert('Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX');
                return;
            }
            
            // Проверка пользователя
            const user = database.getUserByPhone(phone);
            if (!user) {
                alert('Пользователь не найден');
                return;
            }
            
            if (user.password !== password) {
                alert('Неверный пароль');
                return;
            }
            
            // Сохраняем текущего пользователя
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Обновляем интерфейс
            updateAdminLinkVisibility();
            authModal.classList.remove('active');
            updateProfileVisibility();
            alert('Вход выполнен успешно!');
            
            // Очищаем форму
            loginForm.reset();
        }

        // Обработка регистрации
        async function handleRegistration(e) {
            e.preventDefault();
            
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const captcha = document.getElementById('captcha').value;
            
            // Валидация телефона
            if (!phone.match(/^\+7\d{10}$/)) {
                alert('Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX');
                return;
            }
            
            // Проверка пароля
            if (password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            // Проверка паролей
            if (password !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }
            
            // Проверка капчи
            if (captcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
                alert('Неверный код капчи');
                return;
            }
            
            // Проверка существования пользователя
            if (database.getUserByPhone(phone)) {
                alert('Пользователь с таким номером телефона уже существует');
                return;
            }
            
            // Создание нового пользователя
            const newUser = {
                phone,
                password,
                role: 'user'
            };
            
            database.addUser(newUser);
            
            // Сохраняем текущего пользователя
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Обновляем интерфейс
            updateAdminLinkVisibility();
            authModal.classList.remove('active');
            updateProfileVisibility();
            alert('Регистрация успешна!');
            
            // Очищаем форму
            registerForm.reset();
        }

        // Обработка клика по кнопке профиля
        profileBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
        });

        // Закрытие выпадающего меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // Обработка выхода
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            updateProfileVisibility();
            updateAdminLinkVisibility();
            profileDropdown.classList.remove('active');
            alert('Вы успешно вышли из аккаунта');
        });
    },

    logout: () => {
        auth.currentUser = null;
        localStorage.removeItem('currentUser');
        auth.updateUI();
    },

    updateUI: () => {
        const authBtn = document.querySelector('.auth-btn');
        if (auth.currentUser) {
            authBtn.textContent = auth.currentUser.phone;
            if (auth.currentUser.isAdmin) {
                showAdminLink();
            } else {
                hideAdminLink();
            }
        } else {
            authBtn.textContent = 'Войти';
            hideAdminLink();
        }
    },

    checkAuth: () => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            auth.currentUser = JSON.parse(savedUser);
            auth.updateUI();
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    auth.checkAuth();
    updateAdminLinkVisibility();
    generateCaptcha();
});

// Functions
function showAdminLink() {
    adminLink.style.display = 'block';
}

function hideAdminLink() {
    adminLink.style.display = 'none';
} 