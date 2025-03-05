import React, { useState, useEffect } from 'react';
import CodeEditor from './components/Editor';
import LanguageSelector from './components/LanguageSelector';
import './App.css';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

const defaultCode = {
  javascript: "console.log('Hello, World!');",
  python: "print('Hello, World!')",
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
  }`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`
};

function App() {
  const [code, setCode] = useState(defaultCode.javascript);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');
  
    try {
      // Submit code
      const response = await fetch('https://your-backend-url/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: selectedLanguage.value, input }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const { token } = await response.json();
  
      // Poll for result
      const pollResult = async () => {
        try {
          const resultResponse = await fetch(`https://your-backend-url/result/${token}`);
          if (!resultResponse.ok) {
            throw new Error(`HTTP error! Status: ${resultResponse.status}`);
          }
  
          const result = await resultResponse.json();
  
          if (result.status === 'processing') {
            setTimeout(pollResult, 2000); // Poll again after 2 seconds
          } else {
            setOutput(result.output);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
          setError('Failed to fetch result');
          setIsLoading(false);
        }
      };
  
      pollResult();
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to run code');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <header className="header">
        <h1>Java8s Code Runner</h1>
        <div className="controls">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
          />
          <button 
            onClick={handleRun} 
            disabled={isLoading}
            className={`run-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Running...
              </>
            ) : 'Run Code'}
          </button>
        </div>
      </header>

      <div className="editor-container">
        <CodeEditor
          code={code}
          language={selectedLanguage.value}
          onChange={setCode}
        />
      </div>

      <div className="io-container">
        <div className="input-section">
          <h3>Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input here..."
          />
        </div>

        <div className="output-section">
          <h3>Output</h3>
          <pre className={error ? 'error' : ''}>
            {error || output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;