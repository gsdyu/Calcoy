'use client';

import styles from './AiPage.module.css';
import { useState } from 'react';

function TextInput() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <div className={styles.inputContainer}>
      <textarea
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Ask Timewise AI"
        className={styles.inputText}
        rows={1}
      />
    </div>
  );
}

const AiPage = () => {
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>Timewise AI</h1>
        <h2 className={styles.subheader}>How can I help you?</h2>
      </div>

      <TextInput />
    </div>
  );
}

export default AiPage;
