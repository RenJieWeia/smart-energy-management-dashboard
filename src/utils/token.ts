/**
 * Token 工具模块
 * 用于JWT令牌的验证和管理
 */

interface JWTPayload {
  exp: number;
  [key: string]: unknown;
}

const TOKEN_KEY = 'token';

/**
 * 验证JWT令牌的有效性
 * @param token - 待验证的JWT令牌
 * @returns 令牌是否有效
 */
export function validToken(token: string | null): boolean {
  // 检查token是否存在且为字符串类型
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    // JWT令牌必须包含三个部分：头部、载荷、签名
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // 获取payload部分并处理URL安全的Base64编码
    const payloadPart = parts[1];
    // 替换URL安全字符并添加必要的填充
    const base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      '='
    );

    // 解码并解析JSON
    const decodedPayload = atob(paddedPayload);
    const payload: JWTPayload = JSON.parse(decodedPayload);

    // 检查过期时间是否存在且为数字
    if (typeof payload.exp !== 'number') {
      return false;
    }

    // 验证令牌是否过期（JWT的exp是秒级时间戳）
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.debug('Token validation failed:', error);
    return false;
  }
}

/**
 * 从localStorage获取有效的令牌
 * @returns 有效的令牌字符串或undefined（无有效令牌时）
 */
export function getToken(): string | undefined {
  try {
    // 检查环境是否支持localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }

    const token = window.localStorage.getItem(TOKEN_KEY);

    // 验证token有效性
    if (validToken(token)) {
      return token!;
    }

    // 无效的token，清除存储
    window.localStorage.removeItem(TOKEN_KEY);
    return undefined;
  } catch (error) {
    console.error('Error while getting token:', error);
    return undefined;
  }
}

/**
 * 保存令牌到localStorage
 * @param token - 要保存的令牌
 */
export function setToken(token: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error while setting token:', error);
  }
}

/**
 * 清除localStorage中的令牌
 */
export function clearToken(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error while clearing token:', error);
  }
}
