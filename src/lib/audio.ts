// src/lib/audio.ts

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;

/**
 * ElevenLabs API를 사용하여 주어진 텍스트를 특정 목소리로 합성하고 재생합니다.
 * 이 함수는 Voice ID를 인자로 받아 재사용 가능하도록 설계되었습니다.
 * @param textToSpeak - 음성으로 변환할 텍스트
 * @param voiceId - 사용할 ElevenLabs의 Voice ID
 */
export async function speakWithElevenLabs(textToSpeak: string, voiceId: string): Promise<void> {
  // 말할 텍스트나 Voice ID가 없는 경우 함수를 조용히 종료합니다.
  if (!textToSpeak.trim() || !voiceId) {
    if (!voiceId) console.error("ElevenLabs 호출 시 Voice ID가 제공되지 않았습니다.");
    return;
  }
  
  // 브라우저의 다른 음성 합성이 진행 중이라면 중단합니다.
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }

  console.log(`🎤 ElevenLabs로 음성 합성 요청 (Voice ID: ${voiceId}): "${textToSpeak}"`);

  // ElevenLabs TTS API 엔드포인트
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: textToSpeak,
      model_id: 'eleven_multilingual_v2', // 한국어/영어를 모두 지원하는 최신 모델
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.1, // 과장되지 않은 자연스러운 스타일
        use_speaker_boost: true
      },
    }),
  });

  // API 요청이 실패한 경우 에러를 던집니다.
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API 에러 ${response.status}: ${errorText}`);
  }

  // 응답으로 받은 오디오 데이터를 Blob으로 변환하여 오디오 객체를 생성합니다.
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  // 오디오 재생이 끝날 때까지 기다리는 Promise를 반환합니다.
  // 이를 통해 여러 오디오를 순차적으로 재생할 수 있습니다.
  return new Promise(resolve => {
    audio.onended = () => {
      console.log('▶️ 음성 재생 완료');
      resolve();
    };
    audio.onerror = (e) => {
      console.error("Audio Playback Error:", e);
      resolve(); // 에러가 발생해도 시퀀스가 멈추지 않도록 resolve를 호출합니다.
    };
    audio.play();
  });
}