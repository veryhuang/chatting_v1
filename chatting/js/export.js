/**
 * export.js - 导出功能模块
 * 
 * 功能和作用：
 * 1. 将预览区的聊天界面导出为图片
 * 2. 提供各种导出格式选项（PNG、JPEG）
 * 3. 处理图像质量和尺寸调整
 * 4. 管理导出过程中的用户交互
 * 5. 实现精确样式复制，确保导出效果一致
 * 
 * 主要职责：
 * - DOM转换为Canvas/图像
 * - 样式计算和复制
 * - 文件下载处理
 * - 导出进度反馈
 * - 错误处理和恢复
 * 
 * 依赖：
 * - html2canvas库：DOM转图像功能
 * - app.js：应用程序主模块
 * - preview.js：获取预览内容
 * 
 * 最后更新：2024-03-19
 */

// DOM加载完成后初始化导出功能
document.addEventListener('DOMContentLoaded', function() {
    // 绑定导出功能事件
    bindExportEvents();
});

/**
 * 绑定导出功能相关事件
 */
function bindExportEvents() {
    // 绑定开始导出按钮事件
    document.getElementById('startExportBtn').addEventListener('click', function() {
        // 获取导出格式
        const format = document.getElementById('exportFormat').value;
        
        // 获取导出范围
        const range = document.getElementById('exportRange').value;
        
        // 执行导出
        exportChatImage(format, range);
        
        // 隐藏导出选项弹窗
        document.getElementById('exportModal').classList.add('hidden');
    });
}

/**
 * 导出聊天记录为图片
 * @param {string} format - 导出格式（'png'或'jpeg'）
 * @param {string} range - 导出范围（'all'或'selected'）
 */
