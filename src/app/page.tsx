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
    const rawSaved = localStorage.getItem('incorrect_sentences');
    try {
      const parsed = JSON.parse(rawSaved || '{}');
      if (Array.isArray(parsed)) {
        setIncorrectCount(parsed.length);
      } else {
        // 객체인 경우 모든 벨류(배열)의 길이를 합산
        const total = Object.values(parsed as Record<string, string[]>)
          .reduce((acc, curr) => acc + curr.length, 0);
        setIncorrectCount(total);
      }
    } catch {
      setIncorrectCount(0);
    }
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
          세상에서 제일 멋진 청곡초 2학년 율이,<br />
          조율이를 위한 받아쓰기 도우미
        </p>

        <div className={styles.buttonGroup}>
          <p className={styles.selectLabel}>받아쓰기 급수를 골라주세요!</p>
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



