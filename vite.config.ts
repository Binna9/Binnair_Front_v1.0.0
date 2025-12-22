import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 백엔드 API 기본 URL (환경변수가 없으면 기본값 사용)
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080';

  // 공통 프록시 설정 (세션 쿠키 전달 보장)
  const commonProxyConfig = {
    target: apiBaseUrl,
    changeOrigin: true,
    secure: false,
    // 쿠키 전달 보장 (세션 쿠키 방식)
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
  };

  // 프록시 설정 헬퍼 함수
  const createProxy = (prefixes) => {
    return prefixes.reduce((acc, prefix) => {
      acc[`/${prefix}`] = {
        ...commonProxyConfig,
      };
      return acc;
    }, {});
  };

  return {
    plugins: [react()],
    server: {
      hmr: true,
      port: 5173,
      proxy: {
        // 인증 없이 사용 가능한 경로
        '/auth': {
          ...commonProxyConfig,
        },
        '/registers': {
          ...commonProxyConfig,
        },
        '/swagger-ui': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/api-docs': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/v3/api-docs': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/websocket': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        // 인증된 사용자만 접근 가능한 경로 (세션 쿠키 필요)
        ...createProxy([
          'users',      // /users/** - 사용자 이미지 포함
          'files',      // /files/** - 파일 업로드/다운로드
          'boards',     // /boards/**
          'roles',      // /roles/**
          'permissions', // /permissions/**
          'menus',      // /menus/**
          'bookmarks',  // /bookmarks/**
          'products',   // /products/**
          'carts',      // /carts/**
          'addresses',   // /addresses/**
          'comments',   // /comments/**
          'likes',      // /likes/**
          'chats',      // /chats/**
        ]),
        // 구글 로그인
        '/auth/google': {
          ...commonProxyConfig,
          bypass: (req) => {
            if (req.method === 'GET') {
              return req.url;
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
      },
    },
  };
});
