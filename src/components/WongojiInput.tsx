"use client";

import React from 'react';
import styles from './WongojiInput.module.css';

interface WongojiInputProps {
  sentence: string;
  errorIndices: number[];
  onToggleError: (index: number) => void;
}

export default function WongojiInput({ sentence, errorIndices, onToggleError }: WongojiInputProps) {
  // 원고지 칸의 총 개수는 문장 길이에 맞춤
  const cells = sentence.split('');

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {cells.map((char, index) => {
          const isError = errorIndices.includes(index);
          const isSpace = char === ' ';
          
          return (
            <div 
              key={index} 
              className={`${styles.cell} ${isError ? styles.errorCell : ''}`}
              onClick={() => onToggleError(index)}
            >
              <span className={styles.char}>{isSpace ? ' ' : char}</span>
              {isSpace && !isError && <div className={styles.spaceMark}>∨</div>}
            </div>
          );
        })}
      </div>
      <p className={styles.guide}>율이가 공책에 틀리게 적은 글자나 띄어쓰기 칸을 눌러주세요!</p>
    </div>
  );
}

