/**
 * editor.js - 编辑器功能模块
 * 
 * 功能和作用：
 * 1. 管理聊天内容的编辑功能
 * 2. 处理用户输入和交互
 * 3. 维护消息列表和编辑状态
 * 4. 实现模板保存和加载功能
 * 5. 管理用户偏好设置
 * 
 * 主要职责：
 * - 管理消息添加、编辑和删除
 * - 处理表单输入和验证
 * - 实现模板系统（保存、加载、删除）
 * - 导出聊天记录为图片
 * - 数据的本地存储和加载
 * 
 * 依赖模块：
 * - app.js：应用程序主模块
 * - preview.js：预览更新
 * - export.js：导出功能调用
 * 
 * 最后更新：2024-03-19
 */

// 编辑器模块
const EditorModule = {
    /**
     * 初始化编辑器功能
     */
    init: function() {
        // 绑定编辑器功能事件
        this.bindEvents();
        
        // 加载保存的数据（如果有）
        this.loadSavedData();
        
        // 设置初始时间
        this.setCurrentTime();
    },
    
    /**
     * 绑定编辑器功能相关事件
     */
    bindEvents: function() {
        // 添加消息按钮事件
        document.getElementById('addMessageBtn').addEventListener('click', () => this.addNewMessage());
        
        // 监听键盘快捷键
        document.getElementById('messageContent').addEventListener('keydown', (e) => {
            // Ctrl+Enter 快速添加消息
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.addNewMessage();
            }
        });
        
        // 背景选择变化事件
        document.getElementById('backgroundSelect').addEventListener('change', (e) => {
            const customBackgroundContainer = document.getElementById('customBackgroundContainer');
            if (e.target.value === 'custom') {
                customBackgroundContainer.classList.remove('hidden');
            } else {
                customBackgroundContainer.classList.add('hidden');
            }
        });
        
        // 监听保存和加载模板按钮
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveTemplateModal());
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadTemplateModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
        
        // 保存模板弹窗按钮
        document.getElementById('confirmSaveTemplate').addEventListener('click', () => this.saveTemplate());
        document.getElementById('closeSaveTemplateModal').addEventListener('click', () => this.hideModal('saveTemplateModal'));
        
        // 加载模板弹窗按钮
        document.getElementById('closeTemplateModal').addEventListener('click', () => this.hideModal('templateModal'));
        
        // 导出弹窗按钮
        document.getElementById('startExportBtn').addEventListener('click', () => this.startExport());
        document.getElementById('closeExportModal').addEventListener('click', () => this.hideModal('exportModal'));
    },
    
    /**
     * 设置当前时间到时间输入框
     */
    setCurrentTime: function() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        
        document.getElementById('messageTime').value = currentTime;
    },
    
    /**
     * 从本地存储加载保存的数据
     */
    loadSavedData: function() {
        // 获取保存的数据
        const savedData = localStorage.getItem('chatData');
        if (savedData) {
            const chatData = JSON.parse(savedData);
            
            // 加载好友名称
            if (chatData.friendName) {
                document.getElementById('friendName').value = chatData.friendName;
                document.getElementById('previewFriendName').textContent = chatData.friendName;
            }
            
            // 加载我的头像
            if (chatData.myAvatar) {
                const myAvatar = document.getElementById('myAvatar');
                myAvatar.style.backgroundImage = `url(${chatData.myAvatar})`;
            }
            
            // 加载好友头像
            if (chatData.friendAvatar) {
                const friendAvatar = document.getElementById('friendAvatar');
                friendAvatar.style.backgroundImage = `url(${chatData.friendAvatar})`;
            }
            
            // 加载背景设置
            if (chatData.background) {
                document.getElementById('backgroundSelect').value = chatData.background;
                if (chatData.background === 'custom' && chatData.customBackground) {
                    document.getElementById('customBackgroundContainer').classList.remove('hidden');
                    // 自定义背景通过PreviewModule处理
                }
            }
            
            // 加载消息
            if (chatData.messages && chatData.messages.length > 0) {
                chatData.messages.forEach((message, index) => {
                    this.addMessageToEditorList(message, index);
                });
            }
        }
    },
    
    /**
     * 保存数据到本地存储
     */
    saveData: function() {
        // 获取当前数据
        const chatData = {
            friendName: document.getElementById('friendName').value,
            background: document.getElementById('backgroundSelect').value,
            messages: this.getMessagesFromList(),
            // 头像和自定义背景在上传时保存
        };
        
        // 保存到本地存储
        localStorage.setItem('chatData', JSON.stringify(chatData));
    },
    
    /**
     * 从编辑器列表获取消息
     * @returns {Array} 消息数组
     */
    getMessagesFromList: function() {
        const messages = [];
        
        document.querySelectorAll('#editorMessageList .message-item').forEach(item => {
            messages.push({
                content: item.querySelector('.message-content').textContent,
                sender: item.dataset.sender,
                time: item.dataset.time || this.getCurrentTime(),
            });
        });
        
        return messages;
    },
    
    /**
     * 添加新消息
     */
    addNewMessage: function() {
        // 获取消息内容
        const content = document.getElementById('messageContent').value.trim();
        
        // 检查消息内容是否为空
        if (content === '') {
            alert('请输入消息内容');
            return;
        }
        
        // 获取发送者类型
        const sender = document.querySelector('input[name="sender"]:checked').value;
        
        // 获取消息时间
        const time = document.getElementById('messageTime').value || this.getCurrentTime();
        
        // 创建新消息对象
        const message = {
            content: content,
            sender: sender,
            time: time
        };
        
        // 添加到编辑器消息列表
        const index = document.querySelectorAll('#editorMessageList .message-item').length;
        this.addMessageToEditorList(message, index);
        
        // 保存数据
        this.saveData();
        
        // 更新预览
        PreviewModule.updatePreview();
        
        // 清空消息输入框并保持焦点
        document.getElementById('messageContent').value = '';
        document.getElementById('messageContent').focus();
    },
    
    /**
     * 添加消息到编辑器列表
     * @param {Object} message - 消息对象
     * @param {number} index - 消息索引
     */
    addMessageToEditorList: function(message, index) {
        // 获取编辑器消息列表容器
        const editorMessageList = document.getElementById('editorMessageList');
        
        // 创建消息项元素
        const messageItem = document.createElement('li');
        messageItem.className = 'message-item';
        messageItem.dataset.index = index;
        messageItem.dataset.sender = message.sender;
        messageItem.dataset.time = message.time;
        
        // 设置消息项内容
        messageItem.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-info">${this.getSenderLabel(message.sender)} ${message.time}</div>
            <div class="message-actions">
                <button class="message-action-edit" title="编辑消息">✏️</button>
                <button class="message-action-delete" title="删除消息">🗑️</button>
            </div>
        `;
        
        // 添加到列表
        editorMessageList.appendChild(messageItem);
        
        // 绑定编辑按钮事件
        messageItem.querySelector('.message-action-edit').addEventListener('click', () => {
            this.editMessage(index);
        });
        
        // 绑定删除按钮事件
        messageItem.querySelector('.message-action-delete').addEventListener('click', () => {
            this.deleteMessage(index);
        });
    },
    
    /**
     * 编辑消息
     * @param {number} index - 消息索引
     */
    editMessage: function(index) {
        // 获取消息元素
        const messageItem = document.querySelector(`#editorMessageList .message-item[data-index="${index}"]`);
        if (!messageItem) return;
        
        // 填充编辑表单
        document.getElementById('messageContent').value = messageItem.querySelector('.message-content').textContent;
        document.querySelector(`input[name="sender"][value="${messageItem.dataset.sender}"]`).checked = true;
        document.getElementById('messageTime').value = messageItem.dataset.time;
        
        // 删除原消息
        this.deleteMessage(index);
        
        // 滚动到表单位置
        document.getElementById('messageContent').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('messageContent').focus();
    },
    
    /**
     * 删除消息
     * @param {number} index - 消息索引
     */
    deleteMessage: function(index) {
        // 获取消息元素
        const messageItem = document.querySelector(`#editorMessageList .message-item[data-index="${index}"]`);
        if (!messageItem) return;
        
        // 删除消息
        messageItem.remove();
        
        // 更新消息索引
        document.querySelectorAll('#editorMessageList .message-item').forEach((item, i) => {
            item.dataset.index = i;
            item.querySelector('.message-action-edit').onclick = () => this.editMessage(i);
            item.querySelector('.message-action-delete').onclick = () => this.deleteMessage(i);
        });
        
        // 保存数据
        this.saveData();
        
        // 更新预览
        PreviewModule.updatePreview();
    },
    
    /**
     * 显示保存模板弹窗
     */
    showSaveTemplateModal: function() {
        document.getElementById('saveTemplateModal').classList.remove('hidden');
    },
    
    /**
     * 显示加载模板弹窗
     */
    showLoadTemplateModal: function() {
        // 获取保存的模板
        const templates = this.getTemplates();
        
        // 获取模板列表容器
        const templateList = document.getElementById('templateList');
        templateList.innerHTML = '';
        
        // 如果没有模板，显示提示
        if (templates.length === 0) {
            templateList.innerHTML = '<div class="template-empty">没有保存的模板</div>';
        } else {
            // 添加模板项
            templates.forEach((template, index) => {
                const templateItem = document.createElement('div');
                templateItem.className = 'template-item';
                templateItem.innerHTML = `
                    <div class="template-name">${template.name}</div>
                    <div class="template-actions">
                        <button class="template-action-load" data-index="${index}">加载</button>
                        <button class="template-action-delete" data-index="${index}">删除</button>
                    </div>
                `;
                
                // 绑定加载按钮事件
                templateItem.querySelector('.template-action-load').addEventListener('click', () => {
                    this.loadTemplate(index);
                    this.hideModal('templateModal');
                });
                
                // 绑定删除按钮事件
                templateItem.querySelector('.template-action-delete').addEventListener('click', () => {
                    this.deleteTemplate(index);
                    this.showLoadTemplateModal(); // 刷新列表
                });
                
                templateList.appendChild(templateItem);
            });
        }
        
        // 显示弹窗
        document.getElementById('templateModal').classList.remove('hidden');
    },
    
    /**
     * 显示导出弹窗
     */
    showExportModal: function() {
        document.getElementById('exportModal').classList.remove('hidden');
    },
    
    /**
     * 隐藏弹窗
     * @param {string} modalId - 弹窗ID
     */
    hideModal: function(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    },
    
    /**
     * 保存当前设置为模板
     */
    saveTemplate: function() {
        // 获取模板名称
        const templateName = document.getElementById('templateName').value.trim();
        
        // 检查模板名称是否为空
        if (templateName === '') {
            alert('请输入模板名称');
            return;
        }
        
        // 获取当前数据
        const chatData = {
            name: templateName,
            friendName: document.getElementById('friendName').value,
            background: document.getElementById('backgroundSelect').value,
            messages: this.getMessagesFromList(),
            timestamp: Date.now()
        };
        
        // 获取保存的模板
        const templates = this.getTemplates();
        
        // 添加新模板
        templates.push(chatData);
        
        // 保存到本地存储
        localStorage.setItem('chatTemplates', JSON.stringify(templates));
        
        // 隐藏弹窗
        this.hideModal('saveTemplateModal');
        
        // 清空模板名称
        document.getElementById('templateName').value = '';
        
        // 显示成功提示
        alert('模板保存成功');
    },
    
    /**
     * 加载模板
     * @param {number} index - 模板索引
     */
    loadTemplate: function(index) {
        // 获取保存的模板
        const templates = this.getTemplates();
        
        // 检查索引是否有效
        if (index < 0 || index >= templates.length) {
            alert('模板不存在');
            return;
        }
        
        // 获取模板数据
        const template = templates[index];
        
        // 加载好友名称
        document.getElementById('friendName').value = template.friendName || '';
        
        // 加载背景设置
        document.getElementById('backgroundSelect').value = template.background || 'default';
        
        // 清空消息列表
        document.getElementById('editorMessageList').innerHTML = '';
        
        // 加载消息
        if (template.messages && template.messages.length > 0) {
            template.messages.forEach((message, i) => {
                this.addMessageToEditorList(message, i);
            });
        }
        
        // 保存数据
        this.saveData();
        
        // 更新预览
        PreviewModule.updatePreview();
        
        // 显示成功提示
        alert('模板加载成功');
    },
    
    /**
     * 删除模板
     * @param {number} index - 模板索引
     */
    deleteTemplate: function(index) {
        // 获取保存的模板
        const templates = this.getTemplates();
        
        // 检查索引是否有效
        if (index < 0 || index >= templates.length) {
            alert('模板不存在');
            return;
        }
        
        // 确认是否删除
        if (!confirm('确定要删除这个模板吗？')) {
            return;
        }
        
        // 删除模板
        templates.splice(index, 1);
        
        // 保存到本地存储
        localStorage.setItem('chatTemplates', JSON.stringify(templates));
        
        // 显示成功提示
        alert('模板删除成功');
    },
    
    /**
     * 获取保存的模板
     * @returns {Array} 模板数组
     */
    getTemplates: function() {
        // 获取保存的模板
        const savedTemplates = localStorage.getItem('chatTemplates');
        return savedTemplates ? JSON.parse(savedTemplates) : [];
    },
    
    /**
     * 开始导出操作
     */
    startExport: function() {
        // 获取导出格式
        const format = document.getElementById('exportFormat').value;
        
        // 获取导出范围
        const range = document.getElementById('exportRange').value;
        
        // 调用导出函数
        exportChatImage(format, range);
        
        // 隐藏弹窗
        this.hideModal('exportModal');
    },
    
    /**
     * 获取发送者标签文本
     * @param {string} senderType - 发送者类型
     * @returns {string} 发送者标签文本
     */
    getSenderLabel: function(senderType) {
        switch (senderType) {
            case 'me':
                return '我';
            case 'friend':
                return '对方';
            case 'system':
                return '系统提示';
            default:
                return '未知';
        }
    },
    
    /**
     * 获取当前时间字符串（HH:MM格式）
     * @returns {string} 当前时间字符串
     */
    getCurrentTime: function() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
};

// DOM加载完成后初始化编辑器功能
document.addEventListener('DOMContentLoaded', function() {
    EditorModule.init();
});

// 导出模块
window.EditorModule = EditorModule; 