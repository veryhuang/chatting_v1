/**
 * firebase-config.js - Firebase配置和初始化文件
 * 
 * 功能和作用：
 * 1. 存储Firebase应用配置信息
 * 2. 初始化Firebase应用实例
 * 3. 配置并导出Firebase服务（如身份验证、分析等）
 * 4. 为其他模块提供Firebase功能接口
 * 
 * 主要内容：
 * - Firebase应用配置对象
 * - Firebase初始化
 * - Firebase服务导出
 * 
 * 最后更新：2024-06-08 - 添加错误处理和登录状态初始检查
 */

// Firebase配置对象
// 包含连接到Firebase项目所需的所有键和标识符
const firebaseConfig = {
  apiKey: "AIzaSyDAvoyIWiIeMWzVPI8dLmpSxjIqE_gNyVg", // API密钥，用于验证请求
  authDomain: "chatting-rl.firebaseapp.com", // 身份验证域名
  projectId: "chatting-rl", // 项目ID
  storageBucket: "chatting-rl.firebasestorage.app", // 存储桶URL
  messagingSenderId: "296686664758", // 消息发送者ID
  appId: "1:296686664758:web:a954a8094887341035ec97", // 应用ID
  measurementId: "G-85YTFKECWK" // 分析测量ID
};

// 初始化Firebase应用实例
let app, auth, analytics, googleProvider, phoneProvider;

try {
  // 尝试初始化Firebase应用
  app = firebase.initializeApp(firebaseConfig);
  
  // 初始化Firebase服务
  auth = firebase.auth(); // 身份验证服务
  analytics = firebase.analytics(); // 分析服务
  
  // 创建身份验证提供商实例
  googleProvider = new firebase.auth.GoogleAuthProvider(); // Google登录提供商
  phoneProvider = new firebase.auth.PhoneAuthProvider(); // 电话验证提供商
  
  console.log('Firebase初始化成功');
} catch (error) {
  console.error('Firebase初始化失败:', error);
  
  // 显示错误消息
  const authContainer = document.getElementById('authContainer');
  if (authContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-message message--error';
    errorDiv.textContent = '连接服务器失败，请刷新页面重试';
    errorDiv.style.margin = '20px';
    authContainer.prepend(errorDiv);
  }
}

// 导出Firebase模块
const FirebaseModule = {
  // 导出Firebase应用实例
  app,
  
  // 导出身份验证服务实例
  auth,
  
  // 导出分析服务实例
  analytics,
  
  // 导出身份验证提供商
  googleProvider,
  phoneProvider,
  
  // 导出身份验证方法
  signInWithEmailAndPassword: firebase.auth.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: firebase.auth.createUserWithEmailAndPassword,
  onAuthStateChanged: firebase.auth.onAuthStateChanged,
  signOut: firebase.auth.signOut,
  signInWithPopup: firebase.auth.signInWithPopup,
  sendPasswordResetEmail: firebase.auth.sendPasswordResetEmail,
  
  // 导出电话验证相关方法
  RecaptchaVerifier: firebase.auth.RecaptchaVerifier,
  signInWithPhoneNumber: firebase.auth.signInWithPhoneNumber,
  
  // 导出匿名登录方法
  signInAnonymously: firebase.auth.signInAnonymously
}; 