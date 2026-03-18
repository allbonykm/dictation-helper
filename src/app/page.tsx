"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DICTATION_DATA } from "../data/sentences";
import styles from "./page.module.css";

export default function Home() {
  const steps = Object.values(DICTATION_DATA);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('incorrect_sentences') || '[]');
    setIncorrectCount(saved.length);
  }, []);

  return (
    <main className={styles.main}>
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
          세상에서 제일 소중한 우리 율이,<br />
          율이를 위한 받아쓰기 도우미
        </p>

        <div className={styles.buttonGroup}>
          <p className={styles.selectLabel}>공부할 단계를 골라주세요!</p>
          <div className={styles.stepGrid}>
            {steps.map((step) => (
              <Link key={step.id} href={`/practice?step=${step.id}`} style={{ textDecoration: 'none' }}>
                <button className={styles.stepButton}>
                  {step.id}급
                </button>
              </Link>
            ))}
          </div>

          {incorrectCount > 0 && (
            <Link href="/incorrect" style={{ textDecoration: 'none', marginTop: '1.5rem', width: '100%' }}>
              <button className={styles.subButton} style={{backgroundColor: '#FFE8E8', border: '2px solid #FFB7B2'}}>
                📖 오답 노트 ({incorrectCount}개 남음)
              </button>
            </Link>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>아빠가 사랑을 담아 만들었어 ❤️</p>
      </footer>
    </main>
  );
}



