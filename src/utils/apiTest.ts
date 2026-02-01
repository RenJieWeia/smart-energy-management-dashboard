/**
 * 蜂鸟物联平台 API 控制台测试脚本
 * 
 * 使用方法：在浏览器控制台中运行以下命令
 * 
 * 1. 测试登录:
 *    await window.hbTest.testLogin()
 * 
 * 2. 测试获取设备数据:
 *    await window.hbTest.testGetDeviceData()
 * 
 * 3. 运行所有测试:
 *    await window.hbTest.runAllTests()
 */

import { login } from '@/utils/request';
import { getDeviceLastData } from '@/sdk/hbsdk';
import { getToken } from '@/utils/token';
import { groupDeviceData, getSwitchList } from '@/utils/switchCodeUtil';
import type { DeviceProperty } from '@/types/hummingbird';

interface TestResult {
  name: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
}

/**
 * 测试登录接口
 */
async function testLogin(): Promise<TestResult> {
  const start = performance.now();
  console.log('🔐 测试登录接口...');
  
  try {
    const result = await login();
    const duration = performance.now() - start;
    
    console.log('✅ 登录成功!', result);
    console.log(`   Token: ${result.result.token.substring(0, 50)}...`);
    console.log(`   耗时: ${duration.toFixed(2)}ms`);
    
    return {
      name: '登录测试',
      success: true,
      data: { token: result.result.token.substring(0, 50) + '...' },
      duration,
    };
  } catch (error) {
    const duration = performance.now() - start;
    console.error('❌ 登录失败:', error);
    
    return {
      name: '登录测试',
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration,
    };
  }
}

/**
 * 测试获取设备数据接口
 */
async function testGetDeviceData(): Promise<TestResult> {
  const start = performance.now();
  console.log('📊 测试获取设备数据...');
  
  try {
    const result = await getDeviceLastData();
    const duration = performance.now() - start;
    const deviceList = result.result.list;
    
    console.log('✅ 获取数据成功!');
    console.log(`   数据条数: ${deviceList.length}`);
    console.log(`   耗时: ${duration.toFixed(2)}ms`);
    
    // 显示前5条数据
    console.log('   前5条数据预览:');
    deviceList.slice(0, 5).forEach((item: DeviceProperty, index: number) => {
      console.log(`   ${index + 1}. ${item.name} (${item.code}): ${item.value} ${item.unit}`);
    });
    
    return {
      name: '获取设备数据测试',
      success: true,
      data: {
        count: deviceList.length,
        sample: deviceList.slice(0, 3),
      },
      duration,
    };
  } catch (error) {
    const duration = performance.now() - start;
    console.error('❌ 获取数据失败:', error);
    
    return {
      name: '获取设备数据测试',
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration,
    };
  }
}

/**
 * 测试数据分组功能
 */
async function testDataGrouping(): Promise<TestResult> {
  const start = performance.now();
  console.log('📁 测试数据分组...');
  
  try {
    const result = await getDeviceLastData();
    const deviceList = result.result.list;
    const grouped = groupDeviceData(deviceList);
    const duration = performance.now() - start;
    
    console.log('✅ 数据分组成功!');
    
    Object.entries(grouped).forEach(([mode, groups]) => {
      console.log(`   访问模式 [${mode}]:`);
      Object.entries(groups as Record<string, unknown[]>).forEach(([group, items]) => {
        console.log(`     - ${group}: ${(items as unknown[]).length} 条`);
      });
    });
    
    return {
      name: '数据分组测试',
      success: true,
      data: {
        modes: Object.keys(grouped),
        summary: Object.entries(grouped).map(([mode, groups]) => ({
          mode,
          groups: Object.keys(groups as object),
        })),
      },
      duration,
    };
  } catch (error) {
    const duration = performance.now() - start;
    console.error('❌ 数据分组失败:', error);
    
    return {
      name: '数据分组测试',
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration,
    };
  }
}

/**
 * 测试开关列表功能
 */
async function testSwitchList(): Promise<TestResult> {
  const start = performance.now();
  console.log('🔌 测试开关列表...');
  
  try {
    const result = await getDeviceLastData();
    const deviceList = result.result.list;
    const grouped = groupDeviceData(deviceList);
    const switchNum = (grouped as Record<string, Record<string, DeviceProperty[]>>).RW?.other?.at(-1);
    const switches = getSwitchList(switchNum);
    const duration = performance.now() - start;
    
    console.log('✅ 获取开关列表成功!');
    console.log(`   开关数量: ${switches.length}`);
    
    switches.forEach((sw) => {
      console.log(`   - ${sw.name}: ${sw.value}`);
    });
    
    return {
      name: '开关列表测试',
      success: true,
      data: switches,
      duration,
    };
  } catch (error) {
    const duration = performance.now() - start;
    console.error('❌ 获取开关列表失败:', error);
    
    return {
      name: '开关列表测试',
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration,
    };
  }
}

/**
 * 检查 Token 状态
 */
function checkTokenStatus(): TestResult {
  const start = performance.now();
  console.log('🔑 检查 Token 状态...');
  
  const token = getToken();
  const duration = performance.now() - start;
  
  if (token) {
    console.log('✅ Token 有效');
    console.log(`   Token: ${token.substring(0, 50)}...`);
  } else {
    console.log('⚠️ Token 无效或不存在');
  }
  
  return {
    name: 'Token 状态检查',
    success: !!token,
    data: token ? { token: token.substring(0, 50) + '...' } : null,
    duration,
  };
}

/**
 * 运行所有测试
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 开始运行所有 API 测试...\n');
  console.log('='.repeat(50));
  
  const results: TestResult[] = [];
  
  // 1. 检查 Token
  results.push(checkTokenStatus());
  console.log('');
  
  // 2. 测试登录
  results.push(await testLogin());
  console.log('');
  
  // 3. 测试获取设备数据
  results.push(await testGetDeviceData());
  console.log('');
  
  // 4. 测试数据分组
  results.push(await testDataGrouping());
  console.log('');
  
  // 5. 测试开关列表
  results.push(await testSwitchList());
  console.log('');
  
  // 汇总结果
  console.log('='.repeat(50));
  console.log('📋 测试结果汇总:\n');
  
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  
  results.forEach((r) => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.name} (${r.duration.toFixed(2)}ms)`);
  });
  
  console.log('');
  console.log(`通过: ${passed}/${results.length}`);
  console.log(`失败: ${failed}/${results.length}`);
  console.log(`总耗时: ${totalTime.toFixed(2)}ms`);
}

// 挂载到 window 对象供控制台调用
const hbTest = {
  testLogin,
  testGetDeviceData,
  testDataGrouping,
  testSwitchList,
  checkTokenStatus,
  runAllTests,
};

// 仅在浏览器环境下挂载
if (typeof window !== 'undefined') {
  (window as unknown as { hbTest: typeof hbTest }).hbTest = hbTest;
  console.log('🐦 蜂鸟API测试工具已加载，使用 window.hbTest.runAllTests() 运行测试');
}

export {
  testLogin,
  testGetDeviceData,
  testDataGrouping,
  testSwitchList,
  checkTokenStatus,
  runAllTests,
};

export default hbTest;
