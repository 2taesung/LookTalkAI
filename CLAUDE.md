# AfterDoc-React Project Guidelines for Claude Code

> **보조 문서:** 상세한 패턴과 예시는 다음 문서를 참조하세요
> - **[CLAUDE_PATTERNS.md](./CLAUDE_PATTERNS.md)** - 코드 패턴 & 예시 모음
> - **[CLAUDE_TESTING.md](./CLAUDE_TESTING.md)** - 테스트 전략 & 가이드

## ⚡ 빠른 명령어

### 🔄 동기화 명령어
**"sync claude"** 또는 **".cursor/rules 기준으로 CLAUDE.md 전체 동기화해주세요"** 입력 시:
→ .cursor/rules 디렉토리의 모든 규칙을 CLAUDE.md에 정확히 동기화 수행

#### sync claude 실행 절차 (Claude Code용)
1. **TodoWrite 도구로 동기화 작업 계획 수립**
2. **.cursor/rules/*.mdc 파일들을 모두 Read 도구로 확인**
3. **CLAUDE.md의 해당 섹션들과 비교하여 불일치 부분 식별**
4. **Edit/MultiEdit 도구로 CLAUDE.md 업데이트** (기존 내용 보존하면서 추가/수정)
5. **변경사항 요약 제공** (커밋은 사용자가 직접 수행)

#### 동기화 시 주의사항
- 기존 CLAUDE.md 구조와 스타일 유지
- .cursor/rules의 모든 내용을 빠짐없이 반영
- 중복 내용 방지, 기존 좋은 예시는 보존
- 의료 도메인 컨텍스트 유지
- 한국어 가이드라인 준수

## 🏥 프로젝트 개요
AfterDoc-React는 의료진과 환자를 연결하는 디지털 헬스케어 플랫폼입니다.
- **도메인**: 의료/병원 관리 시스템
- **사용자**: 의료진, 병원 관리자, 환자, 시스템 관리자
- **주요 기능**: 진료 예약, 의료 기록 관리, 커뮤니케이션, 자동화 메시지, 관리자 대시보드

## 🛠 핵심 기술 스택

### 아키텍처
- **모노레포**: Turborepo 기반 멀티 앱 구조
- **패키지 매니저**: pnpm (필수 사용)
- **빌드 도구**: Vite
- **언어**: TypeScript (strict 모드)
- **Node.js**: 22.13.1 이상

### 프론트엔드
- **프레임워크**: React 18
- **상태 관리**: Jotai + React Query (TanStack Query v5)
- **폼 관리**: React Hook Form
- **스타일링**: Tailwind CSS + SCSS
- **라우팅**: React Router
- **텍스트 에디터**: 커스텀 Quill 기반 에디터

### 개발 도구
- **코드 품질**: Biome (ESLint + Prettier 대체) - 필수 준수
- **테스트**: Vitest + Testing Library + Playwright
- **타입 체크**: TypeScript
- **Git Hooks**: Husky + lint-staged

#### Biome 린트 규칙 (필수 준수)
모든 코드는 Biome 린트 규칙을 통과해야 합니다:
- 재할당되지 않는 변수는 `const` 사용 (`let` 금지)
- 후행 쉼표 사용 (배열, 객체, 함수 인자)
- 파일 끝 개행 필수
- `any` 타입 사용 금지 (테스트 코드 포함)
- 일관된 들여쓰기와 포맷팅

```bash
# Biome 체크 명령어
pnpm biome check .                 # 전체 체크
pnpm biome check --apply .         # 자동 수정
pnpm biome check path/to/file.ts   # 특정 파일 체크
```

## 📁 모노레포 구조

```
AfterDoc-React/
├── apps/
│   ├── services/
│   │   ├── afterdoc-saas-web/        # 메인 웹 애플리케이션
│   │   ├── afterdoc-hospital-mobile/ # 병원용 모바일 앱
│   │   ├── afterdoc-admin/           # 관리자 애플리케이션
│   │   ├── afterdoc-client-server/   # 클라이언트 서버
│   │   └── ads-storybook/            # 디자인 시스템 스토리북
│   └── modules/                      # 개별 모듈들
│       └── button/                   # 버튼 모듈 예시
├── packages/
│   ├── afterdoc-design-system/       # 공유 디자인 시스템
│   ├── shared-hooks/                 # 공유 React 훅
│   ├── shared-utils/                 # 공유 유틸리티
│   ├── afterdoc-text-editor/         # 커스텀 텍스트 에디터
│   └── tailwind-base/                # Tailwind 기본 설정
├── .cursor/rules/                    # 상세 개발 규칙들
├── e2e/                              # E2E 테스트
└── scripts/                          # 배포 및 유틸리티 스크립트
```

### 앱별 상세 구조 (.cursor/rules/folder-structure.mdc 기반)
```
src/
├── apis/           # API 관련 코드
│   ├── swaggers/   # Swagger 생성 API 클라이언트
│   └── [domain]/   # 도메인별 API 함수
├── assets/         # 정적 자산(이미지, 아이콘 등)
├── components/     # 공통 컴포넌트
│   └── ComponentName/
│       ├── ComponentName.tsx        # 주 컴포넌트 파일
│       ├── ComponentName.module.css # 스타일(필요한 경우)
│       ├── ComponentName.test.tsx   # 테스트 파일(필요한 경우)
│       └── index.ts                 # 내보내기 파일
├── config/         # 설정 파일
├── hooks/          # 커스텀 훅
│   ├── api/        # API 관련 훅
│   ├── form/       # 폼 관련 훅
│   └── ui/         # UI 관련 훅
├── mocks/          # MSW 모킹 데이터
├── pages/          # 페이지 컴포넌트
│   └── PageName/
│       ├── PageName.tsx        # 페이지 컴포넌트
│       ├── PageName.module.css # 스타일(필요한 경우)
│       ├── components/         # 페이지 전용 컴포넌트
│       └── index.ts            # 내보내기 파일
├── scripts/        # 스크립트 파일
├── shared/         # 공유 로직
│   ├── components/ # 공유 컴포넌트
│   ├── constants/  # 상수
│   ├── hooks/      # 공유 훅
│   ├── types/      # 타입 정의
│   └── utils/      # 유틸리티
├── states/         # Jotai 상태 관리
├── styles/         # 글로벌 스타일
├── templates/      # 페이지 템플릿
├── types/          # 타입 정의
└── utils/          # 유틸리티 함수
```

### 패키지 폴더 구조
```
packages/
├── package-name/
│   ├── src/
│   │   ├── components/   # 패키지 컴포넌트
│   │   ├── hooks/        # 패키지 훅
│   │   ├── utils/        # 패키지 유틸리티
│   │   └── index.ts      # 패키지 진입점
│   ├── package.json
│   └── tsconfig.json
```

### 파일 그룹화 원칙
- 관련 있는 파일들은 함께 그룹화
- 페이지별 컴포넌트는 해당 페이지 폴더 내 `components/` 폴더에 배치
- 재사용 가능한 컴포넌트는 글로벌 `components/` 폴더에 배치
- 여러 앱에서 공유되는 기능은 패키지로 분리

## 🏥 도메인 지식

### 의료 도메인 용어
- **환자 (Patient)**: 의료 서비스를 받는 사용자
- **의료진 (Medical Staff)**: 의사, 간호사 등 의료 제공자
- **진료 (Medical Consultation)**: 의료진과 환자 간의 진료 행위
- **처방전 (Prescription)**: 의사가 발행하는 약물 처방서
- **의무기록 (Medical Record)**: 환자의 의료 정보 기록
- **예약 (Appointment)**: 진료 일정 예약
- **자동화 메시지 (Automation Message)**: 병원에서 환자에게 발송하는 자동 알림
- **SKU (Stock Keeping Unit)**: 재고 관리 단위
- **어드민 사용자 (Admin User)**: 시스템 관리 권한을 가진 사용자

### 비즈니스 규칙
- 환자 개인정보는 최고 수준의 보안 적용 (HIPAA 준수)
- 의료 기록은 법적 보존 기간 준수 (7년)
- 응급 상황 시 즉시 대응 가능한 시스템 설계
- 의료진 권한에 따른 차등적 정보 접근
- 자동화 메시지는 환자 동의 하에만 발송
- 관리자 권한은 역할별로 세분화 (viewer, admin 등)

### 핵심 도메인 모델
```typescript
interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  medicalRecords: MedicalRecord[];
  appointments: Appointment[];
}

interface MedicalStaff {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  department: string;
  permissions: Permission[];
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface AutomationMessage {
  id: string;
  content: string;
  replaceableTexts: ReplaceableText[];
  maxLength: number;
}
```

## 💻 코딩 스타일 가이드

**상세 규칙:** [.cursor/rules/code-style.mdc](./.cursor/rules/code-style.mdc)

### Biome 린트 규칙 (최우선 준수)
**모든 코드 작성 시 Biome 규칙을 반드시 준수해야 합니다:**

#### 변수 선언
```typescript
// ❌ 잘못된 예 - 재할당되지 않는 변수에 let 사용
let currentUrl = page.url();

// ✅ 올바른 예 - const 사용
const currentUrl = page.url();
```

#### any 타입 금지
```typescript
// ❌ 잘못된 예
const mockApiClient = apiClient as any;
const requests: any[] = [];

// ✅ 올바른 예 - 명시적 타입 정의
interface MockApiClient {
  v3: {
    someHandler: ReturnType<typeof vi.fn>;
  };
}
const mockApiClient = apiClient as unknown as MockApiClient;

interface PaginationRequest {
  url: string;
  timestamp: number;
}
const requests: PaginationRequest[] = [];
```

#### 포맷팅 규칙
- 후행 쉼표 사용 (배열, 객체, 함수 인자 마지막)
- 파일 끝에 개행 추가
- 일관된 들여쓰기

### 기본 원칙 (.cursor/rules/code-style.mdc + typescript.mdc 기반)
- **한국어 프로젝트**: 주석, 변수명, UI 텍스트는 한국어 사용
- **함수형 프로그래밍**: 클래스보다 함수형 컴포넌트 선호
- **절대 경로**: 모든 import는 절대 경로 사용
- **타입 안전성**: TypeScript strict 모드 준수
- **interfaces 선호**: types보다 interfaces 사용
- **enums 대신 maps**: enums 대신 객체 maps 사용
- **간결하고 기술적인 코드**: 정확한 예시와 함께 작성
- **선언적 프로그래밍**: 명령형보다 선언적 패턴 선호
- **순수 함수에 function 키워드 사용**
- **조건문에서 불필요한 중괄호 피하기**
- **forEach 대신 for...of 루프 사용**
- **선언적 JSX 사용**
- **보조 동사를 포함한 설명적인 변수명 사용** (isLoading, hasError 등)
- **중요한 내용에 대해서는 한국어 주석 포함** (/* */ 사용)
- **파일 구조**: 내보낸 컴포넌트, 하위 컴포넌트, 헬퍼 함수, 정적 콘텐츠, 타입 순

