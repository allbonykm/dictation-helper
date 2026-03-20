"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DICTATION_DATA } from "../data/sentences";
import styles from "./page.module.css";

import confetti from "canvas-confetti";

export default function Home() {
  const steps = Object.values(DICTATION_DATA);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [levelScores, setLevelScores] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // 오답 개수 로드
    const rawSaved = localStorage.getItem('incorrect_sentences');
    try {
      const parsed = JSON.parse(rawSaved || '{}');
      if (Array.isArray(parsed)) {
        setIncorrectCount(parsed.length);
      } else {
        const total = Object.values(parsed as Record<string, string[]>)
          .reduce((acc, curr) => acc + curr.length, 0);
        setIncorrectCount(total);
      }
    } catch {
      setIncorrectCount(0);
    }

    // 점수 데이터 로드
    const rawScores = localStorage.getItem('level_scores');
    try {
      if (rawScores) setLevelScores(JSON.parse(rawScores));
    } catch {
      setLevelScores({});
    }
  }, []);

  const triggerCelebration = () => {
    setShowCelebration(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB7B2', '#B2E2F2', '#B2F2BB', '#FFFFBA']
    });
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  const handleSetScore = (e: React.MouseEvent, levelId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentScore = levelScores[levelId] || "";
    const input = window.prompt(`${levelId}급 시험 점수를 입력해주세요 (0~100):`, String(currentScore));
    
    if (input !== null) {
      const score = parseInt(input);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        const newScores = { ...levelScores, [levelId]: score };
        setLevelScores(newScores);
        localStorage.setItem('level_scores', JSON.stringify(newScores));
        if (score >= 80) triggerCelebration(); // 80점 이상일 때만 게코가 나타나 축하해줍니다!
      } else if (input === "") {
        const newScores = { ...levelScores };
        delete newScores[levelId];
        setLevelScores(newScores);
        localStorage.setItem('level_scores', JSON.stringify(newScores));
      } else {
        alert("0에서 100 사이의 숫자를 입력해주세요.");
      }
    }
  };

  return (
    <main className={styles.main}>
      {showCelebration && (
        <div className={styles.celebrationOverlay}>
          <div className={styles.geckoContainer}>
            <div className={styles.geckoBubble}>
              축하해 율아! 정말 멋져! 🎖️
            </div>
            <Image
              src="/gecko.png"
              alt="축하하는 게코"
              width={300}
              height={300}
              className={styles.geckoImage}
            />
          </div>
        </div>
      )}

      <div className={styles.welcomeCard}>
        <div className={styles.iconWrapper}>
          <Image
            src="/heart.png"
            alt="행복한 하트"
            width={180}
            height={180}
            className={styles.heartIcon}
            priority
          />
        </div>

        <h1 className={styles.title}>
          율이를 위한<br />
          <span>받아쓰기 도우미</span>
        </h1>

        <p className={styles.description}>
          세상에서 제일 멋진 청곡초 2학년 율이,<br />
          조율이를 위한 받아쓰기 도우미
        </p>

        <div className={styles.buttonGroup}>
          <p className={styles.selectLabel}>받아쓰기 급수를 골라주세요!</p>
          <div className={styles.stepGrid}>
            {steps.map((step) => {
              const score = levelScores[step.id];
              return (
                <div key={step.id} style={{ position: 'relative' }}>
                  <Link href={`/practice?step=${step.id}`} style={{ textDecoration: 'none' }}>
                    <button className={styles.stepButton}>
                      {step.id}급
                      {score !== undefined && (
                        <div className={`${styles.scoreBadge} ${score === 100 ? styles.scoreBadge100 : ''}`}>
                          {score}
                        </div>
                      )}
                      <div 
                        className={styles.editScoreButton} 
                        onClick={(e) => handleSetScore(e, step.id)}
                        title="점수 기록하기"
                      >
                        ✏️
                      </div>
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>

          {incorrectCount > 0 && (
            <Link href="/incorrect" style={{ textDecoration: 'none', marginTop: '1.5rem', width: '100%' }}>
              <button className={styles.subButton} style={{ backgroundColor: '#FFE8E8', border: '2px solid #FFB7B2' }}>
                📖 오답 노트 ({incorrectCount}개 남음)
              </button>
            </Link>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>아빠의 사랑을 받아랏! ❤️</p>
      </footer>
    </main>
  );
}



