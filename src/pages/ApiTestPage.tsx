/**
 * API 测试页面
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HummingBirdApiTest } from '@/components/test';

const ApiTestPage: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      {/* 返回主页按钮 */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '8px 16px',
          backgroundColor: '#6366f1',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        ← 返回主页
      </Link>
      
      <HummingBirdApiTest />
    </div>
  );
};

export default ApiTestPage;