### 파일 및 디렉토리 명명 (.cursor/rules/naming-conventions.mdc 기반)
- **컴포넌트**: PascalCase, `export default function` 사용 (예: `PatientProfile.tsx`)
- **훅**: kebab-case with use prefix, `export const` 사용 (예: `use-patient-detail-info.ts`)
- **유틸리티**: kebab-case, `export const` 사용 (예: `format-phone-number.ts`)
- **폴더**: kebab-case (예: `patient-management/`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`)
- **컴포넌트 파일**: components 폴더 하위에 위치, NewComponent.tsx 형식으로 명명
- **폴더 디렉토리**: 소문자와 대시 사용 (예: components/auth-wizard)
- **전역 공유 코드**: packages/shared-hooks와 packages/shared-utils에 구성

### Import 순서 및 구조
```typescript
// 1. React 관련
import React, { useState, useEffect, useCallback } from 'react';

// 2. 외부 라이브러리
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';

// 3. 내부 모듈 (절대 경로)
import { Button } from 'afterdoc-design-system/components/Atoms/Button/Button';
import { usePatientInfo } from 'afterdoc-saas-web/hooks/api/use-patient-info';
import { QUERY_KEYS } from 'afterdoc-saas-web/shared/constants/query-keys';

// 4. 상대 경로 import
import { PatientCard } from '../components/PatientCard';
import './PatientProfile.scss';
```

### 컴포넌트 생성 프로세스 (.cursor/rules/component-creation.mdc 기반)
1. **기존 컴포넌트 확인**: 다음 위치에서 유사한 컴포넌트 존재 여부 확인
   - afterdoc-saas-web 작업 시: `packages/afterdoc-design-system/src/components`
   - 기타: `apps/services/{작업중인 애플리케이션명}/src/shared/components/*`
2. **컴포넌트 생성 원칙**:
   - 단일 책임: 하나의 컴포넌트는 하나의 책임만
   - 재사용성: 가능한 한 재사용 가능하게 설계
   - 접근성: a11y 고려한 마크업
   - 타입 안전성: Props 인터페이스 명확히 정의
   - **중요한 내용에 대해서는 한국어 주석 포함**
   - **로직 분리**: 가급적 별도의 커스텀 훅을 통해 로직 분리
   - **상태 관리**: Jotai 사용, 폼 처리는 React-hook-form 사용

### 컴포넌트 구조 패턴 (TypeScript interface 사용)
```typescript
/*
 * 환자 프로필 컴포넌트
 * - 환자 기본 정보 표시
 * - 수정 및 읽기 전용 모드 지원
 */
interface PatientProfileProps {
  patientId: string;
  onEdit?: (patient: Patient) => void;
  isReadOnly?: boolean;
}

// 버튼 컴포넌트 예시 - interface 선호
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function PatientProfile({
  patientId,
  onEdit,
  isReadOnly = false
}: PatientProfileProps) {
  // 상태 관리
  const [isEditing, setIsEditing] = useState(false);

  // 데이터 페칭 - useSuspenseQuery 우선 고려
  const { data: patient } = useSuspenseQuery({
    queryKey: [QUERY_KEYS.patient, patientId],
    queryFn: () => fetchPatient(patientId),
  });

  // 이벤트 핸들러
  const handleEditClick = useCallback(() => {
    if (onEdit && patient) {
      onEdit(patient);
    }
    setIsEditing(true);
  }, [onEdit, patient]);

  // 포맷팅된 데이터
  const formattedPhoneNumber = patient?.phoneNumber
    ? formatPhoneNumber(patient.phoneNumber)
    : '';

  return (
    <div className="patient-profile">
      <h2>{patient.name}</h2>
      <p>{formattedPhoneNumber}</p>
      {!isReadOnly && (
        <Button onClick={handleEditClick}>
          수정
        </Button>
      )}
    </div>
  );
}
```

## 🔄 상태 관리 패턴

**상세 규칙:** [.cursor/rules/state-management.mdc](./.cursor/rules/state-management.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - 상태 관리 패턴](./CLAUDE_PATTERNS.md#상태-관리-패턴)

### 핵심 원칙
- **Jotai**: 전역 상태 관리 (atom 기반)
- **React Query**: 서버 상태 관리 (useSuspenseQuery 우선 고려)
- **React Hook Form**: 폼 상태 관리

## 🌐 API 통신 규칙

**상세 규칙:** [.cursor/rules/api.mdc](./.cursor/rules/api.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - API 통신 패턴](./CLAUDE_PATTERNS.md#api-통신-패턴)

### 기본 원칙
- API 호출 함수는 별도로 정의하고 재사용
- 함수명: HTTP 메서드를 접두어로 사용 (get/fetch, post/create 등)
- **useSuspenseQuery 우선 고려** (성능상 이점)
- API 응답은 `SHARED_UTILS.api.checkApiResponse`로 검증
- Parameters 타입 사용으로 타입 안정성 확보

## 🎨 UI 컴포넌트 및 스타일링

**상세 규칙:** [.cursor/rules/ui-styling.mdc](./.cursor/rules/ui-styling.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - UI 스타일링 패턴](./CLAUDE_PATTERNS.md#ui-스타일링-패턴)

### 기본 원칙
- Tailwind CSS + SCSS 사용
- `packages/tailwind-base/tailwind.config.js` 설정 준수
- 0-100px: 숫자만 사용, 100px 초과: 대괄호 명시
- 동적 스타일링: `customTwMerge` 필수 사용
- 기존 컴포넌트 재사용 우선 (디자인 시스템 확인)

### Toss 프론트엔드 디자인 원칙

**상세 규칙:** [.cursor/rules/toss-frontend-rules.mdc](./.cursor/rules/toss-frontend-rules.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - Toss 프론트엔드 원칙 상세](./CLAUDE_PATTERNS.md#toss-프론트엔드-원칙-상세)

**4가지 핵심 원칙:**
1. **가독성**: 매직 넘버 명명, 구현 추상화, 조건 명명
2. **예측 가능성**: 반환 타입 표준화, 명시적 부수 효과
3. **응집도**: 기능별 코드 조직, 관련 로직 함께 유지
4. **결합도**: 성급한 추상화 방지, 상태 범위 지정, 컴포지션 활용

## 📝 폼 관리 패턴

**상세 가이드:** [CLAUDE_PATTERNS.md - 폼 관리 패턴](./CLAUDE_PATTERNS.md#폼-관리-패턴)

### 핵심 원칙
- React Hook Form 사용 (register, handleSubmit, control)
- 검증 규칙은 register/Controller의 rules 속성에 정의
- 에러 상태는 formState.errors로 관리

## 🧪 테스트 전략

**상세 규칙:** [.cursor/rules/testing.mdc](./.cursor/rules/testing.mdc), [.cursor/rules/playwright.mdc](./.cursor/rules/playwright.mdc)
**상세 가이드:** [CLAUDE_TESTING.md](./CLAUDE_TESTING.md)

### 테스트 코드 작성 원칙
- **any 타입 사용 금지**: 테스트 코드에서도 명시적 타입 정의 필수
- **테스트 독립성**: 각 테스트는 독립적으로 실행 가능
- **명확한 테스트명**: 한국어로 "무엇을 테스트하는지" 명확히 표현

### 테스트 우선순위
1. 핵심 비즈니스 로직 (환자 정보, 예약, 자동화 메시지)
2. 보안 관련 기능 (인증, 권한, 개인정보 보호)
3. 사용자 인터페이스 (주요 플로우)
4. API 통신 (데이터 무결성)

### E2E 테스트 필수 규칙

#### 1. data-testid 우선화 원칙 (최우선)
**가장 중요한 규칙**: 요소 선택 시 `data-testid`를 최우선으로 사용해야 합니다.

```typescript
// ✅ 올바른 방법 - getByTestId 사용
await page.getByTestId('login-submit-button').click();
await page.getByTestId('customer-chat-title').waitFor({ state: 'visible' });

// ❌ 절대 사용 금지 - locator와 data-testid 속성 선택자
await page.locator('[data-testid="login-submit-button"]').click();
await page.locator('[class*="Card"]').click();
```

#### 2. 셀렉터 우선순위
1. **data-testid** (getByTestId) - 가장 안정적
2. **Role + Name** (getByRole) - 접근성과 의미 명확
3. **Label + Name** (getByLabel) - 폼 요소
4. **Placeholder** (getByPlaceholder) - 입력 필드
5. **Text Content** (getByText) - 텍스트 기반 요소

#### 3. 로깅 표준화 (필수)
```typescript
// ✅ 올바른 로깅
console.info('Step 1: 로그인 페이지 진입');  // 정보성 로그
console.info('✓ 테스트 성공');
console.error('❌ 테스트 실패:', error);     // 오류 로그
console.warn('테스트 실패로 인한 재시도');    // 경고 로그

// ❌ console.log 사용 금지
console.log('이렇게 하지 마세요');  // 금지!
```

## ⚙️ 개발 환경 설정 (.cursor/rules/dev-environment.mdc + ide-setup.mdc 기반)

### 필요 환경
- **Node.js**: 22.13.1 이상
- **PNPM**: 9.x 이상
- **Git**: 최신 버전

### 프로젝트 초기 설정
```bash
# 의존성 설치
pnpm install

# Git hooks 설정
pnpm prepare

# 웹 애플리케이션 개발 서버
pnpm afterdoc-saas-web:dev

# 모바일 애플리케이션 개발 서버
pnpm afterdoc-hospital-mobile:dev

# 스토리북 개발 서버
pnpm ads-storybook
```

### VS Code 설정

#### 권장 확장 프로그램
- **Cursor**: AI 기반 코드 완성 및 생성 도구
- **Biome**: 코드 포맷팅 및 린팅 도구
- **TypeScript Vue Plugin (Volar)**: Vue 파일 지원
- **Tailwind CSS IntelliSense**: Tailwind CSS 클래스 자동 완성
- **GitLens**: Git 통합 확장

#### 워크스페이스 설정 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.defaultFormatter": "biomejs.biome",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.tabSize": 2,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### 패키지 관리
```bash
# 특정 앱에 패키지 설치
cd apps/services/afterdoc-saas-web
pnpm add package-name

# 루트 워크스페이스에 패키지 설치
pnpm add package-name -w

# 내부 패키지 참조 (package.json)
{
  "dependencies": {
    "shared-hooks": "workspace:*",
    "shared-utils": "workspace:*",
    "afterdoc-design-system": "workspace:*"
  }
}
```

## 🔧 개발 워크플로우

### 개발 전/후 필수 체크리스트

**상세 규칙:** [.cursor/rules/dev-workflow-checklist.mdc](./.cursor/rules/dev-workflow-checklist.mdc)

**모든 코드 개발은 다음 체크리스트를 통과해야만 진행/완료할 수 있습니다:**

#### 개발 전 필수 체크 (3가지)
1. `pnpm lint` - Biome 린트 에러 없어야 함
2. `pnpm check-types` - TypeScript 타입 에러 없어야 함
3. `pnpm test` - 기존 테스트 모두 통과해야 함

#### 개발 후 필수 체크 (3가지)
1. `pnpm lint` - 새 코드 린트 에러 없어야 함
2. `pnpm check-types` - 새 코드 타입 에러 없어야 함
3. `pnpm test` - 전체 테스트(기존 + 신규) 모두 통과해야 함

#### 개발 완료 기준
- ✅ 개발 전 체크리스트 3가지 모두 통과
- ✅ 개발 진행 완료
- ✅ 개발 후 체크리스트 3가지 모두 통과

#### 체크리스트 실패 시 대응
1. **Lint 실패**: `pnpm biome check --write .`로 자동 수정 시도 → 수동 수정 → 재확인
2. **타입 에러 실패**: 에러 메시지 확인 → 타입 정의 수정 → `any` 사용 금지 → 재확인
3. **테스트 실패**: 실패 케이스 확인 → 코드/테스트 수정 → 새 기능 테스트 추가 → 재확인

### Git 브랜치 전략
- `main`: 프로덕션 브랜치 (직접 푸시 금지)
- `dev`: 개발 통합 브랜치
- `feat/기능명`: 새 기능 개발 (예: `feat/add-admin-hooks`)
- `fix/이슈번호`: 버그 수정 (예: `fix/patient-form-validation`)
- `refactor/대상`: 리팩토링 (예: `refactor/patient-hooks`)
- `hotfix/설명`: 긴급 수정
- `test/설명`: 테스트 코드 작성/수정 (예: `test/mrs_oh_shaking_issue`)
- `docs/설명`: 문서 업데이트 (예: `docs/update-claude-md-with-cursor-rules`)

### 커밋 메시지 규칙

**상세 규칙:** [.cursor/rules/commit.mdc](./.cursor/rules/commit.mdc)

기본 규칙:

```
# 커밋 타입
- FEAT: 새로운 기능 추가
- FIX: 버그 수정
- REFACTOR: 코드 리팩토링 및 성능 개선
- CHORE: 패키지 매니저 추가, 빌드 및 테스트 작업
- DOCS: 문서 수정
- DESIGN: UI 및 스타일링 관련 변경사항
- STYLE: 코드 스타일 변경
- TEST: 테스트 코드 추가
- BUILD: 빌드 작업

# 커밋 메시지 구조
1. 제목 (첫 번째 줄): [앱명] TYPE: 변경 내용 요약
2. 빈 줄 (두 번째 줄): 제목과 본문 구분
3. 본문 (세 번째 줄부터): 변경 사항에 대한 자세한 설명

# 예시:
[애프터닥 saas 웹] FEAT: 로그인 페이지 구현
[병원용 모바일앱] FIX: 환자 목록 페이지네이션 버그 수정
[디자인 시스템] DESIGN: 버튼 UI 변경
REFACTOR: 공통 훅 리팩토링
```

### Pull Request 작성 가이드 (.cursor/rules/pull-request.mdc 기반)

#### PR 템플릿 (필수 준수)
```markdown
## 🚀 어떤 PR인가요?
[변경 유형(버그 수정/기능 추가/리팩토링/성능 개선)과 변경 내용을 간결하게 설명합니다.]

## 🤔 작업 배경
[이 작업이 필요했던 이유나 배경을 상세히 설명합니다.]
- Fixes #이슈번호 (이슈를 해결하는 경우)
- Closes #이슈번호 (이슈를 종료하는 경우)
- Related to #이슈번호 (관련 이슈가 있는 경우)

## 📝 주요 변경 사항
* 변경 사항 1: [어떤 파일/기능이 어떻게 변경되었는지 구체적으로 설명]
* 변경 사항 2: [변경 내용과 그 영향 범위]
* 변경 사항 3: [코드 변경의 주요 포인트와 개선점]

## ✔️ 테스트 방법

### E2E 테스트 실행 명령어
```bash
# Playwright E2E 테스트
pnpm playwright test              # 모든 테스트 실행
pnpm playwright test --ui         # UI 모드로 테스트 실행
pnpm playwright test --debug      # 디버그 모드로 테스트 실행
pnpm playwright show-report       # 테스트 리포트 보기
```

### ⚠️ E2E 테스트 작성 시 필수 규칙
```typescript
// ❌ 절대 사용 금지 - 클래스 선택자와 locator 패턴
await page.locator('[class*="EventListCard"]').click();        // ❌ 금지!
await page.locator('[data-testid="event-list-card"]').click(); // ❌ 금지!

// ✅ 반드시 이렇게 사용 - Playwright의 getBy* 메서드
await page.getByTestId('event-list-card').click();              // ✅ 올바름!
await page.getByRole('button', { name: '제출' }).click();       // ✅ 올바름!
await page.getByPlaceholder('아이디 입력').fill('test');        // ✅ 올바름!
await page.getByText('환자 정보').click();                      // ✅ 올바름!
```

### E2E 테스트 선택자 우선순위
1. **getByTestId**: 가장 안정적 (컴포넌트에 data-testid 추가 필요)
2. **getByRole**: 접근성과 의미가 명확한 요소
3. **getByPlaceholder**: 입력 필드
4. **getByText**: 텍스트 기반 요소
5. **getByLabel**: 폼 요소

## ✔️ 테스트 방법
1. [환경 설정 또는 특정 페이지로 이동]
2. [특정 액션 수행 방법]
3. [예상되는 결과 및 확인 방법]

## ⚠️ 잠재적 부작용 / 고려 사항
[변경사항으로 인해 발생할 수 있는 부작용이나 주의해야 할 점을 기술합니다.]

## 📸 스크린샷 (선택사항)
[UI 변경이 있는 경우 변경 전/후 스크린샷을 첨부합니다.]
```

### 코드 리뷰 체크리스트
- [ ] 의료 도메인 규칙 준수
- [ ] 개인정보 보호 규정 준수 (민감 정보 로깅 금지)
- [ ] TypeScript 타입 안전성
- [ ] 성능 최적화 (React Query 캐싱, 메모이제이션 등)
- [ ] 접근성 (a11y) 고려
- [ ] 테스트 코드 작성 (단위/통합/E2E)
- [ ] 에러 처리 및 사용자 피드백
- [ ] 코드 스타일 가이드 준수
- [ ] 보안 취약점 검토

## ♻️ 리팩토링 가이드라인

**상세 규칙:** [.cursor/rules/refactoring.mdc](./.cursor/rules/refactoring.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - 리팩토링 패턴](./CLAUDE_PATTERNS.md#리팩토링-패턴)

### 기본 원칙
1. **기능 보존**: 리팩토링 전후 동작 동일
2. **타입 안전성**: 타입/린트 에러 없음
3. **점진적 변경**: 작은 단위로 변경 후 테스트
4. **테스트 주도**: 변경 전후 테스트 실행

## 🚨 보안 및 컴플라이언스

### 필수 보안 규칙
- 모든 환자 데이터는 암호화 저장
- API 키, 토큰은 환경 변수로만 관리 (`.env` 파일 사용)
- 민감한 정보는 로그에 출력 절대 금지
- HTTPS 통신 필수
- 세션 타임아웃 적용
- SQL Injection, XSS 방지

### 개인정보 보호 패턴
```typescript
// 좋은 예: 민감한 정보 마스킹
const maskedPhoneNumber = phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2');

// 로깅 시 민감 정보 제거
const safeLogData = {
  patientId: patient.id,
  action: 'update',
  timestamp: new Date().toISOString(),
  // 개인정보는 로그에서 제외
};
console.info('Patient updated:', safeLogData);

// 나쁜 예: 민감한 정보 로그 출력 (절대 금지)
console.log('Patient data:', patientData); // 🚫 절대 금지
console.log('User token:', authToken);     // 🚫 절대 금지
```

### 권한 관리
```typescript
// 권한 체크 훅
export const usePermissions = () => {
  const { authorizationTypeID } = useUserInfo();
  
  return {
    canViewPatients: !!authorizationTypeID?.canViewPatients,
    canEditPatients: !!authorizationTypeID?.canEditPatients,
    canDeletePatients: !!authorizationTypeID?.canDeletePatients,
    canUpsertAutomation: !!authorizationTypeID?.canUpsertAutomation,
  };
};

// 컴포넌트에서 권한 체크
export default function PatientManagement() {
  const { canEditPatients, canDeletePatients } = usePermissions();
  
  return (
    <div>
      {canEditPatients && (
        <Button onClick={handleEdit}>수정</Button>
      )}
      {canDeletePatients && (
        <Button onClick={handleDelete} variant="danger">삭제</Button>
      )}
    </div>
  );
}
```

## 🎯 성능 최적화 가이드

**상세 규칙:** [.cursor/rules/performance.mdc](./.cursor/rules/performance.mdc)
**상세 가이드:** [CLAUDE_PATTERNS.md - 성능 최적화 패턴](./CLAUDE_PATTERNS.md#성능-최적화-패턴)

### 핵심 기법
- **코드 분할**: lazy loading + Suspense
- **메모이제이션**: useMemo, useCallback, React.memo
- **서버 상태 관리**: React Query 캐싱 전략
- **불필요한 렌더링 방지**

## 🚀 빌드 및 배포

**상세 규칙:** [.cursor/rules/build-process.mdc](./.cursor/rules/build-process.mdc)

### 빌드 명령어
```bash
# 웹/모바일 빌드
pnpm afterdoc-saas-web-build:dev/prod
pnpm afterdoc-hospital-mobile-build:dev/prod

# 스토리북 빌드
pnpm ads-storybook-build
```

### 환경 변수
- `.env`: 공통 환경변수
- `.env.development`: 개발 환경
- `.env.production`: 프로덕션 환경

# 🤖 Claude Code 특별 지침

### 🔌 MCP 서버 사용 가이드 (.cursor/rules/mcp.mdc 기반)

**기본 원칙**:
- Claude Code 작업 시 Context7과 Sequential-thinking MCP 서버 사용
- Context7: 공식 문서, 프레임워크 패턴, 라이브러리 사용법 조회
- Sequential-thinking: 복잡한 분석, 다단계 추론, 시스템 설계 지원

**사용 시나리오**:
```
✅ Context7 사용:
- React, TypeScript, Tailwind CSS 공식 문서 참조
- 프레임워크 best practices 확인
- 라이브러리 API 사용법 조회

✅ Sequential-thinking 사용:
- 복잡한 버그 디버깅
- 시스템 아키텍처 설계
- 다단계 리팩토링 계획
- 성능 최적화 분석
```

### 🔄 "sync claude" 명령어 처리 방법
**"sync claude"** 입력 시 정확한 처리 절차:

1. **TodoWrite로 작업 계획**:
   ```
   - Read all .cursor/rules/*.mdc files
   - Compare with CLAUDE.md sections
   - Update CLAUDE.md with changes
   - Provide summary (no auto-commit)
   ```

2. **전체 .cursor/rules 파일 확인**:
   - api.mdc, ui-styling.mdc, code-style.mdc, component-creation.mdc
   - state-management.mdc, performance.mdc, naming-conventions.mdc
   - testing.mdc, commit.mdc, build-process.mdc, typescript.mdc
   - toss-frontend-rules.mdc, dev-environment.mdc, folder-structure.mdc
   - ide-setup.mdc, playwright.mdc, pull-request.mdc, refactoring.mdc
   - mcp.mdc

3. **CLAUDE.md 업데이트 규칙**:
   - 기존 구조와 의료 도메인 컨텍스트 보존
   - .cursor/rules 내용을 해당 섹션에 정확히 반영
   - 중복 방지, 기존 좋은 예시 유지
   - 한국어 가이드라인 준수

4. **완료 후 동작**:
   - 변경사항 요약 제공
   - 커밋은 사용자가 직접 수행 (자동 커밋 X)

#### "sync claude" 실행 체크리스트
- [ ] TodoWrite로 동기화 작업 목록 생성
- [ ] .cursor/rules/*.mdc 파일 19개 모두 Read
- [ ] CLAUDE.md 각 섹션과 비교하여 변경사항 식별
- [ ] Edit/MultiEdit로 CLAUDE.md 업데이트 (구조 보존)
- [ ] 모든 .cursor/rules 내용 반영 확인
- [ ] 의료 도메인 컨텍스트 및 한국어 가이드라인 유지
- [ ] 변경사항 요약 제공 (커밋은 제외)

### 우선순위 규칙 (항상 준수)
1. **보안 우선**: 의료 데이터 보안을 최우선으로 고려
2. **타입 안전성**: TypeScript 타입을 명확히 정의 (interfaces > types 선호, enums 대신 maps 사용)
3. **한국어 사용**:
   - 코드 주석과 UI 텍스트는 한국어로 작성 (중요한 내용에 대해서는 한국어 주석 포함)
   - **Claude Code 출력도 항상 한국어로 작성** (설명, 응답, 에러 메시지 모두 한국어)
4. **성능 고려**: React Query를 활용한 효율적인 데이터 관리 (useSuspenseQuery 우선 고려)
5. **접근성**: a11y를 고려한 UI 컴포넌트 생성
6. **기존 컴포넌트 재사용**: 디자인 시스템에서 유사한 컴포넌트 먼저 확인
7. **절대 경로 사용**: 모든 import는 절대 경로로 사용
8. **선언적 프로그래밍**: 명령형보다 선언적 패턴 선호

### 코드 생성 시 고려사항
- 의료 도메인 특성을 반영한 변수명과 함수명 사용
- 환자 개인정보 보호를 위한 적절한 데이터 처리
- 에러 상황에 대한 적절한 사용자 피드백 제공
- 권한 기반 UI 렌더링 고려
- MSW 모킹 데이터 활용 가능성 고려

### 자주 사용하는 패턴

**상세 가이드:** [CLAUDE_PATTERNS.md - 자주 사용하는 패턴](./CLAUDE_PATTERNS.md#자주-사용하는-패턴)

- 관리자 사용자 관리 패턴
- 자동화 메시지 컨텐츠 패턴
- 권한 기반 UI 렌더링 패턴

## 📋 체크리스트

### 새 기능 개발 시
- [ ] 도메인 모델 정의 완료
- [ ] TypeScript 타입 정의 완료
- [ ] API 함수 및 훅 작성 완료
- [ ] 보안 검토 완료 (개인정보 보호, 권한 체크)
- [ ] 테스트 코드 작성 완료 (단위/통합/E2E)
- [ ] 접근성 검토 완료
- [ ] 성능 테스트 완료
- [ ] 에러 처리 및 사용자 피드백 구현
- [ ] MSW 모킹 데이터 작성 (필요 시)

### 코드 리뷰 시
- [ ] 의료 도메인 규칙 준수
- [ ] 개인정보 보호 규정 준수
- [ ] 코드 스타일 가이드 준수
- [ ] 테스트 커버리지 확인
- [ ] 성능 최적화 적용
- [ ] 보안 취약점 검토
- [ ] 접근성 요구사항 충족
- [ ] 문서 업데이트 확인
- [ ] Git 커밋 메시지 규칙 준수

### PR 머지 전
- [ ] 모든 CI 체크 통과
- [ ] 최소 1명의 승인 완료
- [ ] 충돌 해결 완료
- [ ] 관련 이슈 연결 확인
- [ ] 스크린샷 첨부 (UI 변경 시)
- [ ] 배포 영향도 검토

## ⚠️ 문서 작성 규칙

### 임시 문서는 반드시 TEMP 접두어 사용

**중요**: 사용자에게 설명 목적이거나 일회성 정보 전달을 위한 임시 문서를 작성할 때는 **반드시 파일명에 `TEMP_`를 접두어로 붙여야** 합니다.

#### 임시 문서 작성 규칙
1. **파일명 형식**: `TEMP_작업명_날짜.md`
   - 예: `TEMP_playwright_setup_20250114.md`
   - 예: `TEMP_test_결과_summary.md`

2. **작성 시점**:
   - 사용자에게 한 번 설명하고 끝날 내용
   - 특정 작업의 임시 요약/리포트
   - 일회성 가이드나 분석 결과

3. **작성하지 않아야 할 경우**:
   - 지속적으로 참조될 문서 → 기존 문서에 통합
   - 프로젝트 규칙/가이드 → `.cursor/rules/` 또는 `CLAUDE.md`에 추가
   - 테스트 설정/구성 → `e2e/README.md` 또는 관련 설정 파일에 추가

#### 예시
```bash
# ✅ 올바른 임시 문서 작성
TEMP_headless_안정화_작업요약_20250114.md
TEMP_로그인_이슈_분석.md
TEMP_테스트_결과_리포트.md

# ❌ 잘못된 문서 작성 (TEMP 없이 생성)
PLAYWRIGHT_TDD_GUIDE.md  # → 기존 문서에 통합하거나 TEMP_ 접두어 사용
SUMMARY.md               # → TEMP_SUMMARY.md로 작성
test-setup-guide.md      # → e2e/README.md에 통합
```

#### 임시 문서 관리
- TEMP로 시작하는 파일은 작업 완료 후 사용자와 확인 후 삭제
- `.gitignore`에 `TEMP_*.md` 패턴 추가 권장
- 필요한 내용은 정식 문서로 마이그레이션 후 임시 파일 삭제

## 🔧 MCP 서버 사용 규칙

**상세 규칙:** [.cursor/rules/mcp.mdc](./.cursor/rules/mcp.mdc)

### 기본 원칙
- Claude Code 작업 시 Context7과 Sequential-thinking MCP 서버 사용
- Context7: 공식 문서, 프레임워크 패턴, 라이브러리 사용법 조회
- Sequential-thinking: 복잡한 분석, 다단계 추론, 시스템 설계 지원

### 사용 시나리오
```
✅ Context7 사용:
- React, TypeScript, Tailwind CSS 공식 문서 참조
- 프레임워크 best practices 확인
- 라이브러리 API 사용법 조회

✅ Sequential-thinking 사용:
- 복잡한 버그 디버깅
- 시스템 아키텍처 설계
- 다단계 리팩토링 계획
- 성능 최적화 분석
```

---

*이 문서는 AfterDoc-React 프로젝트의 특성과 .cursor/rules의 상세한 규칙들을 반영하여 지속적으로 업데이트됩니다.* 