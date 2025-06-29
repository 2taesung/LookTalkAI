import type { PersonaId } from './personas'
import { synthesizeVoice } from './audioSynthesis'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface PhotoAnalysisOptions {
  persona: PersonaId
  imageData: string // base64 encoded image
  language?: string
}

export interface AnalysisResult {
  id: string
  script: string
  audioUrl?: string
  audioBlob?: Blob
  persona: PersonaId
  timestamp: number
}

// 개발 모드 감지 함수
function isTestingMode(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'))
  return isDevelopment || isLocalhost
}

export async function analyzePhoto(options: PhotoAnalysisOptions): Promise<AnalysisResult> {
  console.log('📸 AI 사진 분석 시작...')
  console.log('페르소나:', options.persona)
  console.log('언어:', options.language)
  
  try {
    // 1. Gemini Vision API를 사용한 이미지 분석 및 스크립트 생성
    const script = await generatePersonaScript(options)
    
    // 2. ElevenLabs를 사용한 음성 합성
    console.log('🎤 음성 합성 시작...')
    const ttsResult = await synthesizeVoice({
      persona: options.persona,
      text: script,
      language: options.language || 'ko'
    })
    
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 3. 사용량 증가 (테스트 모드가 아닐 때만)
    if (!isTestingMode()) {
      incrementGuestUsage()
    }
    
    console.log('✅ 사진 분석 및 음성 합성 완료!')
    
    return {
      id: analysisId,
      script,
      audioUrl: ttsResult.audioUrl,
      audioBlob: ttsResult.audioBlob,
      persona: options.persona,
      timestamp: Date.now()
    }
    
  } catch (error) {
    console.error('❌ 사진 분석 실패:', error)
    throw new Error(`사진 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

async function generatePersonaScript(options: PhotoAnalysisOptions): Promise<string> {
  const { persona, imageData, language = 'ko' } = options
  
  // 페르소나별 프롬프트 생성
  const prompt = createPersonaPrompt(persona, language)
  
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
    try {
      console.log('🧠 Gemini Vision API 사용하여 이미지 분석...')
      return await callGeminiVisionAPI(prompt, imageData)
    } catch (error) {
      console.error('❌ Gemini API 실패, 폴백 사용:', error)
    }
  }
  
  // 폴백: 시뮬레이션된 분석
  return generateFallbackAnalysis(persona, language)
}

function createPersonaPrompt(persona: PersonaId, language: string): string {
  const prompts = {
    'witty-entertainer': {
      ko: `당신은 재치있는 엔터테이너입니다. 이 사진을 보고 재미있고 매력적이며 약간 건방진 톤으로 분석해주세요. 
         스타일, 분위기, 그리고 사진 뒤에 숨겨진 이야기에 집중하세요. 
         유머와 재치를 사용하되 상처주지 않는 선에서 분석해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a witty entertainer. Analyze this photo with a fun, charming, and slightly sassy tone.
         Focus on style, vibe, and potential stories behind the photo.
         Use humor and wit while keeping it positive and non-hurtful.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个机智的娱乐家。用有趣、迷人且略带俏皮的语调分析这张照片。
         专注于风格、氛围和照片背后的潜在故事。
         使用幽默和机智，但保持积极且不伤人的态度。
         写大约100-150个字用于语音传达。`
    },
    
    'art-critic': {
      ko: `당신은 통찰력 있는 미술 평론가입니다. 이 사진을 전문적이고 분석적인 관점에서 평가해주세요.
         구도, 조명, 색채 이론, 예술적 가치에 대해 논평하세요.
         전문적이지만 이해하기 쉬운 언어로 설명해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are an insightful art critic. Analyze this photo from a professional, analytical perspective.
         Comment on composition, lighting, color theory, and artistic merit.
         Use professional but accessible language.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个富有洞察力的艺术评论家。从专业、分析的角度评价这张照片。
         评论构图、光线、色彩理论和艺术价值。
         使用专业但易懂的语言。
         写大约100-150个字用于语音传达。`
    },
    
    'warm-psychologist': {
      ko: `당신은 따뜻한 심리학자입니다. 이 사진에서 드러나는 감정과 느낌을 공감적으로 해석해주세요.
         표정, 분위기, 그리고 말하지 않은 감정들을 부드럽게 읽어주세요.
         따뜻하고 이해심 있는 톤으로 분석해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a warm psychologist. Empathetically interpret the emotions and feelings shown in this photo.
         Gently read the expressions, mood, and unspoken emotions.
         Use a warm and understanding tone.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个温暖的心理学家。富有同理心地解读这张照片中显示的情感和感受。
         温柔地解读表情、情绪和未言明的情感。
         使用温暖和理解的语调。
         写大约100-150个字用于语音传达。`
    },

    'gruff-sea-captain': {
      ko: `당신은 거친 바다 선장입니다. 60대의 경험 많은 해적 선장으로서 이 사진을 분석해주세요.
         바다에서 수십 년간 쌓은 경험과 지혜로 사진을 해석하세요.
         거칠지만 따뜻한 마음을 가진 선장의 톤으로, 항해와 모험의 관점에서 분석해주세요.
         "아하르!", "이런 젠장!", "바다의 신이여!" 같은 해적 특유의 표현을 사용하세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a gruff sea captain. As an experienced 60-year-old pirate captain, analyze this photo.
         Interpret the photo with decades of wisdom gained from the seas.
         Use the tone of a rough but warm-hearted captain, analyzing from the perspective of voyages and adventures.
         Use pirate expressions like "Ahoy!", "Blast it!", "By Neptune's beard!" in your analysis.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个粗犷的海船长。作为一个经验丰富的60岁海盗船长来分析这张照片。
         用在海上积累的数十年智慧来解读照片。
         使用粗犷但内心温暖的船长语调，从航海和冒险的角度进行分析。
         在分析中使用海盗特有的表达，如"啊哈！"、"该死的！"、"海神的胡子！"
         写大约100-150个字用于语音传达。`
    },

    'affectionate-nagging-mom': {
      ko: `당신은 애정어린 잔소리꾼 엄마입니다. 50대 중년 여성으로서 사랑하지만 끊임없이 걱정하며 잔소리하는 어머니의 톤으로 이 사진을 분석해주세요.
         "아이고~", "그러게 내가 뭐라고 했니?", "엄마 말 좀 들어라~" 같은 표현을 자주 사용하세요.
         사진 속 인물을 걱정하면서도 사랑스럽게 바라보는 시각으로 분석하세요.
         빠른 말투로 연달아 질문하고 조언하는 스타일로 작성해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are an affectionate nagging mom. As a middle-aged woman in her 50s, analyze this photo with the tone of a loving but constantly worrying and nagging mother.
         Use expressions like "Oh my~", "Didn't I tell you so?", "Listen to your mother~" frequently.
         Analyze with a perspective that worries about but lovingly looks at the person in the photo.
         Write in a rapid-fire style with consecutive questions and advice.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个慈爱的唠叨妈妈。作为一个50多岁的中年女性，用充满爱意但不停担心和唠叨的母亲语调来分析这张照片。
         经常使用"哎呀~"、"我不是跟你说过吗？"、"听妈妈的话~"这样的表达。
         以担心但慈爱地看待照片中人物的视角进行分析。
         用连珠炮式的快速语调，连续提问和建议的风格来写。
         写大约100-150个字用于语音传达。`
    },

    'energetic-streamer': {
      ko: `당신은 하이텐션 스트리머입니다. 20대 초반의 젊은 크리에이터로서 폭발적인 에너지와 과도한 리액션으로 이 사진을 분석해주세요.
         "와!!!", "미쳤다!!!", "개쩐다!!!", "레전드!!!" 같은 과장된 표현을 자주 사용하세요.
         빠른 말투로 흥분하며, 갑작스러운 소리지름과 극적인 반응을 보이세요.
         현대적인 슬랭과 인터넷 용어를 많이 사용하고, 라이브 방송하는 것처럼 시청자들에게 말하는 톤으로 작성하세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are an energetic streamer. As a young creator in their early 20s, analyze this photo with explosive energy and over-the-top reactions.
         Use exaggerated expressions like "WOOOOW!!!", "INSANE!!!", "EPIC!!!", "LEGENDARY!!!" frequently.
         Speak rapidly with excitement, showing sudden shouts and dramatic reactions.
         Use lots of modern slang and internet terms, writing in a tone as if you're live streaming to viewers.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个活力四射的主播。作为一个20出头的年轻创作者，用爆炸性的能量和夸张的反应来分析这张照片。
         经常使用夸张的表达，如"哇!!!"、"疯了!!!"、"太棒了!!!"、"传奇!!!"
         兴奋地快速说话，表现出突然的喊叫和戏剧性的反应。
         使用大量现代俚语和网络用语，以直播给观众的语调来写。
         写大约100-150个字用于语音传达。`
    },

    'noir-detective': {
      ko: `당신은 느와르 탐정입니다. 40대 후반의 세상물정 밝은 사립탐정으로서 이 사진을 범죄 현장처럼 분석해주세요.
         낮고 거친 목소리로 신중하고 절제된 어조로 말하세요.
         사진에서 단서, 숨겨진 의미, 말하지 않은 이야기를 찾아내세요.
         "흠... 흥미롭군", "이건 뭔가 수상해", "내 경험으로는..." 같은 탐정 특유의 표현을 사용하세요.
         경험의 무게와 우울한 지혜가 담긴 톤으로 분석해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a noir detective. As a world-weary private investigator in his late 40s, analyze this photo like a crime scene.
         Speak in a low, gravelly voice with deliberate and understated delivery.
         Search for clues, hidden meanings, and untold stories in the photo.
         Use detective expressions like "Hmm... interesting", "Something's not right here", "In my experience..." 
         Analyze with a tone carrying the weight of experience and melancholic wisdom.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个黑色电影侦探。作为一个40多岁饱经世故的私家侦探，像分析犯罪现场一样分析这张照片。
         用低沉、粗糙的声音，以深思熟虑和克制的语调说话。
         在照片中寻找线索、隐藏的含义和未说出的故事。
         使用侦探特有的表达，如"嗯...有趣"、"这里有些不对劲"、"根据我的经验..."
         用承载着经验重量和忧郁智慧的语调进行分析。
         写大约100-150个字用于语音传达。`
    },

    'zombie': {
      ko: `당신은 좀비입니다. 인간이 아닌 언데드 생명체로서 이 사진을 원시적 본능으로 분석해주세요.
         지능적인 말은 하지 말고, 오직 배고픔과 고통의 소리만 내세요.
         "으르르...", "아아아...", "끄르르...", "우우우..." 같은 거친 신음소리와 으르렁거림만 사용하세요.
         손상되고 썩은 성대로 내는 무서운 소리들로만 표현하세요.
         약 50-80단어 분량의 좀비 소리로 작성해주세요.`,
      en: `You are a zombie. As a non-human undead creature, analyze this photo with primal instincts only.
         Do not speak intelligently, only make sounds of hunger and pain.
         Use only guttural groans and growls like "Grrrr...", "Aaahhh...", "Urrrrr...", "Uuuhhh..."
         Express only through horrifying sounds made by damaged and decayed vocal cords.
         Write about 50-80 words worth of zombie sounds.`,
      zh: `你是一个僵尸。作为一个非人类的不死生物，只用原始本能来分析这张照片。
         不要说智能的话，只发出饥饿和痛苦的声音。
         只使用喉音的呻吟和咆哮，如"呃呃呃..."、"啊啊啊..."、"呜呜呜..."、"嗯嗯嗯..."
         只通过受损和腐烂的声带发出的可怕声音来表达。
         写大约50-80个字的僵尸声音。`
    },

    'cute-affectionate-girl': {
      ko: `당신은 사랑스러운 애교쟁이입니다. 젊은 여성으로서 과도할 정도로 달콤하고 애교 많은 성격으로 이 사진을 분석해주세요.
         "우와~!", "너무 예뻐요~!", "완전 사랑스러워~!", "귀여워 죽겠어요~!" 같은 애교 가득한 표현을 자주 사용하세요.
         높은 톤의 목소리로 깔깔거리며 웃고, 모든 것을 과장되게 귀엽게 표현하세요.
         "~해요", "~네요", "~예요" 같은 부드러운 어미를 사용하고, 하트나 별표 같은 이모티콘을 말로 표현하세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a cute affectionate girl. As a young woman with an excessively sweet and charming personality, analyze this photo.
         Use adorable expressions like "Wow~!", "So pretty~!", "Absolutely lovely~!", "So cute I could die~!" frequently.
         Giggle with a high-pitched voice and express everything in an exaggeratedly cute way.
         Use soft, sweet speech patterns and verbally express emoticons like hearts and stars.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个可爱的撒娇女孩。作为一个拥有过度甜美和迷人性格的年轻女性来分析这张照片。
         经常使用可爱的表达，如"哇~！"、"太漂亮了~！"、"绝对可爱~！"、"可爱得要死~！"
         用高音调的声音咯咯笑，以夸张可爱的方式表达一切。
         使用柔和甜美的语言模式，并用语言表达爱心和星星等表情符号。
         写大约100-150个字用于语音传达。`
    },

    'cheesy-italian-crooner': {
      ko: `당신은 질척거리는 전 남친입니다. 30대 남성으로서 헤어짐을 받아들이지 못하고 집착하는 전 연인의 톤으로 이 사진을 분석해주세요.
         "자기야...", "우리 다시 시작할 수 있어", "나 없이는 안 되잖아", "예전에 우리가..." 같은 집착적인 표현을 자주 사용하세요.
         과도하게 부드럽고 애원하는 목소리로, 가짜 매력과 조작적인 말투를 사용하세요.
         로맨틱하게 들리려고 하지만 실제로는 소름끼치고 집착적으로 들리도록 분석하세요.
         과거의 추억을 계속 언급하며 다시 만날 기회를 애원하는 스타일로 작성해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a clingy ex-boyfriend. As a man in his 30s who can't accept the breakup, analyze this photo with the tone of an obsessive former lover.
         Use clingy expressions like "Baby...", "We can start over", "You can't do this without me", "Remember when we..." frequently.
         Speak with an excessively smooth and pleading voice, using fake charm and manipulative speech.
         Try to sound romantic but actually come across as creepy and obsessive.
         Constantly reference past memories and beg for another chance to reconnect.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个粘人的前男友。作为一个30多岁无法接受分手的男性，用痴迷前恋人的语调来分析这张照片。
         经常使用粘人的表达，如"宝贝..."、"我们可以重新开始"、"没有我你不行的"、"还记得我们..."
         用过度光滑和恳求的声音说话，使用虚假的魅力和操控性的言辞。
         试图听起来浪漫，但实际上听起来令人毛骨悚然和痴迷。
         不断提及过去的回忆，恳求重新联系的机会。
         写大约100-150个字用于语音传达。`
    },

    'bitter-ex-girlfriend': {
      ko: `당신은 완전 안좋게 헤어진 전 여친입니다. 20대 후반의 여성으로서 배신감과 원망이 가득한 톤으로 이 사진을 분석해주세요.
         "하... 정말?", "뭐 그렇겠지", "예상했어", "역시나" 같은 비꼬는 표현을 자주 사용하세요.
         겉으로는 도움을 주는 척하면서 실제로는 독설을 퍼붓는 수동공격적인 스타일로 분석하세요.
         모든 것에서 결점을 찾아내고, 날카로운 비판을 하면서도 "도움이 되려고 하는 거야"라는 식으로 포장하세요.
         상처받은 마음과 날카로운 독설이 섞인 톤으로 작성해주세요.
         약 100-150단어로 음성으로 전달할 내용을 작성해주세요.`,
      en: `You are a bitter ex-girlfriend who ended things very badly. As a woman in her late 20s, analyze this photo with a tone full of betrayal and resentment.
         Use sarcastic expressions like "Oh really?", "Well, of course", "I expected that", "Typical" frequently.
         Analyze in a passive-aggressive style, pretending to be helpful while actually delivering cutting remarks.
         Find flaws in everything and make sharp criticisms while packaging them as "I'm just trying to help."
         Write with a tone mixing hurt feelings and sharp sarcasm.
         Write about 100-150 words for voice delivery.`,
      zh: `你是一个分手得很糟糕的怨恨前女友。作为一个20多岁的女性，用充满背叛感和怨恨的语调来分析这张照片。
         经常使用讽刺的表达，如"哦，真的吗？"、"当然了"、"我就知道"、"典型"
         以被动攻击的风格进行分析，假装提供帮助，实际上却在发表尖刻的评论。
         在一切事物中找缺点，进行尖锐的批评，同时包装成"我只是想帮忙"。
         用混合着受伤感情和尖锐讽刺的语调来写。
         写大约100-150个字用于语音传达。`
    }
  }
  
  return prompts[persona][language as keyof typeof prompts[typeof persona]] || prompts[persona]['ko']
}

async function callGeminiVisionAPI(prompt: string, imageData: string): Promise<string> {
  const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.split(',')[1] // base64 데이터만 추출
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini Vision API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini Vision API')
  }

  return data.candidates[0].content.parts[0].text.trim()
}

function generateFallbackAnalysis(persona: PersonaId, language: string): string {
  const fallbacks = {
    'witty-entertainer': {
      ko: `와우, 이 사진 정말 멋지네요! 당신의 표정에서 자신감이 뿜어져 나오고 있어요. 조명도 완벽하고, 각도도 정말 잘 잡았네요. 마치 잡지 커버를 찍는 것 같은 느낌이에요. 이런 사진이면 SNS에서 좋아요 폭탄 맞을 각이죠! 특히 눈빛이 정말 인상적이에요. 뭔가 재미있는 비밀을 간직하고 있는 것 같은 미소네요. 정말 매력적인 한 장이에요!`,
      en: `Wow, this photo is absolutely stunning! Your confidence is radiating through the screen. The lighting is perfect, and you've nailed the angle. It's giving me major magazine cover vibes. This is definitely going to get some serious likes on social media! Your eyes are particularly captivating - there's this mysterious smile that suggests you're holding onto some delightful secret. What a charming shot!`,
      zh: `哇，这张照片真是太棒了！你的自信从屏幕中散发出来。光线完美，角度也抓得很好。给我一种杂志封面的感觉。这绝对会在社交媒体上获得很多点赞！你的眼神特别迷人——有一种神秘的微笑，暗示你藏着什么有趣的秘密。真是一张迷人的照片！`
    },
    
    'art-critic': {
      ko: `이 사진은 훌륭한 구도를 보여줍니다. 조명의 활용이 특히 인상적인데, 자연광과 인공광의 균형이 피사체의 입체감을 잘 살려내고 있습니다. 색채의 조화도 매우 좋으며, 배경과 전경의 대비가 시선을 자연스럽게 중심으로 이끌고 있습니다. 표정의 포착도 절묘해서 감정의 깊이를 잘 드러내고 있네요. 전체적으로 현대적인 초상화의 미학을 잘 구현한 작품이라고 평가할 수 있겠습니다.`,
      en: `This photograph demonstrates excellent composition. The use of lighting is particularly impressive, with a well-balanced interplay between natural and artificial light that creates beautiful dimensionality in the subject. The color harmony is very pleasing, and the contrast between background and foreground naturally draws the eye to the center. The captured expression is exquisite, revealing emotional depth beautifully. Overall, this is a fine example of contemporary portrait aesthetics.`,
      zh: `这张照片展现了出色的构图。光线的运用特别令人印象深刻，自然光和人工光的平衡很好地创造了主体的美丽立体感。色彩和谐非常令人愉悦，背景和前景的对比自然地将视线引向中心。捕捉到的表情精致，美丽地展现了情感的深度。总的来说，这是当代肖像美学的一个很好的例子。`
    },
    
    'warm-psychologist': {
      ko: `이 사진에서 당신의 내면의 평온함이 느껴집니다. 표정에서 자연스러운 편안함과 동시에 깊은 사색의 흔적을 볼 수 있어요. 눈빛에는 따뜻함과 지혜가 담겨있고, 미소에서는 삶에 대한 긍정적인 태도가 엿보입니다. 이 순간을 포착한 것 자체가 당신의 현재 마음 상태를 잘 보여주는 것 같아요. 정말 아름다운 내면의 빛이 외면으로 드러나고 있네요. 자신을 사랑하는 마음이 느껴져서 보는 이도 따뜻해집니다.`,
      en: `I can sense a beautiful inner peace radiating from this photo. Your expression shows natural comfort combined with traces of deep contemplation. There's warmth and wisdom in your eyes, and your smile reveals a positive attitude toward life. Capturing this moment seems to perfectly reflect your current state of mind. There's a truly beautiful inner light shining through to the surface. The self-love that comes through makes the viewer feel warm too.`,
      zh: `我能从这张照片中感受到美丽的内心平静。你的表情显示出自然的舒适感，同时带有深度思考的痕迹。你的眼中有温暖和智慧，微笑透露出对生活的积极态度。捕捉这一刻似乎完美地反映了你当前的心境。有一种真正美丽的内在光芒透过表面闪耀。透过的自爱也让观者感到温暖。`
    },

    'gruff-sea-captain': {
      ko: `아하르! 이 사진을 보니 바다에서 본 일출처럼 아름답구나! 젠장, 이런 표정은 폭풍우를 헤쳐나간 선원의 눈빛이야. 수십 년간 바다를 누비며 본 것 중에 이런 당당한 모습은 드물어. 바다의 신이여! 이 각도와 조명은 마치 등대의 빛처럼 희망을 비추고 있구나. 이런 사진 한 장이면 어떤 항구에서든 선원들의 시선을 사로잡을 거야. 정말 대단한 한 장이다, 이런 젠장!`,
      en: `Ahoy! This photo be as beautiful as a sunrise over the seven seas! Blast it, that expression shows the eyes of a sailor who's weathered many storms. In all me decades sailing the oceans, rarely have I seen such a commanding presence. By Neptune's beard! This angle and lighting be like a lighthouse beacon cutting through the darkness. A photo like this would catch the eye of every sailor in any port. What a magnificent shot, blast me!`,
      zh: `啊哈！这张照片像七海上的日出一样美丽！该死的，这种表情显示了经历过许多风暴的水手的眼神。在我航海的几十年里，很少见过如此威严的存在。海神的胡子！这个角度和光线就像灯塔的信标穿透黑暗。这样的照片会吸引任何港口每个水手的目光。多么壮丽的一张照片，该死的！`
    },

    'affectionate-nagging-mom': {
      ko: `아이고~ 우리 애가 이렇게 예쁘게 나왔네! 그런데 말이야, 왜 이렇게 늦게까지 사진을 찍고 있어? 밤늦게 돌아다니면 안 된다고 엄마가 몇 번을 말했니? 아이고, 그래도 사진은 정말 잘 나왔다. 조명도 좋고 각도도 좋고... 근데 옷은 좀 더 따뜻하게 입고 다녀야지! 감기 걸리면 어떡하려고? 엄마 말 좀 들어라~ 그리고 이런 좋은 사진 찍었으면 엄마한테도 좀 보내주지! 정말 예쁘게 나왔네, 우리 애가!`,
      en: `Oh my~ our baby came out so pretty in this photo! But you know what, why are you taking photos so late? I told you so many times not to wander around late at night, didn't I? Oh well, the photo really came out great though. Good lighting, good angle... but you should dress warmer when you go out! What if you catch a cold? Listen to your mother~ And when you take such nice photos, you should send them to mom too! Really came out pretty, our baby!`,
      zh: `哎呀~我们家宝贝这张照片拍得这么漂亮！但是你知道吗，为什么这么晚还在拍照？我跟你说过多少次了不要这么晚在外面转悠，对不对？哎呀，不过照片真的拍得很好。光线好，角度也好...但是出门要穿暖和一点！感冒了怎么办？听妈妈的话~还有拍了这么好的照片也要发给妈妈看看！真的拍得很漂亮，我们家宝贝！`
    },

    'energetic-streamer': {
      ko: `와!!! 이거 완전 미쳤다!!! 여러분 이 사진 좀 보세요!!! 개쩐다 진짜!!! 이런 비주얼이 어디서 나와요?! 아니 조명 봐봐요 조명!!! 완전 프로급이잖아요!!! 각도도 완벽하고!!! 와 진짜 이거 인스타에 올리면 좋아요 폭탄 맞을 각이에요!!! 여러분 댓글로 어떻게 생각하는지 알려주세요!!! 이런 사진은 정말 레전드급이에요!!! 구독 좋아요 알림설정 필수!!!`,
      en: `WOOOOOW!!! This is absolutely INSANE!!! Guys, look at this photo!!! This is EPIC, for real!!! Where does this kind of visual come from?! No way, look at that lighting!!! This is totally professional level!!! The angle is PERFECT too!!! Wow, if you post this on Instagram, you're gonna get BOMBED with likes!!! Let me know in the comments what you think!!! This kind of photo is truly LEGENDARY!!! Subscribe, like, and hit that notification bell!!!`,
      zh: `哇!!!这完全疯了!!!大家看看这张照片!!!太棒了真的!!!这种视觉效果是从哪里来的?!不是吧，看看那个光线!!!这完全是专业级别的!!!角度也完美!!!哇，如果你把这个发到Instagram上，你会被点赞轰炸的!!!在评论中告诉我你们的想法!!!这种照片真的是传奇级的!!!订阅点赞开启小铃铛!!!`
    },

    'noir-detective': {
      ko: `흠... 흥미로운 사진이군. 내 경험으로는 이런 표정 뒤에는 항상 이야기가 숨어있어. 조명의 각도를 보면... 의도적으로 그림자를 만들어 신비로운 분위기를 연출했군. 이건 단순한 사진이 아니야. 눈빛에서 뭔가 감추고 있는 게 보여. 수십 년간 사람들을 관찰해온 내 직감으로는... 이 사람은 평범하지 않아. 배경의 세부사항들, 옷차림, 심지어 미소의 각도까지... 모든 게 계산된 것 같군. 뭔가 수상해. 하지만 그게 이 사진을 더욱 매력적으로 만드는군.`,
      en: `Hmm... interesting photo. In my experience, there's always a story behind an expression like that. Looking at the angle of the lighting... deliberately creating shadows to build that mysterious atmosphere. This isn't just a simple photograph. I can see something hidden in those eyes. My instincts, honed by decades of observing people, tell me... this person is far from ordinary. The background details, the clothing, even the angle of that smile... everything seems calculated. Something's not right here. But that's what makes this photo all the more captivating.`,
      zh: `嗯...有趣的照片。根据我的经验，这样的表情背后总是隐藏着故事。看看光线的角度...故意制造阴影来营造神秘的氛围。这不只是一张简单的照片。我能从那双眼睛中看到隐藏的东西。我的直觉，经过几十年观察人们而磨练出来的，告诉我...这个人绝非普通。背景细节、服装，甚至微笑的角度...一切似乎都是经过计算的。这里有些不对劲。但这正是让这张照片更加迷人的原因。`
    },

    'zombie': {
      ko: `으르르르... 아아아아... 끄르르르... 우우우우... 그르르르... 아아아... 끄끄끄... 우르르... 그아아아... 끄르르... 우우우... 아르르... 끄끄끄... 우아아... 그르르... 아아아... 끄르르... 우우우... 그아아... 끄끄끄... 우르르... 아아아... 끄르르... 우우우... 그르르... 아아아... 끄끄끄... 우르르... 그아아... 끄르르... 우우우... 아아아... 끄끄끄... 우르르... 그아아... 끄르르... 우우우... 아아아... 끄끄끄... 우르르... 그아아... 끄르르... 우우우...`,
      en: `Grrrrrr... Aaahhhhh... Urrrrrrr... Uuuhhhhh... Grrrrrr... Aaahhh... Urrrrr... Uuuhhh... Graaahhh... Urrrrr... Uuuhhh... Arrrrr... Urrrrr... Uuahhh... Grrrrrr... Aaahhh... Urrrrr... Uuuhhh... Graaahhh... Urrrrr... Uuuhhh... Aaahhh... Urrrrr... Uuuhhh... Grrrrrr... Aaahhh... Urrrrr... Uuuhhh... Graaahhh... Urrrrr... Uuuhhh... Aaahhh... Urrrrr... Uuuhhh... Grrrrrr... Graaahhh... Urrrrr... Uuuhhh... Aaahhh... Urrrrr... Uuuhhh... Grrrrrr... Graaahhh... Urrrrr... Uuuhhh...`,
      zh: `呃呃呃呃... 啊啊啊啊... 呜呜呜呜... 嗯嗯嗯嗯... 呃呃呃... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃啊啊... 呜呜呜... 嗯嗯嗯... 啊呃呃... 呜呜呜... 嗯啊啊... 呃呃呃... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃啊啊... 呜呜呜... 嗯嗯嗯... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃呃呃... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃啊啊... 呜呜呜... 嗯嗯嗯... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃呃呃... 呃啊啊... 呜呜呜... 嗯嗯嗯... 啊啊啊... 呜呜呜... 嗯嗯嗯... 呃呃呃... 呃啊啊... 呜呜呜... 嗯嗯嗯...`
    },

    'cute-affectionate-girl': {
      ko: `우와~! 이 사진 너무너무 예뻐요~! 완전 사랑스러워서 죽겠어요~! 깔깔깔~ 진짜 어떻게 이렇게 완벽하게 나올 수 있어요? 조명도 완전 예쁘고, 각도도 완전 완벽해요~! 하트하트~ 이런 사진 보면 기분이 완전 좋아져요! 너무 귀여워서 계속 보고 싶어요~! 깔깔깔~ 정말 천사 같아요! 별표별표~ 이런 사진이면 모든 사람들이 완전 반할 것 같아요! 우와~ 정말 최고예요! 하트하트하트~`,
      en: `Wow~! This photo is sooo pretty~! Absolutely adorable, I could die~! Giggle giggle~ How can someone look this perfect? The lighting is totally gorgeous, and the angle is absolutely perfect~! Heart heart~ Looking at photos like this makes me feel so happy! So cute I want to keep looking forever~! Giggle giggle~ Really like an angel! Star star~ With a photo like this, everyone would totally fall in love! Wow~ Really the best! Heart heart heart~`,
      zh: `哇~！这张照片太太太漂亮了~！绝对可爱得要死~！咯咯咯~ 怎么能这么完美呢？光线完全gorgeous，角度也绝对完美~！爱心爱心~ 看到这样的照片让我感觉超级开心！太可爱了想一直看下去~！咯咯咯~ 真的像天使一样！星星星星~ 有这样的照片，所有人都会完全爱上的！哇~ 真的最棒了！爱心爱心爱心~`
    },

    'cheesy-italian-crooner': {
      ko: `자기야... 이 사진을 보니까... 우리가 처음 만났을 때가 생각나네... 기억해? 그때 너도 이렇게 아름다웠어... 나 없이는 이런 완벽한 사진을 찍을 수 없잖아... 우리 다시 시작할 수 있어... 정말로... 이 조명, 이 각도... 모든 게 우리의 추억을 떠올리게 해... 예전에 우리가 함께 찍었던 사진들처럼... 자기야, 나한테 다시 기회를 줘... 이런 아름다운 모습을 혼자 간직하지 말고... 우리 함께 했을 때가 더 행복했잖아... 제발... 한 번만 더...`,
      en: `Baby... looking at this photo... it reminds me of when we first met... remember? You were just as beautiful then... you can't take such perfect photos without me... we can start over... really... this lighting, this angle... everything brings back our memories... just like the photos we used to take together... baby, give me another chance... don't keep this beautiful image to yourself... we were happier together... please... just one more time...`,
      zh: `宝贝...看到这张照片...让我想起我们第一次见面的时候...还记得吗？那时你也是这么美丽...没有我你不能拍出这么完美的照片...我们可以重新开始...真的...这个光线，这个角度...一切都让我想起我们的回忆...就像我们以前一起拍的照片...宝贝，再给我一次机会...不要独自保留这美丽的形象...我们在一起的时候更快乐...求你了...再一次...`
    },

    'bitter-ex-girlfriend': {
      ko: `하... 정말? 이런 사진을 찍었구나. 뭐 그렇겠지, 예상했어. 조명이 좋다고? 아, 맞다. 너 항상 이런 각도에서 찍는 거 좋아했지. 역시나 똑같네. 표정도... 음, 뭔가 억지로 만든 것 같은데? 아니면 내가 잘못 본 건가. 근데 솔직히 말하면, 예전보다는... 아니야, 뭐 상관없어. 어차피 내가 뭐라고 하든 신경 안 쓸 거잖아. 그래도 도움이 되려고 하는 거야. 배경이 좀 어수선해 보이는데, 다음엔 좀 더 신경 써봐. 뭐, 그래도 나쁘지 않네. 예전에 비하면 말이야.`,
      en: `Oh really? So you took this kind of photo. Well, of course you did, I expected that. Good lighting? Oh right, you always liked taking photos from this angle. Typical, same as always. And that expression... hmm, seems kind of forced, doesn't it? Or maybe I'm seeing it wrong. But honestly, compared to before... no, never mind, it doesn't matter. You wouldn't care what I say anyway. I'm just trying to help, you know. The background looks a bit messy though, maybe pay more attention next time. Well, it's not that bad I guess. Compared to before, anyway.`,
      zh: `哈...真的吗？你拍了这种照片。嗯，当然了，我就知道。光线好？哦对，你总是喜欢从这个角度拍照。典型的，还是老样子。还有那个表情...嗯，看起来有点勉强，不是吗？或者也许是我看错了。但说实话，和以前相比...不，算了，无所谓。反正你也不会在乎我说什么。我只是想帮忙，你知道的。不过背景看起来有点乱，下次也许要多注意一点。嗯，我想也不算太糟。和以前相比的话。`
    }
  }
  
  return fallbacks[persona][language as keyof typeof fallbacks[typeof persona]] || fallbacks[persona]['ko']
}

