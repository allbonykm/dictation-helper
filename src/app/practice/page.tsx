"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DICTATION_DATA } from '../../data/sentences';
import WongojiInput from '../../components/WongojiInput';
import styles from './practice.module.css';

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL에서 몇 회차인지 가져옴 (기본값 1회차)
  const stepParam = searchParams.get('step');
  const stepId = stepParam ? parseInt(stepParam) : 1;
  const currentSet = DICTATION_DATA[stepId];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [errorsBySentence, setErrorsBySentence] = useState<Record<number, number[]>>({});

  // 회차가 존재하지 않을 경우 처리
  if (!currentSet) {
    return (
      <div className={styles.container}>
        <h2>앗! {stepId}회차 정보를 찾을 수 없어요.</h2>
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // 1. 혹시 멈춰있을지 모를 엔진을 깨웁니다.
      window.speechSynthesis.resume();
      // 2. 진행 중인 모든 음성 취소
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentSentence);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;

      // 3. 가비지 컬렉션 방지: 전역 객체에 참조 유지
      (window as any)._utterance = utterance;
      
      // 4. 브라우저가 음성을 끝까지 내보내도록 보장
      window.speechSynthesis.speak(utterance);
    }
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

