/**
 * Claude Code 슬래시 명령어: /sync-claude
 * .cursor/rules 기준으로 CLAUDE.md, CLAUDE_PATTERNS.md, CLAUDE_TESTING.md 동기화
 * (새로운 문서 구조 지원 버전)
 */

interface CommandArgs {
	[key: string]: string | number | boolean;
}

interface CommandContext {
	// Claude Code context 타입 (필요 시 확장)
	workspaceRoot?: string;
	currentFile?: string;
}

interface CommandResult {
	type: 'message' | 'error' | 'success';
	content: string;
}

interface SyncClaudeCommand {
	name: string;
	description: string;
	execute(args: CommandArgs, context: CommandContext): Promise<CommandResult>;
}

/**
 * 문서 타입 정의
 */
type DocumentType = 'CLAUDE.md' | 'CLAUDE_PATTERNS.md' | 'CLAUDE_TESTING.md';

/**
 * 파일 매핑 인터페이스
 */
interface FileMapping {
	targets: DocumentType[];
	sections: {
		[key in DocumentType]?: string;
	};
	notes?: string;
}

// .cursor/rules 파일 목록
const CURSOR_RULES_FILES = [
	'api.mdc',
	'ui-styling.mdc',
	'code-style.mdc',
	'component-creation.mdc',
	'state-management.mdc',
	'performance.mdc',
	'naming-conventions.mdc',
	'testing.mdc',
	'commit.mdc',
	'build-process.mdc',
	'typescript.mdc',
	'toss-frontend-rules.mdc',
	'dev-environment.mdc',
	'folder-structure.mdc',
	'ide-setup.mdc',
	'mcp.mdc',
	'playwright.mdc',
	'pull-request.mdc',
	'refactoring.mdc',
] as const;

type CursorRulesFile = (typeof CURSOR_RULES_FILES)[number];

/**
 * 새로운 3단계 문서 구조 매핑
 *
 * CLAUDE.md: 핵심 가이드 + 보조 문서 참조
 * CLAUDE_PATTERNS.md: 코드 패턴 & 예시 모음
 * CLAUDE_TESTING.md: 테스트 전략 & 가이드
 */
