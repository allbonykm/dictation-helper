"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DICTATION_DATA } from '../../data/sentences';
import confetti from 'canvas-confetti';
import WongojiInput from '../../components/WongojiInput';
import styles from './practice.module.css';

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL에서 몇 급인지 가져옴 (기본값 1급)
  const stepParam = searchParams.get('step');
  const stepId = stepParam ? parseInt(stepParam) : 1;
  const currentSet = DICTATION_DATA[stepId];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'practice' | 'review'>('practice');
  const [errorsBySentence, setErrorsBySentence] = useState<Record<number, number[]>>({});
  const [speakSpeed, setSpeakSpeed] = useState<number>(0.8); // 기본 속도 0.8

  // 해당 급의 정보가 존재하지 않을 경우 처리
  if (!currentSet) {
    return (
      <div className={styles.container}>
        <h2>앗! {stepId}급 정보를 찾을 수 없어요.</h2>
        <button className={styles.checkStartButton} onClick={() => router.push('/')}>
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  const sentences = currentSet.sentences;
  const currentSentence = sentences[currentIdx];

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    if (!text) return;

    setTimeout(() => {
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = speakSpeed; // 선택된 속도 적용
      utterance.pitch = 1.0;
      (window as any)._lastUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleToggleError = (sentenceIdx: number, charIndex: number) => {
    const currentErrors = errorsBySentence[sentenceIdx] || [];
    const newErrors = currentErrors.includes(charIndex)
      ? currentErrors.filter(i => i !== charIndex)
      : [...currentErrors, charIndex];
    
    setErrorsBySentence({
      ...errorsBySentence,
      [sentenceIdx]: newErrors
    });
  };

  const saveAllIncorrectSentences = () => {
    // 에러가 1개라도 체크된 문장들만 추출
    const incorrects = Object.entries(errorsBySentence)
      .filter(([_, indices]) => indices.length > 0)
      .map(([idx, _]) => sentences[parseInt(idx)]);

    // 기존 저장 데이터 가져오기 (객체 형태: { "1급": [...], "2급": [...] })
    const rawSaved = localStorage.getItem('incorrect_sentences');
    let savedData: Record<string, string[]> = {};
    
    try {
      const parsed = JSON.parse(rawSaved || '{}');
      // 기존 데이터가 배열인 경우(구버전) 처리
      if (Array.isArray(parsed)) {
          savedData = { "미분류": parsed };
      } else {
          savedData = parsed;
      }
    } catch {
      savedData = {};
    }

    const levelKey = `${stepId}급`;
    const levelSentences = savedData[levelKey] || [];
    
    // 중복 제거하며 해당 급수에 합치기
    const updatedLevelSentences = Array.from(new Set([...levelSentences, ...incorrects]));
    
    savedData[levelKey] = updatedLevelSentences;
    localStorage.setItem('incorrect_sentences', JSON.stringify(savedData));
    
    router.push('/');
  };

  const handleFinishPractice = () => {
    // 율이를 위한 예쁜 색상 조합
    const colors = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];

    // 1. 왼쪽 아래에서 발사
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      colors: colors
    });

    // 2. 오른쪽 아래에서 발사
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      colors: colors
    });

    // 3. 중앙에서 화려하게 마무리 (약간의 딜레이)
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: colors
      });
    }, 300);

    // 1.5초 후 채점 모드로 전환 (폭죽을 즐길 시간!)
    setTimeout(() => {
      setViewMode('review');
    }, 1800);
  };

  const goToNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinishPractice();
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  if (viewMode === 'review') {
    return (
      <main className={styles.container}>
        <Link href="/" className="homeLink" title="홈으로">🏠</Link>
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.stepTitle}>{currentSet.title} - 채점하기 ✨</span>
            <p className={styles.instruction}>아빠가 틀린 글자를 톡톡 눌러주세요.</p>
          </div>
        </header>

        <div className={styles.reviewList}>
          {sentences.map((sentence, idx) => (
            <div key={idx} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.sentenceNum}>{idx + 1}번</span>
                <button className={styles.smallAudioButton} onClick={() => handleSpeak(sentence)}>🔈</button>
              </div>
              <WongojiInput 
                sentence={sentence}
                errorIndices={errorsBySentence[idx] || []}
                onToggleError={(charIdx) => handleToggleError(idx, charIdx)}
              />
            </div>
          ))}
        </div>

        <div className={styles.footerActions}>
          <button className={styles.backToPracticeButton} onClick={() => setViewMode('practice')}>
            다시 써보기
          </button>
          <button className={styles.doneButton} onClick={saveAllIncorrectSentences}>
            채점 완료 및 오답 저장 🎁
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <Link href="/" className="homeLink" title="홈으로">🏠</Link>
      <header className={styles.header}>
        <button className={styles.navButton} onClick={goToPrev} disabled={currentIdx === 0}>◀</button>
        <div className={styles.headerInfo}>
          <span className={styles.stepTitle}>{currentSet.title}</span>
          <span className={styles.stepCount}>문제 {currentIdx + 1} / {sentences.length}</span>
        </div>
        <button className={styles.navButton} onClick={goToNext}>▶</button>
      </header>

      <div className={styles.mainAction}>
        <button className={styles.bigAudioButton} onClick={() => handleSpeak(currentSentence)}>
          🔊 크게 듣기
        </button>
        
        <div className={styles.speedControls}>
          <button 
            className={`${styles.speedButton} ${speakSpeed === 1.0 ? styles.activeSpeed : ''}`}
            onClick={() => setSpeakSpeed(1.0)}
          >보통</button>
          <button 
            className={`${styles.speedButton} ${speakSpeed === 0.6 ? styles.activeSpeed : ''}`}
            onClick={() => setSpeakSpeed(0.6)}
          >🐢 느리게</button>
        </div>

        <p className={styles.instruction}>율이가 공책에 다 쓰면 다음 버튼을 눌러주세요.</p>
      </div>

      <div className={styles.practiceFooter}>
        {currentIdx === sentences.length - 1 ? (
          <button className={styles.checkStartButton} onClick={handleFinishPractice}>
            채점 시작하기 ✍️
          </button>
        ) : (
          <button className={styles.nextButton} onClick={goToNext}>
            다 쓰면 다음 문제로! ⮕
          </button>
        )}
      </div>
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <PracticeContent />
    </Suspense>
  );
}

