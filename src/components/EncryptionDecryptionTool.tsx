import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { cn } from '../lib/utils';
import AdBanner from './AdBanner';
import ThemeToggle from './ThemeToggle';
import EncryptionPanel from './EncryptionPanel';
import DecryptionPanel from './DecryptionPanel';
import SidebarAd from './SidebarAd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { APP_NAME } from '@/lib/constant';

interface EncryptionDecryptionToolProps {
  initialTheme?: 'light' | 'dark';
}

interface StoredCredentials {
  apiKey: string;
  key: string;
  iv: string;
  expiresAt: number;
}

const STORAGE_KEY = 'encryption_credentials';
const DEFAULT_EXPIRATION_HOURS = 24; // Default expiration time in hours

const EncryptionDecryptionTool: React.FC<EncryptionDecryptionToolProps> = ({ initialTheme = 'light' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const algorithms = ['AES-256-CBC'];
  const defaultAlgorithm = 'AES-256-CBC';

  // Shared credentials state
  const [apiKey, setApiKey] = useState<string>('');
  const [showEncryptionKey, setShowEncryptionKey] = useState<boolean>(false);
  const [showInitVector, setShowInitVector] = useState<boolean>(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [initVector, setInitVector] = useState<string>('');
  const [credentialsExpiry, setCredentialsExpiry] = useState<number | null>(null);
  const [showCredentialsBanner, setShowCredentialsBanner] = useState<boolean>(false);

  // Handle theme change from the toggle component
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  // Load stored credentials on component mount
  useEffect(() => {
    const loadStoredCredentials = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed: StoredCredentials = JSON.parse(storedData);

          // Check if credentials are still valid
          if (parsed.expiresAt > Date.now()) {
            setApiKey(parsed.apiKey);
            setEncryptionKey(parsed.key);
            setInitVector(parsed.iv);
            setCredentialsExpiry(parsed.expiresAt);
            setShowCredentialsBanner(true);
          } else {
            // Clear expired credentials
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading stored credentials:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadStoredCredentials();
  }, []);

  // Save credentials to localStorage
  const saveCredentials = (apiKey: string, key: string, iv: string) => {
    try {
      // Set expiration time (current time + 24 hours in milliseconds)
      const expiresAt = Date.now() + DEFAULT_EXPIRATION_HOURS * 60 * 60 * 1000;

      const credentials: StoredCredentials = {
        apiKey,
        key,
        iv,
        expiresAt
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
      setCredentialsExpiry(expiresAt);
      setShowCredentialsBanner(true);
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  // Clear stored credentials
  const clearCredentials = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey('');
      setEncryptionKey('');
      setInitVector('');
      setCredentialsExpiry(null);
      setShowCredentialsBanner(false);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  // Update credentials when they change in either panel
  const handleCredentialsUpdate = (newApiKey: string, newKey: string, newIv: string) => {
    setApiKey(newApiKey);
    setEncryptionKey(newKey);
    setInitVector(newIv);

    // Only save if at least one credential is provided
    if (newApiKey || newKey || newIv) {
      saveCredentials(newApiKey, newKey, newIv);
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = () => {
    if (!credentialsExpiry) return '';

    const timeRemaining = credentialsExpiry - Date.now();
    if (timeRemaining <= 0) return 'Expired';

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  };

  // Encryption handler function - Simple direct approach
  const handleEncrypt = (text: string, algorithm: string, config: any) => {
    try {
      if (!text) {
        return '';
      }

      // Use provided key or default
      const keyStr = config.key || 'default-encryption-key';
      const ivStr = config.iv || '';

      if (!ivStr) {
        throw new Error('Initialization Vector (IV) is required for encryption');
      }

      // Parse key and IV directly as UTF8
      const key = CryptoJS.enc.Utf8.parse(keyStr);
      const iv = CryptoJS.enc.Utf8.parse(ivStr);

      // Encrypt using AES
      const encrypted = CryptoJS.AES.encrypt(text, key, { iv }).toString();

      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to encrypt text');
    }
  };

  // Decryption handler function - Simple direct approach
  const handleDecrypt = (text: string, algorithm: string, config: any) => {
    try {
      if (!text) {
        return '';
      }

      // Use provided key or default
      const keyStr = config.key || 'default-encryption-key';
      const ivStr = config.iv || '';

      if (!ivStr) {
        throw new Error('Initialization Vector (IV) is required for decryption');
      }

      // Parse key and IV directly as UTF8
      const key = CryptoJS.enc.Utf8.parse(keyStr);
      const iv = CryptoJS.enc.Utf8.parse(ivStr);

      try {
        // Decrypt using AES
        const decrypted = CryptoJS.AES.decrypt(text, key, { iv });
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
          throw new Error('Decryption failed - invalid key or IV');
        }

        return decryptedText;
      } catch (innerError) {
        console.error('Decryption process error:', innerError);
        throw new Error('Failed to decrypt - please check your encryption key and IV');
      }
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to decrypt text');
    }
  };

  return (
    <div className={cn('min-h-screen w-full transition-colors duration-300', theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900')}>
      {/* Header Bar */}
      <div className='w-full sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'>
        <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
          <div className='flex items-center space-x-2'>
            <div className='bg-white text-blue-600 p-1 rounded-md'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h1 className='text-xl font-bold tracking-tight'>{APP_NAME}</h1>
          </div>
          <ThemeToggle initialTheme={theme} onThemeChange={handleThemeChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-5 max-w-7xl'>
        {/* Page Title */}
        <div className='text-center mb-8 mt-4 animate-fadeIn'>
          <h1 className='text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
            Secure Encryption & Decryption
          </h1>
          <p className='mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>Protect your sensitive data with military-grade encryption algorithms</p>
        </div>

        {/* Shared Credentials Section */}
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-md animate-fadeIn'>
          <h3 className='text-lg font-semibold mb-3 flex items-center text-blue-800 dark:text-blue-300'>
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
              />
            </svg>
            Encryption Keys
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
            <div className='space-y-2'>
              <label htmlFor='global-encryption-key' className='text-sm font-medium block'>
                Encryption Key
              </label>
              <div className='relative'>
                <Input
                  id='global-encryption-key'
                  type={showEncryptionKey ? 'text' : 'password'}
                  placeholder='Enter encryption key'
                  value={encryptionKey}
                  onChange={e => {
                    const newValue = e.target.value;
                    setEncryptionKey(newValue);
                    handleCredentialsUpdate(apiKey, newValue, initVector);
                  }}
                  className='w-full pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                >
                  {showEncryptionKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <label htmlFor='global-init-vector' className='text-sm font-medium block'>
                Initialization Vector (IV) <span className='text-xs text-red-500'>*required</span>
              </label>
              <div className='relative'>
                <Input
                  id='global-init-vector'
                  type={showInitVector ? 'text' : 'password'}
                  placeholder='Enter initialization vector'
                  value={initVector}
                  onChange={e => {
                    const newValue = e.target.value;
                    setInitVector(newValue);
                    handleCredentialsUpdate(apiKey, encryptionKey, newValue);
                  }}
                  className='w-full pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowInitVector(!showInitVector)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                >
                  {showInitVector ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
            </div>
          </div>

          {/* Storage info and clear button */}
          {showCredentialsBanner && (
            <div className='flex justify-between items-center mt-2 pt-2 border-t border-blue-200 dark:border-blue-800'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-blue-500 dark:text-blue-400' />
                <div>
                  <p className='text-sm font-medium text-blue-800 dark:text-blue-300'>Encryption credentials are stored</p>
                  <div className='flex items-center gap-2 mt-1'>
                    {encryptionKey && (
                      <Badge variant='outline' className='text-xs bg-blue-100 dark:bg-blue-800'>
                        Encryption Key
                      </Badge>
                    )}
                    {initVector && (
                      <Badge variant='outline' className='text-xs bg-blue-100 dark:bg-blue-800'>
                        IV
                      </Badge>
                    )}
                    <span className='text-xs text-blue-600 dark:text-blue-400'>Expires in: {formatTimeRemaining()}</span>
                  </div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' size='sm' onClick={clearCredentials} className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear stored credentials</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Two-Panel Layout with Sidebar Ad */}
        <div className='flex flex-col lg:flex-row gap-6 animate-slideUp'>
          {/* Encryption Panel */}
          <div className='flex-1'>
            <EncryptionPanel
              onEncrypt={handleEncrypt}
              algorithms={algorithms}
              defaultAlgorithm={defaultAlgorithm}
              apiKey={apiKey}
              encryptionKey={encryptionKey}
              initVector={initVector}
              onCredentialsChange={handleCredentialsUpdate}
            />
          </div>

          {/* Decryption Panel */}
          <div className='flex-1'>
            <DecryptionPanel
              onDecrypt={handleDecrypt}
              algorithms={algorithms}
              defaultAlgorithm={defaultAlgorithm}
              apiKey={apiKey}
              decryptionKey={encryptionKey}
              iv={initVector}
              onCredentialsChange={handleCredentialsUpdate}
            />
          </div>

          {/* Sidebar Ad - Hidden on mobile - Commented for now */}
          {/* <div className="hidden lg:block">
            <SidebarAd />
          </div> */}
        </div>

        {/* Mobile Sidebar Ad - Shown only on mobile - Commented for now */}
        {/* <div className="mt-6 lg:hidden">
          <div className="w-full h-[160px] overflow-hidden">
            <SidebarAd />
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <footer className='mt-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white'>
        <div className='container mx-auto px-4 text-center'>
          <div className='flex justify-center items-center mb-4'>
            <div className='bg-white text-blue-600 p-1 rounded-md mr-2'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
              </svg>
            </div>
            <h2 className='text-xl font-bold'>{APP_NAME}</h2>
          </div>
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          {/* <p className='mt-2 text-blue-200'>Created by AI</p> */}
        </div>
      </footer>
    </div>
  );
};

export default EncryptionDecryptionTool;