const FILE_DOCUMENT_MAPPING: Record<CursorRulesFile, FileMapping> = {
	// API 통신
	'api.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '🌐 API 통신 규칙',
			'CLAUDE_PATTERNS.md': '🌐 API 통신 패턴',
		},
		notes: 'CLAUDE.md에 기본 원칙, CLAUDE_PATTERNS.md에 상세 예시',
	},

	// UI 스타일링
	'ui-styling.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '🎨 UI 컴포넌트 및 스타일링',
			'CLAUDE_PATTERNS.md': '🎨 UI 스타일링 패턴',
		},
		notes: 'CLAUDE.md에 기본 원칙, CLAUDE_PATTERNS.md에 Tailwind 사용법 상세',
	},

	// 코드 스타일
	'code-style.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '💻 코딩 스타일 가이드',
			'CLAUDE_PATTERNS.md': '컴포넌트 구조 패턴',
		},
		notes: '기본 원칙은 CLAUDE.md, 구체적 예시는 CLAUDE_PATTERNS.md',
	},

	// 컴포넌트 생성
	'component-creation.mdc': {
		targets: ['CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE_PATTERNS.md': '🏗️ 컴포넌트 구조 패턴',
		},
		notes: '컴포넌트 생성 프로세스와 구조 패턴',
	},

	// 상태 관리
	'state-management.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '🔄 상태 관리 패턴',
			'CLAUDE_PATTERNS.md': '🔄 상태 관리 패턴',
		},
		notes: 'CLAUDE.md에 핵심 원칙, CLAUDE_PATTERNS.md에 상세 예시',
	},

	// 성능 최적화
	'performance.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '🎯 성능 최적화 가이드',
			'CLAUDE_PATTERNS.md': '성능 최적화 패턴',
		},
		notes: 'CLAUDE.md에 핵심 기법, CLAUDE_PATTERNS.md에 메모이제이션 등 상세 예시',
	},

	// 네이밍 규칙
	'naming-conventions.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '💻 코딩 스타일 가이드',
		},
		notes: '파일 및 디렉토리 명명 규칙',
	},

	// 테스트
	'testing.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_TESTING.md'],
		sections: {
			'CLAUDE.md': '🧪 테스트 전략',
			'CLAUDE_TESTING.md': '전체',
		},
		notes: 'CLAUDE.md에 테스트 우선순위, CLAUDE_TESTING.md에 상세 패턴',
	},

	// 커밋
	'commit.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '🔧 개발 워크플로우 - Git 브랜치 전략 & 커밋 메시지 규칙',
		},
		notes: 'Git 워크플로우 섹션에 통합',
	},

	// 빌드 프로세스
	'build-process.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '🚀 빌드 및 배포',
		},
		notes: '빌드 명령어와 환경 변수 관리',
	},

	// TypeScript
	'typescript.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '💻 코딩 스타일 가이드 - 기본 원칙',
			'CLAUDE_PATTERNS.md': '컴포넌트 구조 패턴',
		},
		notes: 'interfaces 선호, enums 대신 maps 사용 등 기본 원칙',
	},

	// Toss 프론트엔드 규칙
	'toss-frontend-rules.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '🎨 UI 컴포넌트 및 스타일링 - Toss 프론트엔드 디자인 원칙',
			'CLAUDE_PATTERNS.md': '💡 Toss 프론트엔드 원칙 상세',
		},
		notes: 'CLAUDE.md에 요약, CLAUDE_PATTERNS.md에 상세 예시',
	},

	// 개발 환경
	'dev-environment.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '⚙️ 개발 환경 설정',
		},
		notes: '필요 환경과 프로젝트 초기 설정',
	},

	// 폴더 구조
	'folder-structure.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '📁 모노레포 구조',
		},
		notes: '앱별 상세 구조와 파일 그룹화 원칙',
	},

	// IDE 설정
	'ide-setup.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '⚙️ 개발 환경 설정 - VS Code 설정',
		},
		notes: 'VS Code 확장 프로그램과 워크스페이스 설정',
	},

	// MCP
	'mcp.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '🤖 Claude Code 특별 지침 - MCP 서버 사용 가이드',
		},
		notes: 'MCP 서버 사용 기본 원칙과 시나리오',
	},

	// Playwright
	'playwright.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_TESTING.md'],
		sections: {
			'CLAUDE.md': '🧪 테스트 전략 - E2E 테스트 필수 규칙',
			'CLAUDE_TESTING.md': '🎭 E2E 테스트 패턴',
		},
		notes: 'CLAUDE.md에 필수 규칙, CLAUDE_TESTING.md에 상세 패턴',
	},

	// Pull Request
	'pull-request.mdc': {
		targets: ['CLAUDE.md'],
		sections: {
			'CLAUDE.md': '🔧 개발 워크플로우 - Pull Request 작성 가이드',
		},
		notes: 'PR 템플릿과 작성 규칙',
	},

	// 리팩토링
	'refactoring.mdc': {
		targets: ['CLAUDE.md', 'CLAUDE_PATTERNS.md'],
		sections: {
			'CLAUDE.md': '♻️ 리팩토링 가이드라인',
			'CLAUDE_PATTERNS.md': '♻️ 리팩토링 패턴',
		},
		notes: 'CLAUDE.md에 기본 원칙, CLAUDE_PATTERNS.md에 구체적 패턴',
	},
};

