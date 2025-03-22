import React, { useState, useEffect } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EncryptionPanelProps {
  onEncrypt?: (text: string, algorithm: string, config: EncryptionConfig) => string;
  algorithms?: string[];
  defaultAlgorithm?: string;
  apiKey?: string;
  encryptionKey?: string;
  initVector?: string;
  onCredentialsChange?: (apiKey: string, key: string, iv: string) => void;
}

interface EncryptionConfig {
  apiKey?: string;
  key?: string;
  iv?: string;
}

const EncryptionPanel = ({
  onEncrypt = (text, algorithm, config) => `Encrypted ${text} using ${algorithm}`, // Default mock function
  algorithms = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit'],
  defaultAlgorithm = 'AES',
  apiKey: initialApiKey = '',
  encryptionKey: initialEncryptionKey = '',
  initVector: initialInitVector = '',
  onCredentialsChange
}: EncryptionPanelProps) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(defaultAlgorithm);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [encryptionKey, setEncryptionKey] = useState<string>(initialEncryptionKey);
  const [initVector, setInitVector] = useState<string>(initialInitVector);

  // Update local state when props change
  useEffect(() => {
    setApiKey(initialApiKey);
    setEncryptionKey(initialEncryptionKey);
    setInitVector(initialInitVector);
  }, [initialApiKey, initialEncryptionKey, initialInitVector]);

  const handleEncrypt = () => {
    if (!inputText.trim()) return;

    try {
      const config: EncryptionConfig = {
        apiKey: apiKey.trim() || undefined,
        key: encryptionKey.trim() || undefined,
        iv: initVector.trim() || undefined
      };

      const result = onEncrypt(inputText, selectedAlgorithm, config);
      setOutputText(result);
    } catch (error) {
      setOutputText(`Encryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCopyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard
      .writeText(outputText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <Card className='h-full bg-white dark:bg-gray-800 flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl font-bold flex items-center'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
          </svg>
          Encryption
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-grow flex flex-col gap-4 overflow-y-auto'>
        {/* Algorithm dropdown - Commented for now, using AES by default */}
        {/* <div className="space-y-2">
          <label htmlFor="algorithm" className="text-sm font-medium">
            Algorithm
          </label>
          <Select
            value={selectedAlgorithm}
            onValueChange={setSelectedAlgorithm}
          >
            <SelectTrigger id="algorithm" className="w-full">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((algo) => (
                <SelectItem key={algo} value={algo}>
                  {algo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        {/* Display the selected algorithm */}
        <div className='flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md'>
          <span className='text-sm font-medium'>Algorithm:</span>
          <span className='text-sm font-bold text-blue-700 dark:text-blue-300'>{selectedAlgorithm}</span>
          <span className='text-xs text-gray-500 dark:text-gray-400 ml-auto'>Direct AES encryption</span>
        </div>

        {/* Advanced options moved to shared section at the top */}

        <div className='space-y-2'>
          <label htmlFor='input-text' className='text-sm font-medium'>
            Text to Encrypt
          </label>
          <Textarea id='input-text' placeholder='Enter text to encrypt...' className='min-h-[120px] resize-none' value={inputText} onChange={e => setInputText(e.target.value)} />
        </div>

        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <label htmlFor='output-text' className='text-sm font-medium'>
              Encrypted Result
            </label>
            <Button variant='ghost' size='sm' className='h-8 px-2 text-xs' onClick={handleCopyToClipboard} disabled={!outputText}>
              <Copy className='h-3.5 w-3.5 mr-1' />
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <Textarea id='output-text' placeholder='Encrypted text will appear here...' className='min-h-[120px] resize-none bg-gray-50 dark:bg-gray-900' value={outputText} readOnly />
        </div>
      </CardContent>
      <CardFooter>
        <Button className='w-full' onClick={handleEncrypt} disabled={!inputText.trim()}>
          Encrypt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EncryptionPanel;
