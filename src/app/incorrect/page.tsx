"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WongojiInput from '../../components/WongojiInput';
import styles from '../practice/practice.module.css';

export default function IncorrectNotePage() {
  const router = useRouter();
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [errorIndices, setErrorIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('incorrect_sentences') || '[]');
    setSentences(saved);
    setIsLoading(false);
  }, []);

  if (isLoading) return <div className={styles.container}>불러오는 중...</div>;

  if (sentences.length === 0) {
    return (
      <div className={styles.container}>
        <h2 style={{fontSize: '2rem', marginBottom: '2rem'}}>🎉 율이야, 대단해!</h2>
        <p style={{fontSize: '1.2rem', color: '#666'}}>틀린 문제가 하나도 없어!</p>
        <button className={styles.checkStartButton} onClick={() => router.push('/')} style={{marginTop: '3rem'}}>
          홈으로 가기 🏠
        </button>
      </div>
    );
  }

  const currentSentence = sentences[currentIdx];

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentSentence);
      
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;

      // 가비지 컬렉션 방지
      (window as any)._utterance = utterance;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleError = (index: number) => {
    setErrorIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleNextProblem = () => {
    // 채점 결과 오답이 없으면(문제를 맞혔으면) 목록에서 삭제
    let newSentences = [...sentences];
    if (errorIndices.length === 0) {
      newSentences.splice(currentIdx, 1);
      localStorage.setItem('incorrect_sentences', JSON.stringify(newSentences));
      setSentences(newSentences);
      // 인덱스 조정: 마지막 문제를 삭제한 경우 하나 앞으로
      if (currentIdx >= newSentences.length && currentIdx > 0) {
        setCurrentIdx(currentIdx - 1);
      }
    } else {
      // 여전히 오답이 있으면 그대로 두고 다음 오답으로
      setCurrentIdx((currentIdx + 1) % sentences.length);
    }
    
    setIsChecking(false);
    setErrorIndices([]);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.stepTitle}>📝 오답 노트</span>
        <span className={styles.stepCount}>{currentIdx + 1} / {sentences.length}</span>
      </header>

      <div className={styles.mainAction}>
        <button className={styles.bigAudioButton} onClick={handleSpeak}>
          🔊 소리 듣기
        </button>
        <p className={styles.instruction}>오답을 다시 연습해봐요.</p>
      </div>

      {!isChecking ? (
        <button className={styles.checkStartButton} onClick={() => setIsChecking(true)}>
          채점 시작하기 ✨
        </button>
      ) : (
        <div className={styles.checkerArea}>
          <WongojiInput 
            sentence={currentSentence}
            errorIndices={errorIndices}
            onToggleError={handleToggleError}
          />
          <button className={styles.doneButton} onClick={handleNextProblem}>
            {errorIndices.length === 0 ? "해결! 다음 문제로 ▶" : "여전히 어려워요 (목록유지) ▶"}
          </button>
        </div>
      )}

      <button onClick={() => router.push('/')} style={{marginTop: '2rem', color: '#888', background: 'none', border: 'none', textDecoration: 'underline'}}>
        학습 중단하고 나가기
      </button>
    </main>
  );
}
