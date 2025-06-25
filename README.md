## Folder tree

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # shadcn/ui 컴포넌트들
│   ├── auth/        # 인증 관련 컴포넌트
│   ├── dashboard/   # 대시보드 컴포넌트
│   └── transactions/ # 거래 관련 컴포넌트
├── lib/
│   ├── supabase.ts  # Supabase 설정
│   ├── utils.ts     # 유틸리티 함수
│   └── validations.ts # Zod 스키마
├── types/
│   └── database.ts  # TypeScript 타입 정의
└── hooks/           # 커스텀 훅
```