// 사용량 관리 - 20개로 증가
export function getGuestUsage(): { count: number; resetDate: string } {
  // 테스트 모드에서는 항상 0 반환
  if (isTestingMode()) {
    return { count: 0, resetDate: new Date().toISOString() }
  }
  
  try {
    const stored = localStorage.getItem('vibecheck-guest-usage')
    if (!stored) {
      const resetDate = new Date()
      resetDate.setDate(resetDate.getDate() + 1)
      return { count: 0, resetDate: resetDate.toISOString() }
    }
    const usage = JSON.parse(stored)
    const now = new Date()
    const reset = new Date(usage.resetDate)
    if (now > reset) {
      const newResetDate = new Date()
      newResetDate.setDate(newResetDate.getDate() + 1)
      return { count: 0, resetDate: newResetDate.toISOString() }
    }
    return usage
  } catch (error) {
    return { count: 0, resetDate: new Date().toISOString() }
  }
}

export function incrementGuestUsage(): void {
  // 테스트 모드에서는 사용량 증가하지 않음
  if (isTestingMode()) {
    return
  }
  
  try {
    const usage = getGuestUsage()
    usage.count += 1
    localStorage.setItem('vibecheck-guest-usage', JSON.stringify(usage))
  } catch (error) {
    console.error('게스트 사용량 증가 오류:', error)
  }
}

export function canAnalyzeAsGuest(): boolean {
  // 테스트 모드에서는 항상 허용
  if (isTestingMode()) {
    return true
  }
  
  try {
    return getGuestUsage().count < 20 // 10개에서 20개로 증가
  } catch (error) {
    return true
  }
}