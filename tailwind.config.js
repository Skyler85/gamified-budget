module.exports = {
  // ... 기존 설정
  theme: {
    extend: {
      colors: {
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // 다른 색상들...
      },
    },
  },
}
