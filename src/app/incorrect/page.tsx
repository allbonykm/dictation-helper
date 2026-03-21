/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import WongojiInput from '../../components/WongojiInput';
import styles from '../practice/practice.module.css';

export default function IncorrectNotePage() {
  const router = useRouter();
  const [groupedSentences, setGroupedSentences] = useState<Record<string, string[]>>({});
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [errorIndices, setErrorIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [speakSpeed, setSpeakSpeed] = useState<number>(0.8);

  useEffect(() => {
    const rawSaved = localStorage.getItem('incorrect_sentences');
    try {
      const parsed = JSON.parse(rawSaved || '{}');
      if (Array.isArray(parsed)) {
        setGroupedSentences({ "미분류": parsed });
      } else {
        setGroupedSentences(parsed);
      }
    } catch {
      setGroupedSentences({});
    }
    setIsLoading(false);
  }, []);

  const totalCount = Object.values(groupedSentences).flat().length;

  // 오답 정복 시 자동으로 별빛 폭죽 터뜨리기!
  useEffect(() => {
    if (!isLoading && totalCount === 0) {
      const colors = ['#FFD700', '#FFFACD', '#FFFFFF', '#FFEC8B']; // 황금색, 레몬색, 화이트

      // 1. 3초 동안 별들이 화려하게 쏟아짐 🌠
      const end = Date.now() + 3000;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          shapes: ['star']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          shapes: ['star']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // 2. 무작위 별빛 세례
      const interval = setInterval(() => {
        confetti({
          particleCount: 15,
          angle: Math.random() * 360,
          spread: 100,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: colors,
          shapes: ['star']
        });
      }, 200);

      setTimeout(() => clearInterval(interval), 3000);
    }
  }, [isLoading, totalCount]);

  if (isLoading) return <div className={styles.container}>불러오는 중...</div>;

  if (totalCount === 0) {
    return (
      <div className={styles.container}>
        {/* 게코 칭찬 도장 쾅! */}
        <div className={styles.stampContainer}>
          <img src="/gecko_stamp.png" alt="게코 도장" className={styles.geckoIcon} />
          <p className={styles.stampText}>참 잘했어요!</p>
        </div>

        <div style={{marginTop: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>🎉 율이야, 대단해!</h2>
          <p style={{fontSize: '1.2rem', color: '#666'}}>틀린 문제가 하나도 없어!</p>
          <button className={styles.checkStartButton} onClick={() => router.push('/')} style={{marginTop: '3rem'}}>
            홈으로 가기 🏠
          </button>
        </div>
      </div>
    );
  }

  // 급수 선택 화면
  if (!selectedLevel) {
    return (
      <main className={styles.container}>
        <Link href="/" className="homeLink" title="홈으로">🏠</Link>
        <header className={styles.header}>
            <span className={styles.stepTitle}>📖 오답 노트 보관함</span>
        </header>
        <p className={styles.instruction}>다시 공부할 급수를 골라주세요.</p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px', marginTop: '2rem'}}>
          {Object.entries(groupedSentences).map(([level, items]) => (
            items.length > 0 && (
              <button 
                key={level} 
                className={styles.nextButton} 
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentIdx(0);
                }}
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
              >
                <span>{level} 오답</span>
                <span style={{fontSize: '0.9rem', opacity: 0.7}}>{items.length}개 남음</span>
              </button>
            )
          ))}
        </div>

        <button onClick={() => router.push('/')} style={{marginTop: '3rem', color: '#888', background: 'none', border: 'none', textDecoration: 'underline'}}>
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  const sentences = groupedSentences[selectedLevel] || [];
  const currentSentence = sentences[currentIdx];

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    if (!currentSentence) return;

    setTimeout(() => {
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(currentSentence);
      utterance.lang = 'ko-KR';
      utterance.rate = speakSpeed;
      utterance.pitch = 1.0;
      (window as any)._lastUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }, 250);
  };

  const handleToggleError = (index: number) => {
    setErrorIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleNextProblem = () => {
    const newGrouped = { ...groupedSentences };
    const levelSentences = [...newGrouped[selectedLevel]];
    
    if (errorIndices.length === 0) {
      // 해결됨: 삭제
      levelSentences.splice(currentIdx, 1);
      newGrouped[selectedLevel] = levelSentences;
      
      // 만약 해당 급수의 오답이 다 없어졌다면 키 삭제
      if (levelSentences.length === 0) {
        delete newGrouped[selectedLevel];
        setSelectedLevel(null);
      }
      
      localStorage.setItem('incorrect_sentences', JSON.stringify(newGrouped));
      setGroupedSentences(newGrouped);

      if (currentIdx >= levelSentences.length && currentIdx > 0) {
        setCurrentIdx(currentIdx - 1);
      }
    } else {
      // 미해결: 다음 문제로
      setCurrentIdx((currentIdx + 1) % levelSentences.length);
    }
    
    setIsChecking(false);
    setErrorIndices([]);
  };

  return (
    <main className={styles.container}>
      <Link href="/" className="homeLink" title="홈으로">🏠</Link>
      <header className={styles.header}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <span className={styles.stepTitle}>{selectedLevel} 오답 연습</span>
          <span className={styles.stepCount}>{currentIdx + 1} / {sentences.length}</span>
        </div>
      </header>

      <div className={styles.mainAction}>
        <button className={styles.bigAudioButton} onClick={handleSpeak}>
          🔊 소리 듣기
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

      <button onClick={() => setSelectedLevel(null)} style={{marginTop: '2rem', color: '#888', background: 'none', border: 'none', textDecoration: 'underline'}}>
        다른 급수 선택하러 가기
      </button>
    </main>
  );
}
