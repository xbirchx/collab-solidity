import React, { useState } from 'react'
import { Share2, Copy, QrCode } from 'lucide-react'
import QRCode from 'qrcode.react'

const SharePanel: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const sessionUrl = window.location.href

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleDownloadQR = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'session-qr.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar">
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-vscode-border">
        <Share2 className="w-5 h-5 text-vscode-accent" />
        <h3 className="font-semibold">Share Session</h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <h4 className="text-sm font-medium text-vscode-text mb-3">Scan to join</h4>
          <div className="bg-white p-4 rounded-lg inline-block">
            <QRCode 
              value={sessionUrl}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
          <button
            onClick={handleDownloadQR}
            className="mt-3 flex items-center space-x-2 mx-auto px-4 py-2 bg-vscode-accent hover:bg-vscode-accent-hover text-white rounded transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Download QR</span>
          </button>
        </div>

        {/* Session Link */}
        <div>
          <h4 className="text-sm font-medium text-vscode-text mb-3">Session Link</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={sessionUrl}
              readOnly
              className="flex-1 bg-vscode-panel border border-vscode-border rounded px-3 py-2 text-vscode-text text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded transition-colors ${
                copied 
                  ? 'bg-vscode-success text-white' 
                  : 'bg-vscode-accent hover:bg-vscode-accent-hover text-white'
              }`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-vscode-success mt-2">Link copied to clipboard!</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-vscode-panel rounded-lg p-4">
          <h4 className="text-sm font-medium text-vscode-text mb-2">How to join</h4>
          <div className="space-y-2 text-sm text-vscode-text-secondary">
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-vscode-accent text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              <span>Share the QR code or link with others</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-vscode-accent text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              <span>They can scan the QR code or click the link</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 bg-vscode-accent text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              <span>They'll automatically join the collaborative session</span>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="border-t border-vscode-border pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-vscode-text-secondary">Session ID:</span>
              <span className="text-vscode-text font-mono">solidity-editor-session</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vscode-text-secondary">Status:</span>
              <span className="text-vscode-success">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-vscode-text-secondary">Expires:</span>
              <span className="text-vscode-text">Never</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharePanel 