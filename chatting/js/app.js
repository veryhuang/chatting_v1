/**
 * app.js - 应用程序主文件
 * 
 * 功能和作用：
 * 1. 初始化整个应用程序
 * 2. 管理应用程序的全局状态
 * 3. 加载默认资源和数据
 * 4. 检查浏览器兼容性并提供警告
 * 5. 协调各个模块之间的通信
 * 6. 与Firebase身份验证模块集成
 * 
 * 主要职责：
 * - 应用程序启动和初始化
 * - 检测浏览器兼容性
 * - 默认图像资源加载
 * - 数据持久化管理
 * - 兼容性警告显示
 * - 集成身份验证功能
 * 
 * 依赖模块：
 * - editor.js：编辑功能模块
 * - preview.js：预览功能模块
 * - export.js：导出功能模块
 * - auth.js：身份验证模块
 * - firebase-config.js：Firebase配置
 * 
 * 最后更新：2024-06-04
 */

// 应用程序模块
const AppModule = {
    /**
     * 初始化应用程序
     */
    init: function() {
        // 初始化时检查浏览器兼容性
        this.checkBrowserCompatibility();
        
        // 加载默认图片资源
        this.loadDefaultResources();
        
        // 检查身份验证状态
        this.checkAuthState();
        
        // 在窗口关闭前保存数据
        window.addEventListener('beforeunload', () => {
            // 保存编辑器状态
            EditorModule.saveData();
        });
    },
    
    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility: function() {
        // 检查是否支持FileReader API
        if (!window.FileReader) {
            this.showCompatibilityWarning('你的浏览器不支持FileReader API，无法上传图片。请使用现代浏览器如Chrome、Firefox、Edge或Safari的最新版本。');
        }
        
        // 检查是否支持Canvas API
        if (!document.createElement('canvas').getContext) {
            this.showCompatibilityWarning('你的浏览器不支持Canvas API，无法导出图片。请使用现代浏览器如Chrome、Firefox、Edge或Safari的最新版本。');
        }
        
        // 检查是否支持HTML5 LocalStorage
        if (!window.localStorage) {
            this.showCompatibilityWarning('你的浏览器不支持HTML5 LocalStorage，无法保存模板和设置。请使用现代浏览器如Chrome、Firefox、Edge或Safari的最新版本。');
        }
    },
    
    /**
     * 显示兼容性警告
     * @param {string} message - 警告信息
     */
    showCompatibilityWarning: function(message) {
        const warningEl = document.createElement('div');
        warningEl.className = 'compatibility-warning';
        warningEl.innerHTML = `
            <div class="compatibility-warning__content">
                <h3>浏览器兼容性警告</h3>
                <p>${message}</p>
                <button id="closeCompatibilityWarning" class="btn">我知道了</button>
            </div>
        `;
        
        document.body.appendChild(warningEl);
        
        document.getElementById('closeCompatibilityWarning').addEventListener('click', function() {
            warningEl.remove();
        });
    },
    
    /**
     * 加载默认图片资源
     */
    loadDefaultResources: function() {
        // 检查默认头像
        const myAvatar = localStorage.getItem('avatar-me');
        const friendAvatar = localStorage.getItem('avatar-friend');
        
        // 如果没有默认头像，则使用预设的头像
        if (!myAvatar) {
            this.loadDefaultImage('myAvatar', 'assets/images/default-avatar-me.png');
        } else {
            document.getElementById('myAvatar').style.backgroundImage = `url(${myAvatar})`;
        }
        
        if (!friendAvatar) {
            this.loadDefaultImage('friendAvatar', 'assets/images/default-avatar-friend.png');
        } else {
            document.getElementById('friendAvatar').style.backgroundImage = `url(${friendAvatar})`;
        }
    },
    
    /**
     * 加载默认图片
     * @param {string} elementId - 元素ID
     * @param {string} imagePath - 图片路径
     */
    loadDefaultImage: function(elementId, imagePath) {
        const img = new Image();
        img.onload = function() {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.backgroundImage = `url(${imagePath})`;
            }
        };
        img.src = imagePath;
    },
    
    /**
     * 检查用户身份验证状态
     */
    checkAuthState: function() {
        // 检查Firebase模块和身份验证模块是否已加载
        if (typeof FirebaseModule !== 'undefined' && typeof AuthModule !== 'undefined') {
            console.log('Firebase和身份验证模块已加载');
            
            // 启用身份验证功能
            this.enableAuthentication();
        } else {
            console.error('Firebase或身份验证模块未加载，无法启用身份验证功能');
            
            // 显示警告
            this.showCompatibilityWarning('无法加载身份验证功能，部分功能可能无法正常使用。');
            
            // 显示主内容
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.classList.remove('hidden');
            }
        }
    },
    
    /**
     * 启用身份验证功能
     */
    enableAuthentication: function() {
        // 监听Firebase身份验证状态变化
        FirebaseModule.auth.onAuthStateChanged((user) => {
            if (user) {
                // 用户已登录
                console.log('用户已登录:', user.email);
                
                // 隐藏登录表单
                const authContainer = document.getElementById('authContainer');
                if (authContainer) {
                    authContainer.classList.add('hidden');
                }
                
                // 显示主内容
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.classList.remove('hidden');
                }
                
                // 更新导航栏，显示用户信息
                this.updateNavbarWithUserInfo(user);
            } else {
                // 用户未登录
                console.log('用户未登录，显示登录表单');
                
                // 显示登录表单
                const authContainer = document.getElementById('authContainer');
                if (authContainer) {
                    authContainer.classList.remove('hidden');
                }
                
                // 隐藏主内容
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.classList.add('hidden');
                }
            }
        });
    },
    
    /**
     * 更新导航栏显示用户信息
     * @param {Object} user - 登录的用户对象
     */
    updateNavbarWithUserInfo: function(user) {
        // 获取导航栏
        const navbar = document.querySelector('.nav__menu');
        
        // 检查是否已存在用户信息元素
        let userInfoElement = document.getElementById('navUserInfo');
        
        // 获取用户显示名称
        let userDisplayName = '';
        if (user.isAnonymous) {
            userDisplayName = '匿名用户';
        } else if (user.email) {
            userDisplayName = user.email;
        } else if (user.phoneNumber) {
            userDisplayName = user.phoneNumber;
        } else {
            userDisplayName = '已登录用户';
        }
        
        // 如果不存在，则创建用户信息元素
        if (!userInfoElement) {
            const userInfoLi = document.createElement('li');
            userInfoLi.className = 'nav__item nav__item--user';
            
            userInfoLi.innerHTML = `
                <div id="navUserInfo" class="nav__user-info">
                    <span id="navUserEmail">${userDisplayName}</span>
                    <button id="navLogoutBtn" class="btn btn--small">登出</button>
                </div>
            `;
            
            // 添加到导航栏
            navbar.appendChild(userInfoLi);
            
            // 绑定登出按钮点击事件
            document.getElementById('navLogoutBtn').addEventListener('click', () => {
                FirebaseModule.auth.signOut()
                    .then(() => {
                        console.log('用户已登出');
                    })
                    .catch(error => {
                        console.error('登出错误:', error);
                    });
            });
        } else {
            // 更新用户邮箱显示
            document.getElementById('navUserEmail').textContent = userDisplayName;
        }
    }
};

// DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', function() {
    AppModule.init();
}); 