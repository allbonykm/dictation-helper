"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DICTATION_DATA } from '../../data/sentences';
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
  const [isChecking, setIsChecking] = useState(false);
  const [errorsBySentence, setErrorsBySentence] = useState<Record<number, number[]>>({});

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
  const currentErrors = errorsBySentence[currentIdx] || [];

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // 1. 기존 재생 중단 및 엔진 깨우기
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    if (!currentSentence) return;

    // 2. 브라우저가 이전 명령을 완전히 정리할 수 있도록 넉넉한 시간을 줍니다.
    setTimeout(() => {
      // 간혹 엔진이 일시정지 상태로 고착되는 경우가 있어 한 번 더 resume()
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(currentSentence);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;

      utterance.onstart = () => console.log("🔊 음성 재생 시작: ", currentSentence);
      utterance.onerror = (e) => {
        console.error("❌ 음성 재생 에러:", (e as any).error);
        // 만약 또 중단되면 엔진을 완전히 초기화하고 다시 한 번 resume 시도
        if ((e as any).error === 'interrupted') {
          window.speechSynthesis.resume();
        }
      };

      // 가비지 컬렉션 방지를 위한 전역 참조
      (window as any)._lastUtterance = utterance;
      
      window.speechSynthesis.speak(utterance);
    }, 250);
  };

  const handleToggleError = (charIndex: number) => {
    const newErrors = currentErrors.includes(charIndex)
      ? currentErrors.filter(i => i !== charIndex)
      : [...currentErrors, charIndex];
    
    setErrorsBySentence({
      ...errorsBySentence,
      [currentIdx]: newErrors
    });
  };

  const saveIncorrectSentences = () => {
    // 에러가 1개라도 체크된 문장들만 필터링
    const incorrects = Object.entries(errorsBySentence)
      .filter(([_, indices]) => indices.length > 0)
      .map(([idx, _]) => sentences[parseInt(idx)]);

    if (incorrects.length === 0) return;

    // 기존 저장된 오답 가져오기
    const saved = JSON.parse(localStorage.getItem('incorrect_sentences') || '[]');
    // 중복 제거하며 합치기
    const newSet = Array.from(new Set([...saved, ...incorrects]));
    localStorage.setItem('incorrect_sentences', JSON.stringify(newSet));
  };

  const goToNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsChecking(false);
    } else {
      // 마지막 문제에서 학습 마치기 클릭 시 저장
      saveIncorrectSentences();
      router.push('/');
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setIsChecking(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.navButton} onClick={goToPrev} disabled={currentIdx === 0}>◀</button>
        <div className={styles.headerInfo}>
          <span className={styles.stepTitle}>{currentSet.title}</span>
          <span className={styles.stepCount}>문제 {currentIdx + 1} / {sentences.length}</span>
        </div>
        <button className={styles.navButton} onClick={goToNext} disabled={currentIdx === sentences.length - 1}>▶</button>
      </header>

      <div className={styles.mainAction}>
        <button className={styles.bigAudioButton} onClick={handleSpeak}>
          🔊 크게 듣기
        </button>
        <p className={styles.instruction}>율이가 공책에 다 쓰면 아래 버튼을 눌러주세요.</p>
      </div>

      {!isChecking ? (
        <button className={styles.checkStartButton} onClick={() => setIsChecking(true)}>
          채점 시작하기 ✨
        </button>
      ) : (
        <div className={styles.checkerArea}>
          <WongojiInput 
            sentence={currentSentence}
            errorIndices={currentErrors}
            onToggleError={handleToggleError}
          />
          <button className={styles.doneButton} onClick={goToNext}>
             {currentIdx === sentences.length - 1 ? "학습 마치기 🎁" : "다음 문제로 ▶"}
          </button>
        </div>
      )}
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

