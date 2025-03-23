/**
 * auth.js - Firebase身份验证模块
 * 
 * 功能和作用：
 * 1. 管理用户登录、注册和身份验证状态
 * 2. 提供不同的登录方式（邮箱密码、Google账号、手机号码、匿名登录）
 * 3. 管理用户登出功能
 * 4. 处理身份验证错误和反馈
 * 5. 监控用户登录状态变化
 * 
 * 主要职责：
 * - 处理用户注册
 * - 处理用户登录（邮箱密码、第三方登录、手机登录、匿名登录）
 * - 处理用户登出
 * - 监控登录状态
 * - 提供错误处理和用户反馈
 * 
 * 依赖模块：
 * - firebase-config.js：Firebase配置和初始化
 * 
 * 最后更新：2024-06-08 - 添加电话验证和匿名登录功能
 */

// 身份验证模块
const AuthModule = {
    /**
     * 当前登录的用户
     */
    currentUser: null,

    /**
     * 电话验证相关变量
     */
    recaptchaVerifier: null,
    confirmationResult: null,
    phoneVerificationTimer: null,

    /**
     * 初始化身份验证功能
     */
    init: function() {
        // 绑定登录和注册表单事件
        this.bindEvents();
        
        // 监听身份验证状态变化
        this.monitorAuthState();
        
        console.log('身份验证模块已初始化');
    },
    
    /**
     * 绑定身份验证相关事件
     */
    bindEvents: function() {
        // 登录表单提交
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        } else {
            console.error('未找到登录表单元素');
        }
        
        // 注册表单提交
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Google登录按钮点击
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                this.handleGoogleLogin();
            });
        }
        
        // 手机号码登录按钮点击
        const showPhoneLoginBtn = document.getElementById('showPhoneLoginBtn');
        if (showPhoneLoginBtn) {
            showPhoneLoginBtn.addEventListener('click', () => {
                this.showPhoneLoginForm();
            });
        }
        
        // 返回登录页面按钮点击
        const backToLoginBtn = document.getElementById('backToLoginBtn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.showMainLoginForm();
            });
        }
        
        // 发送验证码按钮点击
        const sendCodeBtn = document.getElementById('sendCodeBtn');
        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', () => {
                this.sendVerificationCode();
            });
        }
        
        // 验证码验证按钮点击
        const verifyCodeBtn = document.getElementById('verifyCodeBtn');
        if (verifyCodeBtn) {
            verifyCodeBtn.addEventListener('click', () => {
                this.verifyPhoneCode();
            });
        }
        
        // 匿名登录按钮点击
        const anonymousLoginBtn = document.getElementById('anonymousLoginBtn');
        if (anonymousLoginBtn) {
            anonymousLoginBtn.addEventListener('click', () => {
                this.handleAnonymousLogin();
            });
        }
        
        // 登出按钮点击
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // 切换注册表单显示按钮
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                document.getElementById('loginContainer').classList.add('hidden');
                document.getElementById('registerContainer').classList.remove('hidden');
            });
        }
        
        // 切换登录表单显示按钮
        const showLoginBtn = document.getElementById('showLoginBtn');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                document.getElementById('registerContainer').classList.add('hidden');
                document.getElementById('loginContainer').classList.remove('hidden');
            });
        }
        
        // 忘记密码链接
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
        
        console.log('身份验证事件已绑定');
    },
    
    /**
     * 处理邮箱密码登录
     */
    handleLogin: async function() {
        // 获取表单数据
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // 显示加载提示
        this.showAuthMessage('正在登录，请稍候...', 'info');
        
        try {
            // 使用Firebase身份验证进行登录
            const userCredential = await FirebaseModule.auth.signInWithEmailAndPassword(email, password);
            
            // 登录成功
            this.showAuthMessage('登录成功！', 'success');
            this.hideAuthForms();
            
            // 更新当前用户
            this.currentUser = userCredential.user;
            
        } catch (error) {
            // 处理登录错误
            console.error('登录错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 处理用户注册
     */
    handleRegister: async function() {
        // 获取表单数据
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证密码一致性
        if (password !== confirmPassword) {
            this.showAuthMessage('两次输入的密码不一致', 'error');
            return;
        }
        
        // 显示加载提示
        this.showAuthMessage('正在创建账号，请稍候...', 'info');
        
        try {
            // 使用Firebase身份验证创建新用户
            const userCredential = await FirebaseModule.auth.createUserWithEmailAndPassword(email, password);
            
            // 注册成功
            this.showAuthMessage('账号创建成功！', 'success');
            this.hideAuthForms();
            
            // 更新当前用户
            this.currentUser = userCredential.user;
            
        } catch (error) {
            // 处理注册错误
            console.error('注册错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 处理Google登录
     */
    handleGoogleLogin: async function() {
        // 显示加载提示
        this.showAuthMessage('正在使用Google账号登录，请稍候...', 'info');
        
        try {
            // 使用Firebase身份验证进行Google登录
            const result = await FirebaseModule.auth.signInWithPopup(FirebaseModule.googleProvider);
            
            // Google登录成功
            this.showAuthMessage('Google登录成功！', 'success');
            this.hideAuthForms();
            
            // 更新当前用户
            this.currentUser = result.user;
            
        } catch (error) {
            // 处理Google登录错误
            console.error('Google登录错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 显示手机登录表单
     */
    showPhoneLoginForm: function() {
        // 隐藏其他表单
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
        
        // 显示手机登录表单
        document.getElementById('phoneLoginContainer').classList.remove('hidden');
        
        // 显示第一步，隐藏第二步
        document.getElementById('phoneStep1').classList.remove('hidden');
        document.getElementById('phoneStep2').classList.add('hidden');
        
        // 初始化reCAPTCHA验证
        this.initRecaptcha();
    },
    
    /**
     * 显示主登录表单（返回按钮点击后）
     */
    showMainLoginForm: function() {
        // 隐藏其他表单
        document.getElementById('phoneLoginContainer').classList.add('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
        
        // 显示主登录表单
        document.getElementById('loginContainer').classList.remove('hidden');
        
        // 清除手机验证的计时器
        if (this.phoneVerificationTimer) {
            clearInterval(this.phoneVerificationTimer);
        }
    },
    
    /**
     * 初始化reCAPTCHA验证
     */
    initRecaptcha: function() {
        // 清除已有的reCAPTCHA
        const recaptchaContainer = document.getElementById('recaptchaContainer');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
        }
        
        try {
            // 创建reCAPTCHA验证器
            this.recaptchaVerifier = new FirebaseModule.RecaptchaVerifier('recaptchaContainer', {
                'size': 'normal',
                'callback': (response) => {
                    // reCAPTCHA验证成功，启用发送按钮
                    const sendCodeBtn = document.getElementById('sendCodeBtn');
                    if (sendCodeBtn) {
                        sendCodeBtn.disabled = false;
                    }
                },
                'expired-callback': () => {
                    // reCAPTCHA验证过期，禁用发送按钮
                    const sendCodeBtn = document.getElementById('sendCodeBtn');
                    if (sendCodeBtn) {
                        sendCodeBtn.disabled = true;
                    }
                    this.showAuthMessage('验证已过期，请重新点击验证', 'error');
                }
            });
            
            // 渲染reCAPTCHA
            this.recaptchaVerifier.render();
            
        } catch (error) {
            console.error('reCAPTCHA初始化错误:', error);
            this.showAuthMessage('验证码初始化失败，请刷新页面重试', 'error');
        }
    },
    
    /**
     * 发送手机验证码
     */
    sendVerificationCode: async function() {
        // 获取手机号码
        const countryCode = document.getElementById('phoneCountryCode').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!phoneNumber) {
            this.showAuthMessage('请输入手机号码', 'error');
            return;
        }
        
        // 完整的手机号码，包含国家代码
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;
        
        // 显示加载提示
        this.showAuthMessage('正在发送验证码，请稍候...', 'info');
        
        try {
            // 发送验证码
            this.confirmationResult = await FirebaseModule.auth.signInWithPhoneNumber(fullPhoneNumber, this.recaptchaVerifier);
            
            // 发送成功，显示第二步
            document.getElementById('phoneStep1').classList.add('hidden');
            document.getElementById('phoneStep2').classList.remove('hidden');
            
            // 显示成功消息
            this.showAuthMessage('验证码发送成功，请查收短信', 'success');
            
            // 启动倒计时
            this.startVerificationTimer();
            
        } catch (error) {
            console.error('发送验证码错误:', error);
            this.handleAuthError(error);
            
            // 重置reCAPTCHA
            this.initRecaptcha();
        }
    },
    
    /**
     * 启动验证码计时器
     */
    startVerificationTimer: function() {
        let timeLeft = 60;
        const timerElement = document.getElementById('codeTimer');
        
        // 清除已有的计时器
        if (this.phoneVerificationTimer) {
            clearInterval(this.phoneVerificationTimer);
        }
        
        // 设置初始值
        if (timerElement) {
            timerElement.textContent = timeLeft;
        }
        
        // 创建计时器
        this.phoneVerificationTimer = setInterval(() => {
            timeLeft--;
            
            if (timerElement) {
                timerElement.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                // 计时结束，清除计时器
                clearInterval(this.phoneVerificationTimer);
                
                // 返回第一步，允许重新发送
                document.getElementById('phoneStep1').classList.remove('hidden');
                document.getElementById('phoneStep2').classList.add('hidden');
                
                // 重置reCAPTCHA
                this.initRecaptcha();
            }
        }, 1000);
    },
    
    /**
     * 验证手机验证码
     */
    verifyPhoneCode: async function() {
        // 获取验证码
        const verificationCode = document.getElementById('verificationCode').value;
        
        if (!verificationCode) {
            this.showAuthMessage('请输入验证码', 'error');
            return;
        }
        
        // 显示加载提示
        this.showAuthMessage('正在验证，请稍候...', 'info');
        
        try {
            // 验证验证码
            const result = await this.confirmationResult.confirm(verificationCode);
            
            // 验证成功
            this.showAuthMessage('手机验证成功！', 'success');
            this.hideAuthForms();
            
            // 更新当前用户
            this.currentUser = result.user;
            
            // 清除计时器
            if (this.phoneVerificationTimer) {
                clearInterval(this.phoneVerificationTimer);
            }
            
        } catch (error) {
            console.error('验证码验证错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 处理匿名登录
     */
    handleAnonymousLogin: async function() {
        // 显示加载提示
        this.showAuthMessage('正在以访客身份登录，请稍候...', 'info');
        
        try {
            // 使用Firebase身份验证进行匿名登录
            const result = await FirebaseModule.auth.signInAnonymously();
            
            // 匿名登录成功
            this.showAuthMessage('访客登录成功！', 'success');
            this.hideAuthForms();
            
            // 更新当前用户
            this.currentUser = result.user;
            
        } catch (error) {
            // 处理匿名登录错误
            console.error('匿名登录错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 处理用户登出
     */
    handleLogout: async function() {
        try {
            // 使用Firebase身份验证登出
            await FirebaseModule.auth.signOut();
            
            // 登出成功
            this.showAuthMessage('已成功登出', 'success');
            
            // 清除当前用户
            this.currentUser = null;
            
            // 显示登录表单
            this.showAuthForms();
            
        } catch (error) {
            // 处理登出错误
            console.error('登出错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 处理忘记密码
     */
    handleForgotPassword: async function() {
        // 获取邮箱
        const email = document.getElementById('loginEmail').value;
        
        if (!email) {
            this.showAuthMessage('请输入邮箱地址', 'error');
            return;
        }
        
        try {
            // 发送密码重置邮件
            await FirebaseModule.auth.sendPasswordResetEmail(email);
            
            // 发送成功
            this.showAuthMessage('密码重置邮件已发送，请查收', 'success');
            
        } catch (error) {
            // 处理发送重置邮件错误
            console.error('发送重置邮件错误:', error);
            this.handleAuthError(error);
        }
    },
    
    /**
     * 监控身份验证状态
     */
    monitorAuthState: function() {
        // 使用Firebase身份验证监听用户状态变化
        FirebaseModule.auth.onAuthStateChanged((user) => {
            if (user) {
                // 用户已登录
                this.currentUser = user;
                this.hideAuthForms();
                
                // 更新用户显示信息
                this.updateUserDisplay(user);
                
                console.log('用户已登录:', user.isAnonymous ? '匿名用户' : (user.email || user.phoneNumber));
            } else {
                // 用户未登录
                this.currentUser = null;
                this.showAuthForms();
                
                console.log('用户未登录，显示登录界面');
            }
        });
    },
    
    /**
     * 更新用户显示信息
     * @param {Object} user - 登录的用户对象
     */
    updateUserDisplay: function(user) {
        const userDisplayElement = document.getElementById('userDisplay');
        if (userDisplayElement) {
            userDisplayElement.classList.remove('hidden');
            
            // 显示用户标识（邮箱、手机号或匿名）
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                if (user.isAnonymous) {
                    userEmailElement.textContent = '匿名用户';
                } else if (user.email) {
                    userEmailElement.textContent = user.email;
                } else if (user.phoneNumber) {
                    userEmailElement.textContent = user.phoneNumber;
                } else {
                    userEmailElement.textContent = '已登录用户';
                }
            }
            
            // 显示用户头像（如果有）
            const userAvatarElement = document.getElementById('userAvatar');
            if (userAvatarElement && user.photoURL) {
                userAvatarElement.src = user.photoURL;
            }
        }
    },
    
    /**
     * 处理身份验证错误
     * @param {Error} error - 错误对象
     */
    handleAuthError: function(error) {
        let errorMessage = '身份验证出现问题，请稍后再试';
        
        // 根据错误代码显示不同的错误信息
        switch(error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = '邮箱或密码错误，请重试';
                break;
                
            case 'auth/invalid-email':
                errorMessage = '邮箱格式不正确';
                break;
                
            case 'auth/weak-password':
                errorMessage = '密码强度不够，请使用更复杂的密码';
                break;
                
            case 'auth/email-already-in-use':
                errorMessage = '此邮箱已被使用，请使用其他邮箱或直接登录';
                break;
                
            case 'auth/operation-not-allowed':
                errorMessage = '此登录方式未启用，请联系管理员';
                break;
                
            case 'auth/popup-closed-by-user':
                errorMessage = '登录窗口被关闭，请重试';
                break;
                
            case 'auth/invalid-phone-number':
                errorMessage = '手机号码格式不正确，请检查后重试';
                break;
                
            case 'auth/invalid-verification-code':
                errorMessage = '验证码错误，请重新输入';
                break;
                
            case 'auth/code-expired':
                errorMessage = '验证码已过期，请重新发送';
                break;
                
            case 'auth/too-many-requests':
                errorMessage = '请求次数过多，请稍后再试';
                break;
                
            default:
                errorMessage = `身份验证错误: ${error.message}`;
        }
        
        // 显示错误信息
        this.showAuthMessage(errorMessage, 'error');
    },
    
    /**
     * 显示身份验证消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型（success/error/info）
     */
    showAuthMessage: function(message, type) {
        const authMessageElement = document.getElementById('authMessage');
        if (authMessageElement) {
            // 清除之前的类型
            authMessageElement.classList.remove('message--success', 'message--error', 'message--info');
            
            // 添加新的类型
            authMessageElement.classList.add(`message--${type}`);
            
            // 设置消息内容
            authMessageElement.textContent = message;
            
            // 显示消息
            authMessageElement.classList.remove('hidden');
            
            // 如果是成功消息，3秒后自动隐藏
            if (type === 'success') {
                setTimeout(() => {
                    authMessageElement.classList.add('hidden');
                }, 3000);
            }
        }
    },
    
    /**
     * 显示身份验证表单
     */
    showAuthForms: function() {
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.classList.remove('hidden');
        }
        
        const loginContainer = document.getElementById('loginContainer');
        if (loginContainer) {
            loginContainer.classList.remove('hidden');
        }
        
        const registerContainer = document.getElementById('registerContainer');
        if (registerContainer) {
            registerContainer.classList.add('hidden');
        }
        
        const phoneLoginContainer = document.getElementById('phoneLoginContainer');
        if (phoneLoginContainer) {
            phoneLoginContainer.classList.add('hidden');
        }
        
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) {
            userDisplay.classList.add('hidden');
        }
        
        // 隐藏主内容
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
    },
    
    /**
     * 隐藏身份验证表单
     */
    hideAuthForms: function() {
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.classList.add('hidden');
        }
        
        // 显示主内容
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }
};

// DOM加载完成后初始化身份验证模块
document.addEventListener('DOMContentLoaded', function() {
    // 检查FirebaseModule是否已加载
    if (typeof FirebaseModule !== 'undefined') {
        AuthModule.init();
    } else {
        console.error('Firebase模块未加载，身份验证功能无法初始化');
    }
}); 