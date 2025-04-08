import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const createProxy = (prefixes) => {
    return prefixes.reduce((acc, prefix) => {
      acc[`/${prefix}`] = {
        target: env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(new RegExp(`^/${prefix}`), `/${prefix}`),
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
        ...createProxy([
          'api',
          'auth',
          'registers',
          'users',
          // 'products',
          // 'carts',
          'bookmarks',
          // 'addresses',
          'boards',
          'comments',
          'likes',
          'files',
        ]),
        // 구글 로그인
        '/auth/google': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
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
