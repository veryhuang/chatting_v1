/**
 * app.js - 应用程序主文件
 * 
 * 功能和作用：
 * 1. 初始化整个应用程序
 * 2. 管理应用程序的全局状态
 * 3. 加载默认资源和数据
 * 4. 检查浏览器兼容性并提供警告
 * 5. 协调各个模块之间的通信
 * 
 * 主要职责：
 * - 应用程序启动和初始化
 * - 检测浏览器兼容性
 * - 默认图像资源加载
 * - 数据持久化管理
 * - 兼容性警告显示
 * 
 * 依赖模块：
 * - editor.js：编辑功能模块
 * - preview.js：预览功能模块
 * - export.js：导出功能模块
 * 
 * 最后更新：2024-03-19
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
    }
};

// DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', function() {
    AppModule.init();
}); 