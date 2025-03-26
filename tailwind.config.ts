import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/index.css'],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0px 10px 30px rgba(0,0,0,0.2)',
      },
      // login 창
      backgroundImage: {
        'login-bg': "url('/vid/LoginBackGround.mp4')", // ✅ 절대 경로 사용
      },
      fontFamily: {
        hamburg: ['Hamburg', 'sans-serif'],
        sans: ['Noto Sans KR', 'Inter', 'sans-serif'], // ✅ 한글 폰트 추가
        heading: ['Noto Sans KR', 'Poppins', 'sans-serif'], // ✅ 제목 폰트도 한글 지원
        body: ['Noto Sans KR', 'Roboto', 'sans-serif'], // ✅ 본문 폰트 한글 적용
      },
      keyframes: {
        'bg-move': {
          '0%': { backgroundPosition: '50% 0%' },
          '50%': { backgroundPosition: '50% 10%' },
          '100%': { backgroundPosition: '50% 0%' },
        },
      },
      animation: {
        'bg-move': 'bg-move 6s ease-in-out infinite',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        'register-card': 'hsl(var(--register-card))',
        'login-card': 'hsl(var(--login-card))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
