import React from 'react';
import Select from 'react-select';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

export default function LanguageSelector({ selectedLanguage, setSelectedLanguage }) {
  return (
    <Select
      options={languageOptions}
      value={selectedLanguage}
      onChange={setSelectedLanguage}
      placeholder="Select Language"
    />
  );
}