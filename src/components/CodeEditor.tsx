import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useSession } from '../contexts/SessionContext'

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev A comprehensive example showcasing Solidity syntax highlighting
 * @author Your Name
 */
contract MyToken is ERC20, Ownable {
    // State variables
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;
    uint256 public tokenPrice = 0.001 ether;
    bool public paused = false;
    address public treasury;
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    // Mappings
    mapping(address => uint256) public userPurchases;
    mapping(address => bool) public whitelistedAddresses;
    
    // Structs
    struct PurchaseInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 price;
    }
    
    // Enums
    enum TokenState { Active, Paused, Discontinued }
    TokenState public currentState = TokenState.Active;
    
    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Token: contract is paused");
        _;
    }
    
    modifier onlyWhitelisted() {
        require(whitelistedAddresses[msg.sender], "Token: not whitelisted");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Token: amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "Token: exceeds max supply");
        _;
    }
    
    /**
     * @dev Constructor function
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param initialSupply Initial token supply
     * @param treasury_ Treasury address
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address treasury_
    ) ERC20(name_, symbol_) {
        require(treasury_ != address(0), "Token: invalid treasury address");
        treasury = treasury_;
        
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }
    
    /**
     * @dev Purchase tokens with ETH
     * @param amount Number of tokens to purchase
     */
    function purchaseTokens(uint256 amount) 
        external 
        payable 
        whenNotPaused 
        validAmount(amount) 
    {
        uint256 cost = amount * tokenPrice;
        require(msg.value >= cost, "Token: insufficient payment");
        
        // Update state
        userPurchases[msg.sender] += amount;
        _mint(msg.sender, amount);
        
        // Transfer excess ETH back to buyer
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        // Transfer payment to treasury
        payable(treasury).transfer(cost);
        
        emit TokensPurchased(msg.sender, amount, cost);
    }
    
    /**
     * @dev Update token price (owner only)
     * @param newPrice New price per token
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Token: price must be greater than 0");
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Update treasury address (owner only)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Token: invalid treasury address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @dev Add address to whitelist (owner only)
     * @param user Address to whitelist
     */
    function addToWhitelist(address user) external onlyOwner {
        whitelistedAddresses[user] = true;
    }
    
    /**
     * @dev Remove address from whitelist (owner only)
     * @param user Address to remove from whitelist
     */
    function removeFromWhitelist(address user) external onlyOwner {
        whitelistedAddresses[user] = false;
    }
    
    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        paused = true;
        currentState = TokenState.Paused;
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        paused = false;
        currentState = TokenState.Active;
    }
    
    /**
     * @dev Get purchase info for a user
     * @param user Address to query
     * @return amount Total amount purchased
     * @return isWhitelisted Whether user is whitelisted
     */
    function getUserInfo(address user) 
        external 
        view 
        returns (uint256 amount, bool isWhitelisted) 
    {
        return (userPurchases[user], whitelistedAddresses[user]);
    }
    
    /**
     * @dev Emergency function to recover stuck ETH
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Token: no ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Override transfer function to add pause check
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function to add pause check
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Accept ETH but don't mint tokens automatically
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Token: function not found");
    }
}`

const CodeEditor: React.FC = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { canEdit } = useSession()

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor
    
    // Set editor to read-only if user can't edit
    editor.updateOptions({ readOnly: !canEdit })
    
    // Register Solidity language
    monaco.languages.register({ id: 'solidity' })
    
    // Configure Solidity language
    monaco.languages.setLanguageConfiguration('solidity', {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    })
    
    // Define Solidity tokenizer
    monaco.languages.setMonarchTokensProvider('solidity', {
      keywords: [
        'pragma', 'solidity', 'contract', 'interface', 'library', 'is', 'import', 'using',
        'function', 'modifier', 'event', 'struct', 'enum', 'mapping', 'address', 'bool',
        'string', 'bytes', 'uint', 'int', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
        'int8', 'int16', 'int32', 'int64', 'int128', 'int256', 'bytes1', 'bytes2', 'bytes3', 'bytes4',
        'bytes5', 'bytes6', 'bytes7', 'bytes8', 'bytes9', 'bytes10', 'bytes11', 'bytes12',
        'bytes13', 'bytes14', 'bytes15', 'bytes16', 'bytes17', 'bytes18', 'bytes19', 'bytes20',
        'bytes21', 'bytes22', 'bytes23', 'bytes24', 'bytes25', 'bytes26', 'bytes27', 'bytes28',
        'bytes29', 'bytes30', 'bytes31', 'bytes32',
        'public', 'private', 'internal', 'external', 'view', 'pure', 'payable', 'constant',
        'immutable', 'override', 'virtual', 'abstract', 'indexed', 'anonymous',
        'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'throw', 'revert',
        'require', 'assert', 'new', 'delete', 'this', 'super', 'selfdestruct', 'suicide',
        'var', 'true', 'false', 'null', 'now', 'block', 'msg', 'tx', 'gasleft', 'gas',
        'wei', 'szabo', 'finney', 'ether', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'years'
      ],
      
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],
      
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/[A-Z][\w\$]*/, 'type.identifier'],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],
          [/`/, { token: 'string.quote', bracket: '@open', next: '@string_backtick' }]
        ],
        
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],
        
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
        
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],
        
        string_backtick: [
          [/[^\\`]+/, 'string'],
          [/\\./, 'string.escape'],
          [/`/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ]
      }
    })

    // Set theme
    monaco.editor.defineTheme('cursor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6' },
        { token: 'type.identifier', foreground: '4ec9b0' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'comment', foreground: '6a9955' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'delimiter', foreground: 'd4d4d4' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    })
  }

  // Update editor read-only state when permissions change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: !canEdit })
    }
  }, [canEdit])

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
      {!canEdit && (
        <div className="absolute top-4 right-4 z-10 bg-vscode-warning text-vscode-bg px-3 py-1 rounded text-sm font-medium">
          Read Only
        </div>
      )}
      <Editor
        height="100%"
        defaultLanguage="solidity"
        defaultValue={defaultSolidityCode}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: 'Consolas, "Courier New", "Fira Code", monospace',
          theme: 'cursor-dark',
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveIndentation: true
          },
          renderWhitespace: 'selection',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          mouseWheelZoom: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          hover: { enabled: true },
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          links: true,
          colorDecorators: true,
          lightbulb: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: false,
          trimAutoWhitespace: true,
          largeFileOptimizations: true
        }}
      />
    </div>
  )
}

export default CodeEditor 