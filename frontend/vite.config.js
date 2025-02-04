import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
  'process.env': {}, // process.env를 빈 객체로 설정하여 오류 방지
},
  server: {
    host:"0.0.0.0",
    port: 3000, // 포트를 3000으로 설정
    open: true, // 서버 시작 시 브라우저 자동 열기
    proxy: {
      '/api': {
        target: 'http://192.168.0.6:8000', // 백엔드 API 서버 주소
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 경로 제거
      },
            '/ws': {
        target: 'ws://192.168.0.6:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // 빌드 결과물 디렉토리 설정
    sourcemap: true, // 소스맵 생성
  },
  resolve: {
    alias: {
      '@redux': '/src/redux',  // '@redux'를 '/src/redux'로 매핑
    },
  },
});
