## Folder tree

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── reset-password
│   │   │   └── page.tsx
│   │   └── signup
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── trends
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/          # shadcn/ui 컴포넌트들
│   ├── auth/        # 인증 관련 컴포넌트
│   ├── dashboard/   # 대시보드 컴포넌트
│   ├── budget/
│   ├── layout/
│   ├── onboarding/
│   ├── profile/
│   ├── trends/
│   └── transactions/ # 거래 관련 컴포넌트
├── lib/
│   ├── auth-context.tsx
│   ├── useAuthSafe.ts
│   ├── onboarding-context.tsx
│   ├── supabase.ts  # Supabase 설정
│   ├── utils.ts     # 유틸리티 함수
│   └── validations.ts # Zod 스키마
├── types/
│   ├── database.ts  # TypeScript 타입 정의
│   ├── index.ts
│   └── models
│       ├── budget.ts
│       ├── category.ts
│       ├── profile.ts
│       ├── transaction.ts
│       └── trend.ts
└── hooks/           # 커스텀 훅
```
