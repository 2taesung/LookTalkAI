// /components/narration/constants.ts

import { Brain, MessageCircle, Users } from 'lucide-react';

export const MAX_CHARS = 2000;

export const locales = {
  en: {
    title: 'ReactionVoice',
    subtitle: 'Transform any text into Reaction Voice',
    status: {
      reactionStyle: 'Reaction Style',
      reactionVoice: 'Reaction Voice',
      actors: 'Narrator + Character',
      actorsShort: 'N + C',
      testingMode: 'Testing Mode',
      detectedText: 'Text',
    },
    demo: {
      title: 'Reaction Voice Demo',
      exampleText: '"Hello world, this is amazing! I can\'t believe how cool this technology is."',
      resultLabel: 'Result Example:',
      resultExampleNarrator: '🎤 Narrator: "Hello world, this is amazing! I can\'t believe how cool this technology is."',
      resultExampleCharacter: '🎭 Trump: "Wow, fantastic."',
      flow: '🎤 Narrator: Read original text → 🎭 Trump: React with different voice → 🎵 Mix into one MP3 → 🎉 Auto play',
      tryButton: 'Try Reaction Voice',
    },
    error: {
      title: 'Generation Error',
      generic: 'Generation failed',
      tryAgain: 'Try Again',
    },
    generator: {
      cardTitle: 'Generate Reaction Voice',
      settingsPreview: {
        speed: 'Speed',
        reactions: 'Reactions',
        mode: 'Mode',
        modeType: 'Reaction',
        narrator: 'Narrator',
        settingsButton: 'Settings',
      },
      settingsPanel: {
        title: 'Narration Settings',
      },
      character: {
        label: 'Choose Reaction Character',
      },
      textArea: {
        label: 'Your Text (Narrator will read)',
        placeholder: "Enter any text here... Try the Reaction Voice demo above!",
      },
      charCount: 'characters',
      limit: {
        dailyReached: (count: number) => `Daily limit reached (${count}/10)`,
        testingMode: 'Testing Mode - No Limits',
        limitCardTitle: 'Daily Limit Reached',
        limitCardMessage: 'You\'ve used all 10 free generations today. Come back tomorrow for more!',
      },
      generateButton: (name: string, narrator?: string) => narrator ? `Generate Reaction Voice MP3 (${narrator} Narrator + ${name})` : `Generate Reaction Voice MP3`,
      generating: 'Generating...',
    },
    result: {
      scriptTitle: (name: string) => `Enhanced Script with ${name} Reactions`,
      scriptPill: 'Reaction Voice',
      scriptFlow: (name: string, narrator?: string) => narrator ? `${narrator} narrator voice recording + ${name} reactions recording → Mixed into one MP3 → 🎉 Auto play` : `Narrator voice recording + ${name} reactions recording → Mixed into one MP3 → 🎉 Auto play`,
      playerTitle: 'Your Reaction Voice MP3 Narration',
    },
    generatingStatus: {
      title: (name: string, narrator?: string) => narrator ? `Creating Reaction Voice MP3: Recording ${narrator} narrator + ${name} voices and mixing` : `Creating Reaction Voice MP3: Recording narrator + ${name} voices and mixing`,
      steps: [
        'Enhanced script with guaranteed character reactions',
        'Narrator voice recording (selected gender)',
        'Character reactions recording (character voice)',
        'Mix both voices into one MP3',
        '🎉 Auto play after generation',
      ],
    },
    steps: {
      initializing: 'Initializing...',
      creatingScript: '🧠 Creating enhanced script with character reactions...',
      addingPersonality: '🎭 Adding guaranteed character personality...',
      generatingVoice: (name: string, narrator?: string) => narrator ? `🎭 Generating Reaction Voice: Recording ${narrator} narrator + ${name} voices and mixing to MP3...` : `🎭 Generating Reaction Voice: Recording narrator + ${name} voices and mixing to MP3...`,
      mixingAudio: '🎵 Recording narrator and character voices and mixing into one MP3...',
    },
    footer: {
      usage: (count: number) => `Free usage: ${count}/10 generations today`,
      features: 'Reaction Voice • Different voices • Audio mixing • Auto play • Completely free',
      testingMode: 'Testing Mode: Unlimited generations • Reaction Voice • Different voices • Auto play',
    },
  },
  ko: {
    title: 'ReactionVoice',
    subtitle: 'Reaction Voice로 변환',
    status: {
      reactionStyle: '반응형 스타일',
      reactionVoice: 'Reaction Voice',
      actors: '내레이터 + 캐릭터',
      actorsShort: 'N + C',
      testingMode: '테스트 모드',
      detectedText: '텍스트',
    },
    demo: {
      title: 'Reaction Voice 데모',
      exampleText: '"안녕하세요, 이것은 정말 놀라워요! 이 기술이 얼마나 멋진지 믿을 수 없어요."',
      resultLabel: '결과 예시:',
      resultExampleNarrator: '🎤 내레이터: "안녕하세요, 이것은 정말 놀라워요! 이 기술이 얼마나 멋진지 믿을 수 없어요."',
      resultExampleCharacter: '🎭 Trump: "와우 환상적이네"',
      flow: '🎤 내레이터: 원본 텍스트 읽기 → 🎭 트럼프: 서로 다른 목소리로 반응 → 🎵 하나의 MP3로 믹싱 → 🎉 자동 재생',
      tryButton: 'Reaction Voice 시도',
    },
    error: {
      title: '생성 오류',
      generic: '생성에 실패했습니다',
      tryAgain: '다시 시도',
    },
    generator: {
      cardTitle: 'Reaction Voice 생성',
      settingsPreview: {
        speed: '속도',
        reactions: '반응',
        mode: '모드',
        modeType: '반응형',
        narrator: '내레이터',
        settingsButton: '설정',
      },
      settingsPanel: {
        title: '내레이션 설정',
      },
      character: {
        label: '반응 캐릭터 선택',
      },
      textArea: {
        label: '텍스트 입력 (내레이터가 읽을 내용)',
        placeholder: '여기에 텍스트를 입력하세요... 위의 Reaction Voice 데모를 시도해보세요!',
      },
      charCount: '글자',
      limit: {
        dailyReached: (count: number) => `일일 한도 도달 (${count}/10)`,
        testingMode: '테스트 모드 - 제한 없음',
        limitCardTitle: '일일 한도 도달',
        limitCardMessage: '오늘 10회 무료 생성을 모두 사용했습니다. 내일 다시 오세요!',
      },
      generateButton: (name: string, narrator?: string) => narrator ? `Reaction Voice MP3 생성 (${narrator} 내레이터 + ${name})` : `Reaction Voice MP3 생성`,
      generating: '생성 중...',
    },
    result: {
      scriptTitle: (name: string) => `${name} 반응이 포함된 향상된 스크립트`,
      scriptPill: 'Reaction Voice',
      scriptFlow: (name: string, narrator?: string) => narrator ? `${narrator} 내레이터 음성 녹음 + ${name} 반응 녹음 → 하나의 MP3로 믹싱 → 🎉 자동 재생` : `내레이터 음성 녹음 + ${name} 반응 녹음 → 하나의 MP3로 믹싱 → 🎉 자동 재생`,
      playerTitle: 'Reaction Voice MP3 내레이션',
    },
    generatingStatus: {
      title: (name: string, narrator?: string) => narrator ? `Reaction Voice MP3 생성 중: ${narrator} 내레이터 + ${name} 음성을 녹음하여 믹싱` : `Reaction Voice MP3 생성 중: 내레이터 + ${name} 음성을 녹음하여 믹싱`,
      steps: [
        '보장된 캐릭터 반응이 포함된 향상된 스크립트',
        '내레이터 음성 녹음 (선택된 성별)',
        '캐릭터 반응 녹음 (캐릭터 음성)',
        '두 음성을 하나의 MP3로 믹싱',
        '🎉 생성 완료 후 자동 재생',
      ],
    },
    steps: {
        initializing: '초기화 중...',
        creatingScript: '🧠 캐릭터 반응과 함께 향상된 스크립트 생성 중...',
        addingPersonality: '🎭 보장된 캐릭터 개성 추가 중...',
        generatingVoice: (name: string, narrator?: string) => narrator ? `🎭 Reaction Voice 생성 중: ${narrator} 내레이터 + ${name} 음성을 녹음하여 MP3로 믹싱...` : `🎭 Reaction Voice 생성 중: 내레이터 + ${name} 음성을 녹음하여 MP3로 믹싱...`,
        mixingAudio: '🎵 내레이터와 캐릭터 음성을 녹음하고 하나의 MP3로 믹싱 중...',
    },
    footer: {
      usage: (count: number) => `무료 사용: 오늘 ${count}/10 생성`,
      features: 'Reaction Voice • 서로 다른 목소리 • 오디오 믹싱 • 자동 재생 • 완전 무료',
      testingMode: '테스트 모드: 무제한 생성 • Reaction Voice • 서로 다른 목소리 • 자동 재생',
    },
  },
  ja: {
    title: 'ReactionVoice',
    subtitle: 'リアクションボイスに変換',
    status: {
      reactionStyle: 'リアクションスタイル',
      reactionVoice: 'リアクションボイス',
      actors: 'ナレーター + キャラクター',
      actorsShort: 'N + C',
      testingMode: 'テストモード',
      detectedText: 'テキスト',
    },
    demo: {
      title: 'リアクションボイスデモ',
      exampleText: '"こんにちは、これは本当に素晴らしいです！この技術がどれほどクールか信じられません。"',
      resultLabel: '結果例:',
      resultExampleNarrator: '🎤 ナレーター: "こんにちは、これは本当に素晴らしいです！この技術がどれほどクールか信じられません。"',
      resultExampleCharacter: '🎭 Trump: "ワオ、素晴らしい"',
      flow: '🎤 ナレーター: 元のテキストを読む → 🎭 トランプ: 異なる声で反応 → 🎵 1つのMP3にミキシング → 🎉 自動再生',
      tryButton: 'リアクションボイスを試す',
    },
    error: {
      title: '生成エラー',
      generic: '生成に失敗しました',
      tryAgain: '再試行',
    },
    generator: {
      cardTitle: 'リアクションボイス生成',
      settingsPreview: {
        speed: '速度',
        reactions: 'リアクション',
        mode: 'モード',
        modeType: 'リアクション',
        narrator: 'ナレーター',
        settingsButton: '設定',
      },
      settingsPanel: {
        title: 'ナレーション設定',
      },
      character: {
        label: 'リアクションキャラクター選択',
      },
      textArea: {
        label: 'テキスト入力 (ナレーターが読む内容)',
        placeholder: 'ここにテキストを入力してください... 上のリアクションボイスデモを試してみてください！',
      },
      charCount: '文字',
      limit: {
        dailyReached: (count: number) => `日次制限に達しました (${count}/10)`,
        testingMode: 'テストモード - 制限なし',
        limitCardTitle: '日次制限に達しました',
        limitCardMessage: '今日の10回の無料生成をすべて使用しました。明日また来てください！',
      },
      generateButton: (name: string, narrator?: string) => narrator ? `リアクションボイスMP3生成 (${narrator} ナレーター + ${name})` : `リアクションボイスMP3生成`,
      generating: '生成中...',
    },
    result: {
      scriptTitle: (name: string) => `${name} リアクション付き強化スクリプト`,
      scriptPill: 'リアクションボイス',
      scriptFlow: (name: string, narrator?: string) => narrator ? `${narrator} ナレーター音声録音 + ${name} リアクション録音 → 1つのMP3にミキシング → 🎉 自動再生` : `ナレーター音声録音 + ${name} リアクション録音 → 1つのMP3にミキシング → 🎉 自動再生`,
      playerTitle: 'あなたのリアクションボイスMP3ナレーション',
    },
    generatingStatus: {
      title: (name: string, narrator?: string) => narrator ? `リアクションボイスMP3生成中: ${narrator} ナレーター + ${name} 音声を録音してミキシング` : `リアクションボイスMP3生成中: ナレーター + ${name} 音声を録音してミキシング`,
      steps: [
        '保証されたキャラクターリアクション付き強化スクリプト',
        'ナレーター音声録音 (選択された性別)',
        'キャラクターリアクション録音 (キャラクター音声)',
        '2つの音声を1つのMP3にミキシング',
        '🎉 生成完了後自動再生',
      ],
    },
    steps: {
        initializing: '初期化中...',
        creatingScript: '🧠 キャラクターリアクション付きの強化スクリプトを生成中...',
        addingPersonality: '🎭 保証されたキャラクター個性を追加中...',
        generatingVoice: (name: string, narrator?: string) => narrator ? `🎭 リアクションボイス生成中: ${narrator} ナレーター + ${name} 音声を録音してMP3にミキシング...` : `🎭 リアクションボイス生成中: ナレーター + ${name} 音声を録音してMP3にミキシング...`,
        mixingAudio: '🎵 ナレーターとキャラクター音声を録音して1つのMP3にミキシング中...',
    },
    footer: {
      usage: (count: number) => `無料使用: 今日 ${count}/10 生成`,
      features: 'リアクションボイス • 異なる声 • オーディオミキシング • 自動再生 • 完全無料',
      testingMode: 'テストモード: 無制限生成 • リアクションボイス • 異なる声 • 自動再生',
    },
  },
  zh: {
    title: 'ReactionVoice',
    subtitle: '转换为反应语音',
    status: {
      reactionStyle: '反应风格',
      reactionVoice: '反应语音',
      actors: '旁白 + 角色',
      actorsShort: 'N + C',
      testingMode: '测试模式',
      detectedText: '文本',
    },
    demo: {
      title: '反应语音演示',
      exampleText: '"你好世界，这太棒了！我不敢相信这项技术有多酷。"',
      resultLabel: '结果示例:',
      resultExampleNarrator: '🎤 旁白: "你好世界，这太棒了！我不敢相信这项技术有多酷。"',
      resultExampleCharacter: '🎭 Trump: "哇，太棒了"',
      flow: '🎤 旁白：读取原文 → 🎭 特朗普：用不同声音反应 → 🎵 混合为一个MP3 → 🎉 自动播放',
      tryButton: '尝试反应语音',
    },
    error: {
      title: '生成错误',
      generic: '生成失败',
      tryAgain: '重试',
    },
    generator: {
      cardTitle: '生成反应语音',
      settingsPreview: {
        speed: '速度',
        reactions: '反应',
        mode: '模式',
        modeType: '反应',
        narrator: '旁白',
        settingsButton: '设置',
      },
      settingsPanel: {
        title: '旁白设置',
      },
      character: {
        label: '选择反应角色',
      },
      textArea: {
        label: '文本输入 (旁白将朗读)',
        placeholder: '在此输入任何文本... 试试上面的反应语音演示！',
      },
      charCount: '字符',
      limit: {
        dailyReached: (count: number) => `已达每日限制 (${count}/10)`,
        testingMode: '测试模式 - 无限制',
        limitCardTitle: '已达每日限制',
        limitCardMessage: '您今天已用完10次免费生成。明天再来吧！',
      },
      generateButton: (name: string, narrator?: string) => narrator ? `生成反应语音MP3 (${narrator} 旁白 + ${name})` : `生成反应语音MP3`,
      generating: '生成中...',
    },
    result: {
      scriptTitle: (name: string) => `包含 ${name} 反应的增强脚本`,
      scriptPill: '反应语音',
      scriptFlow: (name: string, narrator?: string) => narrator ? `${narrator} 旁白语音录制 + ${name} 反应录制 → 混合为一个MP3 → 🎉 自动播放` : `旁白语音录制 + ${name} 反应录制 → 混合为一个MP3 → 🎉 自动播放`,
      playerTitle: '您的反应语音MP3旁白',
    },
    generatingStatus: {
      title: (name: string, narrator?: string) => narrator ? `正在创建反应语音MP3：录制 ${narrator} 旁白 + ${name} 语音并混合` : `正在创建反应语音MP3：录制旁白 + ${name} 语音并混合`,
      steps: [
        '包含保证角色反应的增强脚本',
        '旁白语音录制（选择的性别）',
        '角色反应录制（角色语音）',
        '将两个语音混合为一个MP3',
        '🎉 生成完成后自动播放',
      ],
    },
    steps: {
        initializing: '初始化中...',
        creatingScript: '🧠 正在生成带有角色反应的增强脚本...',
        addingPersonality: '🎭 正在添加保证的角色个性...',
        generatingVoice: (name: string, narrator?: string) => narrator ? `🎭 正在生成反应语音：录制 ${narrator} 旁白 + ${name} 语音并混合为MP3...` : `🎭 正在生成反应语音：录制旁白 + ${name} 语音并混合为MP3...`,
        mixingAudio: '🎵 正在录制旁白和角色语音并混合为一个MP3...',
    },
    footer: {
      usage: (count: number) => `免费使用：今天 ${count}/10 次生成`,
      features: '反应语音 • 不同声音 • 音频混合 • 自动播放 • 完全免费',
      testingMode: '测试模式：无限生成 • 反应语音 • 不同声音 • 自动播放',
    },
  },
};

export const statusBadges = [
  { id: 'style', icon: MessageCircle, textKey: 'status.reactionStyle', color: 'blue' },
  { id: 'voice', icon: Brain, textKey: 'status.reactionVoice', color: 'green' },
  { id: 'actors', icon: Users, textKey: 'status.actors', mobileTextKey: 'status.actorsShort', color: 'purple' },
];