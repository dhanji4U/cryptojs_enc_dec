import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Eye, EyeOff, Code } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type OutputFormat = "text" | "json";

const DecryptionUtility = () => {
  const [encryptedText, setEncryptedText] = useState<string>("");
  const [decryptedText, setDecryptedText] = useState<string>("");
  const [formattedOutput, setFormattedOutput] = useState<string>("");
  const [key, setKey] = useState<string>("mySecretKey123");
  const [iv, setIv] = useState<string>("1234567890123456");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showIv, setShowIv] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");

  const formatOutput = (text: string, format: OutputFormat) => {
    try {
      if (format === "json") {
        // Try to parse as JSON and format it
        const jsonObj = JSON.parse(text);
        return JSON.stringify(jsonObj, null, 2);
      }
      return text;
    } catch (e) {
      console.error("Error formatting output:", e);
      return text; // Return original if formatting fails
    }
  };

  // Update formatted output when output format changes
  useEffect(() => {
    if (decryptedText) {
      setFormattedOutput(formatOutput(decryptedText, outputFormat));
    }
  }, [outputFormat, decryptedText]);

  const handleDecrypt = () => {
    try {
      setError("");

      if (!key || !iv) {
        setError(
          "Both Encryption Key and Initialization Vector (IV) are required",
        );
        return;
      }

      if (!encryptedText.trim()) {
        setError("Please enter encrypted text");
        return;
      }

      // Parse key and IV directly as UTF8
      const keyParsed = CryptoJS.enc.Utf8.parse(key);
      const ivParsed = CryptoJS.enc.Utf8.parse(iv);

      // Handle the encrypted text properly - don't strip quotes as they might be part of the encrypted string
      let textToDecrypt = encryptedText.trim();

      try {
        // Decrypt using AES
        const decrypted = CryptoJS.AES.decrypt(textToDecrypt, keyParsed, {
          iv: ivParsed,
        });
        const result = decrypted.toString(CryptoJS.enc.Utf8);

        if (!result) {
          throw new Error("Decryption failed - invalid key or IV");
        }

        setDecryptedText(result);
        setFormattedOutput(formatOutput(result, outputFormat));
      } catch (decryptError) {
        console.error("Specific decryption error:", decryptError);

        // Try again with quotes removed if the first attempt failed
        if (textToDecrypt.startsWith('"') && textToDecrypt.endsWith('"')) {
          try {
            const strippedText = textToDecrypt.substring(
              1,
              textToDecrypt.length - 1,
            );
            const decrypted = CryptoJS.AES.decrypt(strippedText, keyParsed, {
              iv: ivParsed,
            });
            const result = decrypted.toString(CryptoJS.enc.Utf8);

            if (!result) {
              throw new Error("Decryption failed - invalid key or IV");
            }

            setDecryptedText(result);
            setFormattedOutput(formatOutput(result, outputFormat));
            return;
          } catch (innerError) {
            console.error("Second attempt failed:", innerError);
          }
        }

        throw new Error(
          "Decryption failed - please check your encryption key, IV, and encrypted text format",
        );
      }
    } catch (error) {
      console.error("Decryption error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to decrypt text",
      );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          Decrypt Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="encrypted-text" className="text-sm font-medium block">
            Encrypted Text
          </label>
          <Textarea
            id="encrypted-text"
            placeholder="Enter encrypted text"
            className="min-h-[100px] resize-none"
            value={encryptedText}
            onChange={(e) => setEncryptedText(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="encryption-key"
              className="text-sm font-medium block"
            >
              Encryption Key
            </label>
            <div className="relative">
              <Input
                id="encryption-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter encryption key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="init-vector" className="text-sm font-medium block">
              Initialization Vector (IV)
            </label>
            <div className="relative">
              <Input
                id="init-vector"
                type={showIv ? "text" : "password"}
                placeholder="Enter initialization vector"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowIv(!showIv)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showIv ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="decrypted-result"
              className="text-sm font-medium block"
            >
              Decrypted Result
            </label>
            <Select
              value={outputFormat}
              onValueChange={(value: OutputFormat) => setOutputFormat(value)}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            id="decrypted-result"
            placeholder="Decrypted text will appear here..."
            className="min-h-[150px] resize-none bg-gray-50 dark:bg-gray-900 font-mono text-sm whitespace-pre-wrap w-full overflow-auto"
            value={formattedOutput}
            readOnly
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleDecrypt}>
          Decrypt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DecryptionUtility;