const syncClaudeCommand: SyncClaudeCommand = {
	name: 'sync-claude',
	description:
		'.cursor/rules 기준으로 CLAUDE.md, CLAUDE_PATTERNS.md, CLAUDE_TESTING.md 동기화',

	async execute(_args: CommandArgs, _context: CommandContext): Promise<CommandResult> {
		// 상세한 동기화 지침 생성
		const detailedInstructions = generateDetailedInstructions();

		// 체크리스트 생성
		const checklist = generateChecklist();

		// 파일별 매핑 정보 생성
		const fileMappingInfo = generateFileMappingInfo();

		// 문서별 파일 목록 생성
		const documentFileList = generateDocumentFileList();

		const message = `
🔄 **SYNC CLAUDE 명령어 실행** - 새로운 3단계 문서 구조 지원

당신은 AfterDoc-React 프로젝트의 문서 동기화 전문가입니다.
.cursor/rules 디렉토리의 모든 규칙을 새로운 3단계 문서 구조에 맞게 동기화해주세요.

## 📚 새로운 문서 구조

**CLAUDE.md** (메인 가이드)
- 핵심 원칙과 기본 가이드
- 보조 문서 참조 링크 포함
- 프로젝트 개요, 도메인 지식, 개발 환경, Git 워크플로우, 빌드/배포

**CLAUDE_PATTERNS.md** (코드 패턴 & 예시 모음)
- 실제 코드 작성 시 참고할 상세 패턴
- 상태 관리, API 통신, 폼 관리, UI 스타일링, 리팩토링, 성능 최적화

**CLAUDE_TESTING.md** (테스트 전략 & 가이드)
- 테스트 코드 작성 원칙과 상세 패턴
- 단위 테스트, 커스텀 훅 테스트, E2E 테스트

${detailedInstructions}

${documentFileList}

${checklist}

${fileMappingInfo}

⚠️ **중요 사항**:
- 각 문서의 역할과 구조 보존
- 의료 도메인 컨텍스트 유지 (환자, 의료진, 병원 관리)
- 한국어 가이드라인 준수
- 보조 문서 참조 링크 추가 (CLAUDE.md → CLAUDE_PATTERNS.md, CLAUDE_TESTING.md)
- 자동 커밋 제외 (변경사항 요약만 제공)

🚀 **지금 시작하세요!**
    `.trim();

		return {
			type: 'message',
			content: message,
		};
	},
};

/**
 * 상세한 동기화 지침 생성
 */
function generateDetailedInstructions(): string {
	return `
## 📋 실행 절차 (순서대로 수행)

### 1단계: 작업 계획 수립
- TodoWrite 도구로 3개 문서별 동기화 작업 목록 생성
  1. CLAUDE.md 동기화 (${getFileCountByDocument('CLAUDE.md')}개 파일)
  2. CLAUDE_PATTERNS.md 동기화 (${getFileCountByDocument('CLAUDE_PATTERNS.md')}개 파일)
  3. CLAUDE_TESTING.md 동기화 (${getFileCountByDocument('CLAUDE_TESTING.md')}개 파일)

### 2단계: .cursor/rules 파일 전체 확인
- Read 도구로 ${CURSOR_RULES_FILES.length}개 .mdc 파일 모두 읽기
- 각 파일이 어느 문서에 매핑되는지 확인
- 변경사항 및 신규 내용 식별

### 3단계: 문서별 동기화 수행

#### 3-1. CLAUDE.md 동기화
- 기본 원칙과 핵심 가이드 업데이트
- 보조 문서 참조 링크 추가/유지
  - "**상세 가이드:** [CLAUDE_PATTERNS.md - 섹션명](./CLAUDE_PATTERNS.md#앵커)"
  - "**상세 가이드:** [CLAUDE_TESTING.md](./CLAUDE_TESTING.md)"

#### 3-2. CLAUDE_PATTERNS.md 동기화
- 코드 패턴과 상세 예시 업데이트
- 각 섹션에 실제 사용 가능한 코드 예시 포함
- CLAUDE.md와 중복 최소화 (원칙은 CLAUDE.md, 예시는 PATTERNS)

#### 3-3. CLAUDE_TESTING.md 동기화
- 테스트 전략과 상세 패턴 업데이트
- let 사용 제거 패턴, 이벤트 리스너 테스트 등 최신 패턴 반영
- E2E 테스트 필수 규칙 (getBy* 메서드 사용) 강조

### 4단계: 검증 및 완료
- 모든 .cursor/rules 내용이 적절한 문서에 반영되었는지 확인
- 보조 문서 참조 링크 정상 작동 확인
- 의료 도메인 컨텍스트 유지 확인
- 변경사항 요약 제공 (커밋 제외)
  `;
}

