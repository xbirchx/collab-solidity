import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(address indexed from, uint256 value);
    
    constructor() {
        storedData = 0;
    }
    
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(msg.sender, x);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`

const CodeEditor: React.FC = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    // Configure editor for Solidity
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: 'vs-dark',
      wordWrap: 'on',
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
    })
  }

  // Handle editor resize when container changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <Editor
        height="100%"
        defaultLanguage="solidity"
        defaultValue={defaultSolidityCode}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: 'vs-dark',
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}

export default CodeEditor 