import { NextRequest, NextResponse } from 'next/server';

// Google Cloud TTS API를 서버사이드에서 호출합니다.
// API Key는 환경변수에서만 읽어 클라이언트에 노출되지 않습니다.
export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'Google TTS API Key가 설정되지 않았습니다. .env.local 파일에 GOOGLE_TTS_API_KEY를 설정해주세요.' },
      { status: 500 }
    );
  }

  let text: string;
  let rate: number;

  try {
    const body = await request.json();
    text = body.text;
    rate = body.rate ?? 1.0;
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: '텍스트가 비어 있습니다.' }, { status: 400 });
  }

  const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestBody = {
    input: { text },
    voice: {
      languageCode: 'ko-KR',
      name: 'ko-KR-Neural2-A', // 최신 Neural2 인공지능 고품질 여성 음성
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: rate, // 0.6 (느리게) or 1.0 (보통)
      pitch: 0,           // 기본 음높이
    },
  };

  try {
    const response = await fetch(GOOGLE_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google TTS API 오류:', errorData);
      return NextResponse.json(
        { error: `Google TTS API 오류: ${errorData?.error?.message ?? response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // data.audioContent는 base64 인코딩된 MP3 오디오입니다.
    return NextResponse.json({ audioContent: data.audioContent });
  } catch (error) {
    console.error('TTS 요청 실패:', error);
    return NextResponse.json({ error: 'TTS 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