/**
 * 체크리스트 생성
 */
function generateChecklist(): string {
	const claudeMdFiles = getFilesByDocument('CLAUDE.md');
	const patternsFiles = getFilesByDocument('CLAUDE_PATTERNS.md');
	const testingFiles = getFilesByDocument('CLAUDE_TESTING.md');

	return `
## ✅ 실행 체크리스트

### CLAUDE.md 동기화 (${claudeMdFiles.length}개 파일)
${claudeMdFiles.map((file) => `- [ ] ${file} 반영`).join('\n')}

### CLAUDE_PATTERNS.md 동기화 (${patternsFiles.length}개 파일)
${patternsFiles.map((file) => `- [ ] ${file} 반영`).join('\n')}

### CLAUDE_TESTING.md 동기화 (${testingFiles.length}개 파일)
${testingFiles.map((file) => `- [ ] ${file} 반영`).join('\n')}

### 품질 확인 목록
- [ ] TodoWrite로 작업 진행 상황 추적
- [ ] 각 문서의 역할과 구조 보존
- [ ] 보조 문서 참조 링크 추가/유지
- [ ] 의료 도메인 용어 및 컨텍스트 유지
- [ ] 한국어 주석 및 가이드라인 준수
- [ ] 중복 내용 방지 (원칙 vs 예시 분리)
- [ ] TypeScript 인터페이스 선호 원칙 반영
- [ ] useSuspenseQuery 우선 권장 원칙 반영
- [ ] 변경사항 요약 제공 (자동 커밋 제외)
  `;
}

/**
 * 파일별 매핑 정보 생성
 */
function generateFileMappingInfo(): string {
	const mappingList = CURSOR_RULES_FILES.map((file) => {
		const mapping = FILE_DOCUMENT_MAPPING[file];
		const targetDocs = mapping.targets.join(', ');
		const sections = mapping.targets
			.map((doc) => {
				const section = mapping.sections[doc];
				return section ? `  - ${doc}: "${section}"` : '';
			})
			.filter(Boolean)
			.join('\n');

		return `**${file}**
  → 대상 문서: ${targetDocs}
${sections}
  ${mapping.notes ? `📝 ${mapping.notes}` : ''}`;
	}).join('\n\n');

	return `
## 📍 파일별 문서 매핑

${mappingList}
  `;
}

/**
 * 문서별 파일 목록 생성
 */
function generateDocumentFileList(): string {
	const claudeMdFiles = getFilesByDocument('CLAUDE.md');
	const patternsFiles = getFilesByDocument('CLAUDE_PATTERNS.md');
	const testingFiles = getFilesByDocument('CLAUDE_TESTING.md');

	return `
## 📂 문서별 참조 파일 목록

### CLAUDE.md (${claudeMdFiles.length}개 파일)
${claudeMdFiles.map((file) => `- ${file}`).join('\n')}

### CLAUDE_PATTERNS.md (${patternsFiles.length}개 파일)
${patternsFiles.map((file) => `- ${file}`).join('\n')}

### CLAUDE_TESTING.md (${testingFiles.length}개 파일)
${testingFiles.map((file) => `- ${file}`).join('\n')}
  `;
}

/**
 * 특정 문서에 매핑된 파일 목록 가져오기
 */
function getFilesByDocument(document: DocumentType): CursorRulesFile[] {
	return CURSOR_RULES_FILES.filter((file) =>
		FILE_DOCUMENT_MAPPING[file].targets.includes(document),
	);
}

/**
 * 특정 문서에 매핑된 파일 개수 가져오기
 */
function getFileCountByDocument(document: DocumentType): number {
	return getFilesByDocument(document).length;
}

// CommonJS 호환성을 위한 export
module.exports = syncClaudeCommand;

// ES Module 호환성을 위한 export (미래 대비)
export default syncClaudeCommand;
export type { CommandArgs, CommandContext, CommandResult, CursorRulesFile, SyncClaudeCommand };