function exportChatImage(format, range) {
    // 显示加载提示
    showLoadingMessage("正在生成图片，请稍候...");
    
    // 获取预览容器
    const previewContainer = document.querySelector('.preview-container');
    
    // 创建一个新的包装容器，确保样式正确
    const wrapperContainer = document.createElement('div');
    wrapperContainer.style.position = 'absolute';
    wrapperContainer.style.left = '-9999px';
    wrapperContainer.style.top = '0';
    wrapperContainer.style.width = previewContainer.offsetWidth + 'px';
    wrapperContainer.style.height = previewContainer.offsetHeight + 'px';
    
    // 克隆预览容器的内容，并应用所有计算后的样式
    const cloneContainer = previewContainer.cloneNode(true);
    
    // 保留原始的尺寸和布局
    cloneContainer.style.width = previewContainer.offsetWidth + 'px';
    cloneContainer.style.height = previewContainer.offsetHeight + 'px';
    cloneContainer.style.position = 'relative';
    cloneContainer.style.overflow = 'hidden';
    
    // 确保克隆容器内的元素继承所有计算样式
    copyComputedStyles(previewContainer, cloneContainer);
    
    // 添加到临时包装容器
    wrapperContainer.appendChild(cloneContainer);
    document.body.appendChild(wrapperContainer);
    
    // 如果是选择性导出，移除未选中的消息
    if (range === 'selected') {
        // 此处应实现选择性导出逻辑
        // 由于需求文档中没有指定选择消息的具体方式，
        // 这里暂不实现，默认导出全部内容
        console.log('选择性导出功能尚未实现，将导出全部内容');
    }
    
    // 使用html2canvas库将DOM转换为Canvas，增强配置以修复文字位置问题
    html2canvas(cloneContainer, {
        // 配置选项
        allowTaint: true,      // 允许使用跨域图片
        useCORS: true,         // 尝试使用CORS加载图片
        scale: 2,              // 提高分辨率
        backgroundColor: null,  // 保持背景透明
        logging: false,        // 关闭日志输出
        letterRendering: true, // 增强文字渲染
        foreignObjectRendering: false, // 避免使用foreignObject可能导致的问题
        removeContainer: false, // 自己管理容器移除
        x: 0,                  // 起始坐标X
        y: 0,                  // 起始坐标Y
        scrollX: 0,            // 防止滚动影响
        scrollY: 0,            // 防止滚动影响
        windowWidth: document.documentElement.offsetWidth, // 设置窗口宽度
        windowHeight: document.documentElement.offsetHeight // 设置窗口高度
    }).then(function(canvas) {
        // 从Canvas创建图片URL
        const imgUrl = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`, 0.9);
        
        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = imgUrl;
        downloadLink.download = `微信聊天_${getCurrentDateTime()}.${format}`;
        
        // 模拟点击下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // 移除临时包装容器
        document.body.removeChild(wrapperContainer);
        
        // 隐藏加载提示
        hideLoadingMessage();
        
        // 提示用户导出成功
        alert('图片导出成功！');
    }).catch(function(error) {
        // 隐藏加载提示
        hideLoadingMessage();
        
        // 移除临时包装容器
        if (document.body.contains(wrapperContainer)) {
            document.body.removeChild(wrapperContainer);
        }
        
        // 提示用户导出失败
        console.error('图片导出失败:', error);
        alert(`图片导出失败: ${error.message || '未知错误'}`);
    });
}

/**
 * 复制计算样式到克隆元素
 * 这个函数可以递归处理所有子元素，确保所有样式都被正确复制
 * @param {HTMLElement} sourceNode - 源节点
 * @param {HTMLElement} targetNode - 目标节点
 */
function copyComputedStyles(sourceNode, targetNode) {
    // 复制当前节点的计算样式
    const computedStyle = window.getComputedStyle(sourceNode);
    for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle[i];
        targetNode.style[property] = computedStyle.getPropertyValue(property);
    }
    
    // 处理文本节点和位置问题
    if (sourceNode.nodeName === '#text') {
        targetNode.textContent = sourceNode.textContent;
        return;
    }
    
    // 递归处理所有子节点
    if (sourceNode.children && sourceNode.children.length > 0) {
        for (let i = 0; i < sourceNode.children.length && i < targetNode.children.length; i++) {
            copyComputedStyles(sourceNode.children[i], targetNode.children[i]);
        }
    }
    
    // 特别处理聊天气泡元素，确保位置正确
    if (sourceNode.classList && (
        sourceNode.classList.contains('wx-message') || 
        sourceNode.classList.contains('wx-message__content') ||
        sourceNode.classList.contains('wx-message__avatar'))) {
        targetNode.style.position = sourceNode.style.position || getComputedStyle(sourceNode).position;
        targetNode.style.top = sourceNode.style.top || getComputedStyle(sourceNode).top;
        targetNode.style.left = sourceNode.style.left || getComputedStyle(sourceNode).left;
        targetNode.style.transform = sourceNode.style.transform || getComputedStyle(sourceNode).transform;
    }
}

/**
 * 显示加载提示
 * @param {string} message - 提示信息
 */
function showLoadingMessage(message) {
    // 创建加载提示元素
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loadingMessage';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.width = '100%';
    loadingElement.style.height = '100%';
    loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingElement.style.display = 'flex';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.zIndex = '9999';
    
    // 创建提示文本元素
    const messageElement = document.createElement('div');
    messageElement.style.backgroundColor = '#fff';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '8px';
    messageElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    messageElement.textContent = message;
    
    // 添加到加载提示元素
    loadingElement.appendChild(messageElement);
    
    // 添加到body
    document.body.appendChild(loadingElement);
}

/**
 * 隐藏加载提示
 */
function hideLoadingMessage() {
    // 获取加载提示元素
    const loadingElement = document.getElementById('loadingMessage');
    
    // 如果存在，移除
    if (loadingElement) {
        document.body.removeChild(loadingElement);
    }
}

/**
 * 获取当前日期时间字符串（用于文件名）
 * @returns {string} 日期时间字符串（格式：YYYYMMDD_HHMMSS）
 */
function getCurrentDateTime() {
    const now = new Date();
    
    // 格式化年月日
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // 格式化时分秒
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 组合为字符串
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
} 