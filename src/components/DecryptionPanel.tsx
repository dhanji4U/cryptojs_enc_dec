import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Code, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DecryptionPanelProps {
  onDecrypt?: (
    text: string,
    algorithm: string,
    config: DecryptionConfig
  ) => string;
  algorithms?: string[];
  defaultAlgorithm?: string;
  apiKey?: string;
  decryptionKey?: string;
  iv?: string;
  onCredentialsChange?: (apiKey: string, key: string, iv: string) => void;
}

interface DecryptionConfig {
  apiKey?: string;
  key?: string;
  iv?: string;
  outputFormat?: "text" | "json" | "xml" | "html" | "js";
}

const DecryptionPanel: React.FC<DecryptionPanelProps> = ({
  onDecrypt = (text) => `Decrypted: ${text}`,
  algorithms = ["AES", "DES", "TripleDES", "RC4", "Rabbit"],
  defaultAlgorithm = "AES",
  apiKey: initialApiKey = "",
  decryptionKey: initialKey = "",
  iv: initialIv = "",
  onCredentialsChange,
}) => {
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [algorithm, setAlgorithm] = useState(defaultAlgorithm);
  const [key, setKey] = useState(initialKey);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [iv, setIv] = useState(initialIv);
  const [outputFormat, setOutputFormat] = useState<
    "text" | "json" | "xml" | "html" | "js"
  >("text");
  const [error, setError] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formattedOutput, setFormattedOutput] = useState("");

  // Update local state when props change
  useEffect(() => {
    setApiKey(initialApiKey);
    setKey(initialKey);
    setIv(initialIv);
  }, [initialApiKey, initialKey, initialIv]);

  const formatOutput = (
    text: string,
    format: "text" | "json" | "xml" | "html" | "js"
  ) => {
    try {
      switch (format) {
        case "json":
          // Try to parse as JSON and format it
          const jsonObj = JSON.parse(text);
          return JSON.stringify(jsonObj, null, 2);
        case "xml":
          // Simple XML formatting (not a full parser)
          return text
            .replace(/></g, ">\n<")
            .replace(/<(\/?[^>]+)>/g, "<$1>\n")
            .trim();
        case "html":
          // Simple HTML formatting
          return text
            .replace(/></g, ">\n<")
            .replace(/<(\/?[^>]+)>/g, "<$1>\n")
            .trim();
        case "js":
          // For JS, we just return it as is (could add prettier in a real app)
          return text;
        default:
          return text;
      }
    } catch (e) {
      console.error("Error formatting output:", e);
      return text; // Return original if formatting fails
    }
  };

  const handleDecrypt = () => {
    try {
      setError("");
      if (!encryptedText) {
        setError("Please enter text to decrypt");
        return;
      }

      const config: DecryptionConfig = {
        apiKey: apiKey.trim() || undefined,
        key: key.trim() || undefined,
        iv: iv.trim() || undefined,
        outputFormat,
      };

      // In a real implementation, this would use CryptoJS
      const result = onDecrypt(encryptedText, algorithm, config);
      setDecryptedText(result);
      setFormattedOutput(formatOutput(result, outputFormat));
    } catch (err) {
      setError("Decryption failed. Please check your input and key.");
      console.error(err);
    }
  };

  // Update formatted output when output format changes
  useEffect(() => {
    if (decryptedText) {
      setFormattedOutput(formatOutput(decryptedText, outputFormat));
    }
  }, [outputFormat, decryptedText]);

  const copyToClipboard = () => {
    const textToCopy =
      outputFormat === "text" ? decryptedText : formattedOutput;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  return (
    <Card className="p-6 h-full bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
      <div className="pb-2">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-green-500"
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
          Decryption
        </h2>
      </div>

      {/* Algorithm dropdown - Commented for now, using AES by default */}
      {/* <div className="mb-4">
        <Label htmlFor="decryption-algorithm" className="block mb-2">
          Algorithm
        </Label>
        <Select value={algorithm} onValueChange={setAlgorithm}>
          <SelectTrigger id="decryption-algorithm" className="w-full">
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
      <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
        <span className="text-sm font-medium">Algorithm:</span>
        <span className="text-sm font-bold text-green-700 dark:text-green-300">
          {algorithm}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          Direct AES decryption
        </span>
      </div>

      {/* Advanced options moved to shared section at the top */}

      <div className="mb-4 flex-grow">
        <Label htmlFor="encrypted-text" className="block mb-2">
          Encrypted Text
        </Label>
        <Textarea
          id="encrypted-text"
          placeholder="Paste encrypted text here"
          value={encryptedText}
          onChange={(e) => setEncryptedText(e.target.value)}
          className="w-full h-32 resize-none"
        />
      </div>

      <Button
        onClick={handleDecrypt}
        className="mb-4 w-full bg-blue-600 hover:bg-blue-700"
      >
        Decrypt
      </Button>

      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex-grow overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="decrypted-result" className="block">
            Decrypted Result
          </Label>
          <div className="flex items-center gap-2">
            <Select
              value={outputFormat}
              onValueChange={(value: "text" | "json" | "xml" | "html" | "js") =>
                setOutputFormat(value)
              }
              className="mr-1"
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <Code className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="js">JavaScript</SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!decryptedText}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">
                      {copySuccess ? "Copied!" : "Copy"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-2">
            <div className="w-full h-32 overflow-x-auto bg-gray-50 dark:bg-gray-700 rounded p-2 font-mono text-sm">
              {outputFormat === "html" ? (
                <div dangerouslySetInnerHTML={{ __html: decryptedText }} />
              ) : (
                <pre className="whitespace-pre-wrap">{formattedOutput}</pre>
              )}
            </div>
          </TabsContent>
          <TabsContent value="raw" className="mt-2">
            <Textarea
              id="decrypted-result"
              readOnly
              value={decryptedText}
              className="w-full h-32 resize-none bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap"
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default DecryptionPanel;
