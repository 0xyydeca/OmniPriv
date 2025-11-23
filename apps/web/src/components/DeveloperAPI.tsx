'use client';

import { useState } from 'react';
import { CodeBracketIcon, PlayIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

/**
 * DeveloperAPI Component
 * 
 * Showcases the x402-gated API endpoint for external developers and AI agents.
 * Demonstrates how other dApps can trigger OmniPriv verifications programmatically.
 */
export function DeveloperAPI() {
  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const testEndpoint = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/refresh-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_x402_token_12345',
        },
        body: JSON.stringify({
          userHash: '0x1234567890abcdef1234567890abcdef12345678',
          policyId: '0xage18_policy',
          destinationChain: 11155420, // Optimism Sepolia
        }),
      });

      const data = await response.json();
      setTestResult({ status: response.status, data });
    } catch (error: any) {
      setTestResult({ status: 'error', data: { error: error.message } });
    } finally {
      setTesting(false);
    }
  };

  const curlExample = `curl -X POST http://localhost:3000/api/refresh-claim \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_X402_TOKEN" \\
  -d '{
    "userHash": "0x1234...5678",
    "policyId": "0xage18_policy",
    "destinationChain": 11155420
  }'`;

  const javascriptExample = `// Using fetch
const response = await fetch('https://omnipriv.app/api/refresh-claim', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_X402_TOKEN'
  },
  body: JSON.stringify({
    userHash: '0x1234...5678',
    policyId: '0xage18_policy',
    destinationChain: 11155420
  })
});

const result = await response.json();
console.log('Verification triggered:', result.txHash);`;

  const pythonExample = `import requests

response = requests.post(
    'https://omnipriv.app/api/refresh-claim',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_X402_TOKEN'
    },
    json={
        'userHash': '0x1234...5678',
        'policyId': '0xage18_policy',
        'destinationChain': 11155420
    }
)

result = response.json()
print(f"Verification triggered: {result['txHash']}")`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <CodeBracketIcon className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Developer API</h2>
        </div>
        <p className="text-blue-100">
          x402-gated endpoint for programmatic verification. Perfect for dApps, AI agents, and backend services.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">🔐</div>
          <h3 className="font-semibold mb-1">x402 Payment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pay-per-verification via CDP Facilitator
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold mb-1">AI Agent Ready</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            RESTful API for autonomous agents
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-semibold mb-1">CDP Funded</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gas paid by compliance treasury
          </p>
        </div>
      </div>

      {/* Endpoint Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Endpoint Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
              POST
            </span>
            <code className="flex-1 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded">
              /api/refresh-claim
            </code>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Authentication:</p>
            <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs">
              Authorization: Bearer &lt;x402_token&gt;
            </code>
          </div>

          <div>
            <p className="font-semibold mb-1">Request Body:</p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`{
  "userHash": "0x...",     // User address or hash
  "policyId": "0x...",      // Policy identifier
  "destinationChain": 11155420  // Chain ID
}`}</pre>
          </div>

          <div>
            <p className="font-semibold mb-1">Response:</p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "txHash": "0x...",        // Transaction hash
  "message": "Verification refresh triggered"
}`}</pre>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Code Examples</h3>

        {/* cURL */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300">cURL</span>
            <button
              onClick={() => copyToClipboard(curlExample, 'curl')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
            >
              {copied === 'curl' ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
            <code>{curlExample}</code>
          </pre>
        </div>

        {/* JavaScript */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300">JavaScript</span>
            <button
              onClick={() => copyToClipboard(javascriptExample, 'js')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
            >
              {copied === 'js' ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
            <code>{javascriptExample}</code>
          </pre>
        </div>

        {/* Python */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300">Python</span>
            <button
              onClick={() => copyToClipboard(pythonExample, 'python')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
            >
              {copied === 'python' ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
            <code>{pythonExample}</code>
          </pre>
        </div>
      </div>

      {/* Test Button */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <PlayIcon className="w-5 h-5" />
          Test the Endpoint
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Try a demo request with mock data (uses demo x402 token)
        </p>
        <button
          onClick={testEndpoint}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Send Test Request'}
        </button>

        {/* Test Result */}
        {testResult && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Response:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Use Cases */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-semibold">dApp Integration</p>
              <p className="text-gray-600 dark:text-gray-400">
                Trigger age verification before allowing game access
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold">AI Agent Actions</p>
              <p className="text-gray-600 dark:text-gray-400">
                Autonomous agents verify user eligibility for DeFi protocols
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <p className="font-semibold">Automated Refresh</p>
              <p className="text-gray-600 dark:text-gray-400">
                Cron jobs keep cross-chain verifications up-to-date
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <p className="font-semibold">Enterprise Backend</p>
              <p className="text-gray-600 dark:text-gray-400">
                Batch verification for compliance reporting systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
        <h3 className="text-lg font-semibold mb-2">💰 Pricing & Economics</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>x402 Payment:</strong> Pay per verification via CDP Facilitator
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Gas Costs:</strong> Covered by OmniPriv compliance treasury (CDP Server Wallet)
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Typical Cost:</strong> ~$0.01 USD per verification (Base Sepolia L2)
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
            💡 Production Note: CDP Server Wallet automatically funds gas for all API-triggered verifications
          </p>
        </div>
      </div>
    </div>
  );
}

