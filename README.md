# 虚拟微信聊天记录生成器

这是一个在线虚拟微信聊天记录生成器，它允许用户创建看起来像真实微信的聊天记录，并导出为图片。

## 项目概述

本项目旨在提供一个简单易用的工具，让用户可以自由创建虚拟的微信聊天记录。通过这个工具，用户可以：

- 自定义聊天参与者的头像和昵称
- 添加、编辑和删除聊天消息
- 设置不同的聊天背景
- 实时预览微信聊天界面效果
- 将生成的聊天记录导出为图片
- 保存和加载聊天模板以便复用

本项目纯前端实现，无需服务器支持，所有数据都存储在浏览器的本地存储中，确保用户数据隐私。

## 文件结构

```
/chatting
├── index.html          # 主HTML文件，定义页面结构
├── README.md           # 项目说明文档
├── css/                # 样式文件目录
│   ├── reset.css       # 重置默认样式
│   ├── main.css        # 主要样式定义
│   └── responsive.css  # 响应式布局样式
├── js/                 # JavaScript文件目录
│   ├── app.js          # 应用程序主模块
│   ├── editor.js       # 编辑器功能模块
│   ├── preview.js      # 预览功能模块
│   └── export.js       # 导出功能模块
├── assets/             # 资源文件目录
│   ├── images/         # 图像资源
│   │   ├── favicon.ico                # 网站图标
│   │   ├── default-avatar-me.png      # 默认用户头像
│   │   ├── default-avatar-friend.png  # 默认好友头像
│   │   └── chat-bg.png                # 默认聊天背景
│   └── templates/      # 预设模板目录
└── docs/               # 文档目录
    └── 需求文档.md       # 项目需求说明
```

## 功能说明

### 1. 用户信息设置

- **昵称设置**：自定义对方的昵称
- **头像上传**：可上传自定义头像图片
- **实时预览**：所有设置变更即时在预览区显示效果

### 2. 聊天样式设置

- **背景选择**：提供多种聊天背景选项（默认、纯白、浅灰、纯黑）
- **自定义背景**：可上传自定义背景图片

### 3. 聊天内容编辑

- **添加消息**：输入消息内容并选择发送方（我、对方、系统提示）
- **编辑消息**：修改已添加的消息
- **删除消息**：移除不需要的消息
- **时间设置**：设置消息发送时间

### 4. 模板管理

- **保存模板**：保存当前编辑的聊天记录为模板
- **加载模板**：从保存的模板中加载聊天记录
- **删除模板**：删除不再需要的模板

### 5. 导出功能

- **格式选择**：支持PNG和JPEG格式导出
- **范围选择**：导出全部或选定部分（功能开发中）
- **高质量图片**：导出图片采用2倍分辨率，确保清晰度

## 使用方法

1. **基本设置**
   - 设置对方昵称
   - 上传用户头像（自己和对方）
   - 选择或上传聊天背景

2. **添加聊天内容**
   - 在消息输入框中输入内容
   - 选择发送方（我/对方/系统提示）
   - 设置时间（可选）
   - 点击"添加消息"按钮

3. **编辑和管理消息**
   - 点击消息列表中的编辑图标修改消息
   - 点击删除图标移除消息
   - 消息会实时在预览区更新

4. **保存和加载模板**
   - 点击"保存模板"按钮并输入模板名称
   - 点击"加载模板"按钮从列表中选择要加载的模板

5. **导出图片**
   - 点击"导出图片"按钮
   - 选择导出格式和范围
   - 点击"开始导出"
   - 图片将自动下载到本地

## 技术架构

本项目采用纯前端技术栈，无需后端服务：

- **HTML5**：页面结构和语义化标签
- **CSS3**：样式定义、动画、响应式布局
- **JavaScript**：核心功能实现
- **LocalStorage API**：本地数据存储
- **FileReader API**：图片上传处理
- **Canvas API**：基本图像处理
- **html2canvas**：DOM转图像功能
- **SVG**：图标和UI元素

### 设计模式

项目采用模块化设计，将功能分为四个主要模块：

1. **App模块**：应用程序初始化和全局状态管理
2. **Editor模块**：处理编辑功能和用户输入
3. **Preview模块**：处理预览显示和实时更新
4. **Export模块**：处理图像导出和下载功能

## 浏览器兼容性

本项目支持以下主流浏览器的最新版本：

- Google Chrome
- Firefox
- Safari
- Microsoft Edge

由于使用了一些现代Web API，不支持IE浏览器。

## 后续开发计划

- [ ] 聊天记录导入功能
- [ ] 更多微信主题样式
- [ ] 表情包支持
- [ ] 图片消息支持
- [ ] 语音消息模拟
- [ ] 视频通话记录模拟
- [ ] 暗黑模式支持
- [ ] 导出为PDF格式

---

最后更新日期：2024-03-19

© 2024 虚拟微信聊天记录生成器 