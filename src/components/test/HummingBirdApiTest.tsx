/**
 * 蜂鸟物联平台 API 测试组件
 * 用于验证 API 连接和数据获取
 */

import { useState, useEffect } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { getDeviceInfo } from '@/sdk/hbsdk';
import type { DeviceInfo } from '@/types/hummingbird';

const EXTRA_DEVICES = [
  { id: '62415514', label: '设备 62415514' },
  { id: '47862598', label: '设备 47862598' },
  { id: '28022392', label: '设备 28022392' },
];

function DeviceDataPanel({ deviceId, label }: { deviceId: string; label: string }) {
  const { loading, error, deviceData, refresh } = useHummingBirdApi(deviceId, 0);
  const [expanded, setExpanded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  useEffect(() => {
    setInfoLoading(true);
    getDeviceInfo(deviceId)
      .then(res => {
        setDeviceInfo(res.result);
        setInfoError(null);
      })
      .catch(err => {
        setInfoError(err instanceof Error ? err.message : '获取设备信息失败');
      })
      .finally(() => setInfoLoading(false));
  }, [deviceId]);

  return (
    <section style={{
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      border: '1px solid #334155',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ color: '#38bdf8', margin: 0 }}>📡 {label}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              padding: '4px 14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            🔄 刷新
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              padding: '4px 14px',
              cursor: 'pointer',
              backgroundColor: expanded ? '#dc2626' : '#475569',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            {expanded ? '收起' : '展开原始数据'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8' }}>
          状态: <strong style={{ color: loading ? '#fbbf24' : '#4ade80' }}>{loading ? '加载中...' : '✓ 已加载'}</strong>
        </span>
        <span style={{ color: '#94a3b8' }}>
          数据条数: <strong style={{ color: '#22d3ee' }}>{deviceData.length}</strong>
        </span>
        {error && (
          <span style={{ color: '#f87171' }}>错误: {error.message}</span>
        )}
      </div>

      {/* 设备详细信息 */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #1e3a5f' }}>
        <div style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>🔍 设备基本信息</div>
        {infoLoading && <span style={{ color: '#fbbf24', fontSize: '12px' }}>加载中...</span>}
        {infoError && <span style={{ color: '#f87171', fontSize: '12px' }}>错误: {infoError}</span>}
        {deviceInfo && !infoLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
            {Object.entries(deviceInfo).map(([key, val]) => (
              <div key={key} style={{ fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>{key}: </span>
                <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
                  {val === null || val === undefined ? '-' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 属性表格 */}
      {deviceData.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: expanded ? '12px' : 0 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ border: '1px solid #334155', padding: '8px', color: '#22d3ee', textAlign: 'left' }}>属性代码</th>
              <th style={{ border: '1px solid #334155', padding: '8px', color: '#22d3ee', textAlign: 'left' }}>属性名称</th>
              <th style={{ border: '1px solid #334155', padding: '8px', color: '#22d3ee', textAlign: 'left' }}>值</th>
              <th style={{ border: '1px solid #334155', padding: '8px', color: '#22d3ee', textAlign: 'left' }}>单位</th>
            </tr>
          </thead>
          <tbody>
            {deviceData.map((item, i) => (
              <tr key={item.code ?? i} style={{ background: i % 2 === 0 ? '#1e293b' : '#0f172a' }}>
                <td style={{ border: '1px solid #334155', padding: '8px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '12px' }}>{item.code}</td>
                <td style={{ border: '1px solid #334155', padding: '8px', color: '#e2e8f0' }}>{item.name ?? '-'}</td>
                <td style={{ border: '1px solid #334155', padding: '8px', color: '#4ade80', fontFamily: 'monospace' }}>{String(item.value)}</td>
                <td style={{ border: '1px solid #334155', padding: '8px', color: '#94a3b8' }}>{item.unit ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {expanded && (
        <pre style={{
          background: '#0f172a',
          padding: '12px',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px',
          borderRadius: '6px',
          color: '#a5f3fc',
          border: '1px solid #334155',
        }}>
          {JSON.stringify(deviceData, null, 2)}
        </pre>
      )}
    </section>
  );
}

export function HummingBirdApiTest() {
  const {
    loading,
    error,
    deviceData,
    groupedData,
    switchNum,
    getStatus,
    getSwitches,
    refresh,
  } = useHummingBirdApi();

  const [showRawData, setShowRawData] = useState(false);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: '24px', 
      fontFamily: 'Consolas, Monaco, monospace', 
      fontSize: '14px',
      backgroundColor: '#0a1628',
      color: '#e2e8f0',
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 9999
    }}>
      <h2 style={{ color: '#22d3ee', marginBottom: '24px', fontSize: '24px' }}>
        🐦 蜂鸟物联平台 API 测试
      </h2>
      
      {/* 状态信息 */}
      <section style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>📊 连接状态</h3>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8' }}>加载状态: </span>
          <strong style={{ color: loading ? '#fbbf24' : '#4ade80' }}>
            {loading ? '加载中...' : '✓ 已加载'}
          </strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8' }}>错误信息: </span>
          <strong style={{ color: error ? '#f87171' : '#4ade80' }}>
            {error ? error.message : '✓ 无'}
          </strong>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ color: '#94a3b8' }}>数据条数: </span>
          <strong style={{ color: '#22d3ee' }}>{deviceData.length}</strong>
        </div>
        <button 
          onClick={refresh} 
          disabled={loading}
          style={{ 
            padding: '8px 20px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          🔄 刷新数据
        </button>
      </section>

      {/* 开关控制码 */}
      <section style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>🔌 开关控制码</h3>
        {switchNum ? (
          <pre style={{ 
            background: '#0f172a', 
            padding: '12px', 
            overflow: 'auto',
            borderRadius: '6px',
            color: '#a5f3fc',
            border: '1px solid #334155'
          }}>
            {JSON.stringify(switchNum, null, 2)}
          </pre>
        ) : (
          <p style={{ color: '#94a3b8' }}>未获取到开关控制码</p>
        )}
      </section>

      {/* 开关列表 */}
      <section style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>📋 开关列表</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              <th style={{ border: '1px solid #334155', padding: '10px', color: '#22d3ee', textAlign: 'left' }}>名称</th>
              <th style={{ border: '1px solid #334155', padding: '10px', color: '#22d3ee', textAlign: 'left' }}>代码</th>
              <th style={{ border: '1px solid #334155', padding: '10px', color: '#22d3ee', textAlign: 'left' }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {getSwitches().map((sw) => (
              <tr key={sw.code} style={{ background: '#1e293b' }}>
                <td style={{ border: '1px solid #334155', padding: '10px', color: '#e2e8f0' }}>{sw.name}</td>
                <td style={{ border: '1px solid #334155', padding: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{sw.code}</td>
                <td style={{ 
                  border: '1px solid #334155', 
                  padding: '10px', 
                  color: sw.value.includes('✅') ? '#4ade80' : '#f87171',
                  fontWeight: 'bold'
                }}>
                  {sw.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 设备状态 */}
      <section style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>📡 设备状态</h3>
        <pre style={{ 
          background: '#0f172a', 
          padding: '12px', 
          overflow: 'auto', 
          maxHeight: '300px',
          borderRadius: '6px',
          color: '#a5f3fc',
          border: '1px solid #334155'
        }}>
          {JSON.stringify(getStatus(), null, 2)}
        </pre>
      </section>

      {/* 分组数据 */}
      <section style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>📁 分组数据概览</h3>
        <div>
          {Object.entries(groupedData).map(([mode, groups]) => (
            <div key={mode} style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#fbbf24', fontSize: '15px' }}>访问模式: {mode}</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
                {Object.entries(groups as Record<string, unknown[]>).map(([group, items]) => (
                  <li key={group} style={{ color: '#94a3b8', marginBottom: '4px' }}>
                    <span style={{ color: '#22d3ee' }}>{group}</span>: 
                    <span style={{ color: '#4ade80', marginLeft: '8px' }}>{(items as unknown[]).length}</span> 条数据
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 原始数据 */}
      <section style={{ 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '12px' }}>
          📜 原始数据 
          <button 
            onClick={() => setShowRawData(!showRawData)}
            style={{ 
              marginLeft: '12px', 
              padding: '4px 12px', 
              cursor: 'pointer',
              backgroundColor: showRawData ? '#dc2626' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {showRawData ? '隐藏' : '显示'}
          </button>
        </h3>
        {showRawData && (
          <pre style={{ 
            background: '#0f172a', 
            padding: '12px', 
            overflow: 'auto', 
            maxHeight: '400px',
            fontSize: '12px',
            borderRadius: '6px',
            color: '#a5f3fc',
            border: '1px solid #334155'
          }}>
            {JSON.stringify(deviceData, null, 2)}
          </pre>
        )}
      </section>

      {/* 其他设备数据 */}
      <h2 style={{ color: '#22d3ee', margin: '32px 0 16px', fontSize: '20px' }}>
        📦 其他设备数据
      </h2>
      {EXTRA_DEVICES.map(dev => (
        <DeviceDataPanel key={dev.id} deviceId={dev.id} label={dev.label} />
      ))}
    </div>
  );
}

export default HummingBirdApiTest;
