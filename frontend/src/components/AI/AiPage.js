'use client';

import styles from './AiPage.module.css';
import { useState } from 'react';

const AiPage = () => {
    
    function TextInput() {
        const [inputValue, setInputValue] = useState('');
      
        const handleInputChange = (event) => {
          setInputValue(event.target.value);
        };
      
        return (
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="How can I help?"
              className={styles.inputText}
            />
          </div>
        );
      }

    return (
        <>
            <h1>Timewise AI</h1>
            <TextInput></TextInput>
        </>
    );
}

export default AiPage;