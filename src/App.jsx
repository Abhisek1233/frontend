import React, { useState, useEffect } from 'react';
import CodeEditor from './components/Editor';
import LanguageSelector from './components/LanguageSelector';
import { Moon, Sun } from 'lucide-react';
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

const defaultFileNames = {
  javascript: 'index.js',
  python: 'main.py',
  java: 'Main.java',
  cpp: 'main.cpp',
  c: 'main.c'
};

function App() {
  const [code, setCode] = useState(defaultCode.javascript);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState(defaultFileNames.javascript);
  const [isEditing, setIsEditing] = useState(false);
  const [ioHeight, setIoHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Set default code and filename when language changes
    setCode(defaultCode[selectedLanguage.value]);
    setFileName(defaultFileNames[selectedLanguage.value]);
  }, [selectedLanguage]);

  useEffect(() => {
    // Add event listeners for resizing the IO panel
    const handleMouseMove = (e) => {
      if (isResizing) {
        const appHeight = document.querySelector('.app-container').clientHeight;
        const newHeight = Math.max(100, Math.min(appHeight - 200, appHeight - e.clientY + 30));
        setIoHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Adjust IO height when window resizes to maintain proportions
      const appHeight = document.querySelector('.app-container')?.clientHeight;
      if (appHeight && ioHeight > appHeight * 0.7) {
        setIoHeight(Math.max(150, appHeight * 0.3));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ioHeight]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRun = async () => {
    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      // Submit code
      const response = await fetch('https://backend-9j9q.onrender.com/submit', {
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
          const resultResponse = await fetch(`https://backend-9j9q.onrender.com/result/${token}`);
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

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleFileNameSubmit = () => {
    setIsEditing(false);
  };

  const handleFileNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFileNameSubmit();
    }
  };

  const startResizing = () => {
    setIsResizing(true);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <header className="header">
        <div className="logo-container">
          <h1>Runzy</h1>
        </div>
        <div className="controls">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
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

      <div className="file-tab-container">
        <div className="file-tab">
          {isEditing ? (
            <input
              type="text"
              value={fileName}
              onChange={handleFileNameChange}
              onBlur={handleFileNameSubmit}
              onKeyPress={handleFileNameKeyPress}
              autoFocus
              className="file-name-input"
            />
          ) : (
            <div className="file-name" onClick={() => setIsEditing(true)}>
              {fileName}
              <span className="edit-icon">✎</span>
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="editor-container">
          <CodeEditor
            code={code}
            language={selectedLanguage.value}
            onChange={setCode}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="resize-handle" onMouseDown={startResizing}></div>

        <div className="io-container" style={{ height: `${ioHeight}px` }}>
          <div className="input-section">
            <h3>Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              className="input-textarea"
            />
          </div>

          <div className="output-section">
            <h3>Output</h3>
            <pre className={`output-display ${error ? 'error' : ''}`}>
              {error || output || 'Your code output will appear here'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
