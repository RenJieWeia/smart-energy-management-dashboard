/**
 * HTTP 请求模块
 * 基于 axios 封装的蜂鸟物联平台请求实例
 */

import axios, { 
  type AxiosInstance, 
  type AxiosResponse, 
  type InternalAxiosRequestConfig 
} from 'axios';
import { getToken, setToken, clearToken } from './token';
import type { LoginResponse } from '@/types/hummingbird';

// API 基础配置
const API_CONFIG = {
  baseURL: 'http://api.jingneng.site:81',
  // baseURL: 'http://192.168.1.253:58081',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
} as const;

// 默认登录凭据
const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '123456'
} as const;

/**
 * 创建蜂鸟物联平台 axios 实例
 */
export const hummingbirdInstance: AxiosInstance = axios.create(API_CONFIG);

/**
 * 创建一个没有拦截器的 axios 实例用于登录
 * 避免循环调用
 */
export const loginInstance: AxiosInstance = axios.create(API_CONFIG);

/**
 * 请求拦截器 - 自动添加 token
 */
hummingbirdInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 排除登录请求，避免无限循环
    if (config.url?.includes('/auth/login')) {
      return config;
    }

    let token = getToken();
    
    // 如果没有有效token，尝试登录获取
    if (!token) {
      try {
        const loginResult = await login();
        token = loginResult.result.token;
      } catch (error) {
        console.error('获取token失败:', error);
        return Promise.reject(new Error('登录失败,无法获取token'));
      }
    }

    // 设置token
    config.headers.set('x-token', token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
hummingbirdInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回数据部分，简化调用
    return response.data;
  },
  (error) => {
    // 增强错误处理
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          console.error('token无效或已过期,需要重新登录');
          clearToken();
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求错误: ${status}`);
      }
    } else if (error.request) {
      console.error('网络错误,无法连接到服务器');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 登录获取token
 * @param username - 用户名
 * @param password - 密码
 * @returns 登录结果
 */
export async function login(
  username: string = DEFAULT_CREDENTIALS.username,
  password: string = DEFAULT_CREDENTIALS.password
): Promise<LoginResponse> {
  try {
    // 使用没有拦截器的实例进行登录，避免循环调用
    const response = await loginInstance.post<LoginResponse>(
      '/v1.0/openapi/auth/login',
      { username, password }
    );

    // 登录成功后保存token
    if (response.data?.result?.token) {
      setToken(response.data.result.token);
      return response.data;
    }
    
    throw new Error('登录失败,未获取到token');
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}
