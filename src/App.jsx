import React, { useState, useEffect, useRef } from 'react';
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
  const ws = useRef(null);

  useEffect(() => {
    // Set default code when language changes
    setCode(defaultCode[selectedLanguage.value]);
  }, [selectedLanguage]);

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://https://backend-9j9q.onrender.com');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setError('');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
      } else {
        setOutput(prev => prev + (data.output || ''));
      }
      setIsLoading(false);
    };

    ws.current.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      if (!error) setError('Connection closed unexpectedly');
      setIsLoading(false);
    };

    return () => ws.current?.close();
  }, []);

  const handleRun = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not established');
      return;
    }

    setError('');
    setOutput('');
    setIsLoading(true);
    
    ws.current.send(JSON.stringify({
      code,
      language: selectedLanguage.value,
      input
    }));
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
