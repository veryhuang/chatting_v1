/**
 * preview.js - 预览功能模块
 * 
 * 功能和作用：
 * 1. 实时预览聊天界面
 * 2. 根据编辑器状态更新微信界面显示
 * 3. 处理头像和背景图片的预览
 * 4. 管理消息渲染逻辑
 * 5. 同步时间和状态显示
 * 
 * 主要职责：
 * - 渲染消息气泡和系统提示
 * - 实时更新用户头像和昵称
 * - 处理聊天背景变化
 * - 生成时间戳和状态栏显示
 * - 维护预览区的DOM结构
 * 
 * 依赖模块：
 * - app.js：应用程序主模块
 * - editor.js：获取编辑内容
 * 
 * 最后更新：2024-03-19
 */

// 预览模块
const PreviewModule = {
    /**
     * 初始化预览功能
     */
    init: function() {
        // 初始化时更新预览
        this.updatePreview();
        
        // 监听实时更新
        document.querySelectorAll('#editor input, #editor textarea, #editor select').forEach(element => {
            element.addEventListener('input', () => this.updatePreview());
        });
        
        // 监听上传图片变化
        document.getElementById('myAvatarUpload').addEventListener('change', (e) => this.handleAvatarUpload(e, 'me'));
        document.getElementById('friendAvatarUpload').addEventListener('change', (e) => this.handleAvatarUpload(e, 'friend'));
        
        // 监听背景选择
        document.getElementById('backgroundSelect').addEventListener('change', () => this.updateBackground());
        
        // 监听自定义背景上传
        document.getElementById('customBackground').addEventListener('change', this.handleCustomBackgroundUpload);
        
        // 设置当前日期时间
        this.updateCurrentDateTime();
        
        // 每分钟更新一次时间
        setInterval(() => this.updateCurrentDateTime(), 60000);
    },
    
    /**
     * 更新当前日期时间显示
     */
    updateCurrentDateTime: function() {
        // 更新状态栏时间
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        // 更新顶部状态栏时间
        document.querySelector('.wx-phone-time').textContent = timeString;
    },
    
    /**
     * 处理头像上传
     * @param {Event} event - 上传事件
     * @param {string} type - 头像类型（me或friend）
     */
    handleAvatarUpload: function(event, type) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // 更新预览头像
                const previewElement = document.getElementById(type === 'me' ? 'myAvatar' : 'friendAvatar');
                if (previewElement) {
                    previewElement.style.backgroundImage = `url('${e.target.result}')`;
                }
                
                // 更新聊天消息中的头像
                const messageClass = type === 'me' ? 'wx-message--right' : 'wx-message--left';
                document.querySelectorAll(`.${messageClass} .wx-message__avatar`).forEach(avatar => {
                    avatar.style.backgroundImage = `url('${e.target.result}')`;
                });
                
                // 保存头像到本地存储
                localStorage.setItem(`avatar-${type}`, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    },
    
    /**
     * 处理自定义背景上传
     * @param {Event} event - 上传事件
     */
    handleCustomBackgroundUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // 设置聊天背景
                const chatContainer = document.querySelector('.wx-chat-container');
                chatContainer.style.backgroundImage = `url('${e.target.result}')`;
                
                // 保存背景到本地存储
                localStorage.setItem('custom-background', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    },
    
    /**
     * 更新背景样式
     */
    updateBackground: function() {
        const backgroundSelect = document.getElementById('backgroundSelect');
        const customBackgroundContainer = document.getElementById('customBackgroundContainer');
        const chatContainer = document.querySelector('.wx-chat-container');
        
        // 移除所有背景类
        chatContainer.classList.remove('wx-bg-default', 'wx-bg-white', 'wx-bg-gray', 'wx-bg-black', 'wx-bg-custom');
        chatContainer.style.backgroundImage = '';
        
        // 设置选定的背景
        switch (backgroundSelect.value) {
            case 'default':
                chatContainer.classList.add('wx-bg-default');
                customBackgroundContainer.classList.add('hidden');
                break;
            case 'white':
                chatContainer.classList.add('wx-bg-white');
                customBackgroundContainer.classList.add('hidden');
                break;
            case 'gray':
                chatContainer.classList.add('wx-bg-gray');
                customBackgroundContainer.classList.add('hidden');
                break;
            case 'black':
                chatContainer.classList.add('wx-bg-black');
                customBackgroundContainer.classList.add('hidden');
                break;
            case 'custom':
                chatContainer.classList.add('wx-bg-custom');
                customBackgroundContainer.classList.remove('hidden');
                
                // 如果有保存的自定义背景，则使用它
                const savedBackground = localStorage.getItem('custom-background');
                if (savedBackground) {
                    chatContainer.style.backgroundImage = `url('${savedBackground}')`;
                }
                break;
        }
    },
    
    /**
     * 更新预览区域
     */
    updatePreview: function() {
        // 获取好友昵称输入并更新标题
        const friendName = document.getElementById('friendName').value || '好友';
        document.getElementById('previewFriendName').textContent = friendName;
        
        // 更新聊天内容
        this.renderChatMessages();
        
        // 更新背景
        this.updateBackground();
    },
    
    /**
     * 渲染聊天消息
     */
    renderChatMessages: function() {
        const chatContent = document.getElementById('chatContent');
        chatContent.innerHTML = ''; // 清空当前内容
        
        // 获取消息列表
        const messages = this.getMessagesFromEditor();
        
        // 如果没有消息，显示欢迎提示
        if (messages.length === 0) {
            const timeTip = document.createElement('div');
            timeTip.className = 'wx-time-tip';
            const timeTipContent = document.createElement('div');
            timeTipContent.className = 'wx-time-tip__content';
            
            const now = new Date();
            const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日`;
            timeTipContent.textContent = formattedDate;
            
            timeTip.appendChild(timeTipContent);
            chatContent.appendChild(timeTip);
            
            // 添加系统消息
            const systemMsg = document.createElement('div');
            systemMsg.className = 'wx-system-message';
            const systemMsgContent = document.createElement('div');
            systemMsgContent.className = 'wx-system-message__content';
            systemMsgContent.textContent = '开始对话吧';
            systemMsg.appendChild(systemMsgContent);
            chatContent.appendChild(systemMsg);
            
            return;
        }
        
        // 添加时间显示
        const now = new Date();
        let lastDate = null;
        
        // 渲染消息
        messages.forEach((message, index) => {
            // 每隔一段时间显示一次时间提示
            if (index === 0 || index % 5 === 0) {
                const timeDiff = (index === 0) ? 0 : Math.floor(Math.random() * 30) + 5; // 随机时间差
                const messageTime = new Date(now.getTime() - timeDiff * 60000);
                const formattedDate = `${messageTime.getMonth() + 1}月${messageTime.getDate()}日 ${messageTime.getHours().toString().padStart(2, '0')}:${messageTime.getMinutes().toString().padStart(2, '0')}`;
                
                if (formattedDate !== lastDate) {
                    const timeTip = document.createElement('div');
                    timeTip.className = 'wx-time-tip';
                    const timeTipContent = document.createElement('div');
                    timeTipContent.className = 'wx-time-tip__content';
                    timeTipContent.textContent = formattedDate;
                    timeTip.appendChild(timeTipContent);
                    chatContent.appendChild(timeTip);
                    
                    lastDate = formattedDate;
                }
            }
            
            // 创建消息元素
            const messageElement = this.createMessageElement(message);
            chatContent.appendChild(messageElement);
        });
    },
    
    /**
     * 从编辑器获取消息列表
     * @returns {Array} 消息数组
     */
    getMessagesFromEditor: function() {
        const messages = [];
        
        // 获取编辑器中的消息列表
        document.querySelectorAll('#editorMessageList .message-item').forEach(item => {
            const content = item.querySelector('.message-content').textContent;
            const sender = item.dataset.sender;
            
            messages.push({
                content,
                sender: sender
            });
        });
        
        return messages;
    },
    
    /**
     * 创建消息元素
     * @param {Object} message - 消息对象
     * @returns {HTMLElement} 消息元素
     */
    createMessageElement: function(message) {
        const messageElement = document.createElement('div');
        
        // 根据发送者设置不同的消息样式
        if (message.sender === 'system') {
            // 系统消息
            messageElement.className = 'wx-system-message';
            const contentElement = document.createElement('div');
            contentElement.className = 'wx-system-message__content';
            contentElement.textContent = message.content;
            messageElement.appendChild(contentElement);
        } else {
            // 用户消息
            messageElement.className = message.sender === 'me' ? 'wx-message wx-message--right' : 'wx-message wx-message--left';
            
            // 头像
            const avatarElement = document.createElement('div');
            avatarElement.className = 'wx-message__avatar';
            
            // 获取本地存储的头像或使用默认头像
            const avatarType = message.sender === 'me' ? 'me' : 'friend';
            const savedAvatar = localStorage.getItem(`avatar-${avatarType}`);
            if (savedAvatar) {
                avatarElement.style.backgroundImage = `url('${savedAvatar}')`;
            } else {
                // 设置默认头像
                avatarElement.style.backgroundImage = `url('assets/images/default-avatar-${avatarType}.png')`;
            }
            
            // 消息容器
            const containerElement = document.createElement('div');
            containerElement.className = 'wx-message__container';
            
            // 昵称（只在对方消息显示）
            if (message.sender === 'friend') {
                const nicknameElement = document.createElement('div');
                nicknameElement.className = 'wx-message__nickname';
                nicknameElement.textContent = document.getElementById('friendName').value || '好友';
                containerElement.appendChild(nicknameElement);
            }
            
            // 消息内容
            const contentElement = document.createElement('div');
            contentElement.className = 'wx-message__content';
            contentElement.textContent = message.content;
            containerElement.appendChild(contentElement);
            
            // 添加到消息元素
            messageElement.appendChild(avatarElement);
            messageElement.appendChild(containerElement);
        }
        
        return messageElement;
    }
};

// DOM加载完成后初始化预览功能
document.addEventListener('DOMContentLoaded', function() {
    PreviewModule.init();
});

// 导出模块
window.PreviewModule = PreviewModule; 