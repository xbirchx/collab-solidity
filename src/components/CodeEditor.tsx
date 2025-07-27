import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

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

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor
    
    // Define Cursor-like theme for Solidity
    monaco.editor.defineTheme('cursor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Comments
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: '6A9955', fontStyle: 'italic' },
        
        // Keywords
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'storage', foreground: '569CD6' },
        { token: 'storage.type', foreground: '569CD6' },
        
        // Types
        { token: 'type', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'type.primitive', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'type.qualifier', foreground: '569CD6' },
        
        // Functions
        { token: 'entity.name.function', foreground: 'DCDCAA' },
        { token: 'support.function', foreground: 'DCDCAA' },
        { token: 'meta.function-call', foreground: 'DCDCAA' },
        
        // Variables
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        { token: 'variable.language', foreground: '569CD6' },
        { token: 'variable.other', foreground: '9CDCFE' },
        
        // Constants
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'constant.numeric', foreground: 'B5CEA8' },
        { token: 'constant.language', foreground: '569CD6' },
        { token: 'constant.character', foreground: 'D7BA7D' },
        { token: 'constant.other', foreground: '4FC1FF' },
        
        // Strings
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.quoted', foreground: 'CE9178' },
        { token: 'string.quoted.single', foreground: 'CE9178' },
        { token: 'string.quoted.double', foreground: 'CE9178' },
        
        // Numbers
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'number.binary', foreground: 'B5CEA8' },
        { token: 'number.float', foreground: 'B5CEA8' },
        { token: 'number.integer', foreground: 'B5CEA8' },
        
        // Operators
        { token: 'keyword.operator', foreground: 'D4D4D4' },
        { token: 'operator', foreground: 'D4D4D4' },
        
        // Punctuation
        { token: 'punctuation', foreground: 'D4D4D4' },
        { token: 'punctuation.definition', foreground: 'D4D4D4' },
        { token: 'punctuation.section', foreground: 'D4D4D4' },
        { token: 'punctuation.separator', foreground: 'D4D4D4' },
        { token: 'punctuation.terminator', foreground: 'D4D4D4' },
        
        // Classes/Contracts
        { token: 'entity.name.class', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'entity.name.type', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'support.class', foreground: '4EC9B0', fontStyle: 'bold' },
        
        // Interfaces
        { token: 'entity.name.interface', foreground: '4EC9B0', fontStyle: 'bold' },
        
        // Enums
        { token: 'entity.name.enum', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'variable.other.enummember', foreground: '4FC1FF' },
        
        // Properties
        { token: 'variable.other.property', foreground: '9CDCFE' },
        { token: 'support.variable.property', foreground: '9CDCFE' },
        
        // Events
        { token: 'entity.name.event', foreground: 'D7BA7D' },
        { token: 'support.function.event', foreground: 'D7BA7D' },
        
        // Modifiers
        { token: 'entity.name.function.modifier', foreground: 'DCDCAA', fontStyle: 'bold' },
        { token: 'support.function.modifier', foreground: 'DCDCAA', fontStyle: 'bold' },
        
        // Solidity-specific tokens
        { token: 'keyword.solidity', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'storage.type.solidity', foreground: '569CD6' },
        { token: 'variable.language.solidity', foreground: '569CD6' },
        { token: 'constant.language.solidity', foreground: '569CD6' },
        
        // Address type
        { token: 'type.address', foreground: '4FC1FF' },
        
        // Mapping type
        { token: 'type.mapping', foreground: '4EC9B0' },
        
        // Struct type
        { token: 'type.struct', foreground: '4EC9B0' },
        
        // Library type
        { token: 'type.library', foreground: '4EC9B0' },
        
        // Contract type
        { token: 'type.contract', foreground: '4EC9B0', fontStyle: 'bold' },
        
        // Pragma directive
        { token: 'keyword.pragma', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Import directive
        { token: 'keyword.import', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Using directive
        { token: 'keyword.using', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Emit keyword
        { token: 'keyword.emit', foreground: 'D7BA7D' },
        
        // Function modifiers
        { token: 'keyword.payable', foreground: 'DCDCAA' },
        { token: 'keyword.view', foreground: 'DCDCAA' },
        { token: 'keyword.pure', foreground: 'DCDCAA' },
        { token: 'keyword.external', foreground: 'DCDCAA' },
        { token: 'keyword.internal', foreground: 'DCDCAA' },
        { token: 'keyword.public', foreground: 'DCDCAA' },
        { token: 'keyword.private', foreground: 'DCDCAA' },
        
        // Data location
        { token: 'keyword.memory', foreground: '569CD6' },
        { token: 'keyword.storage', foreground: '569CD6' },
        { token: 'keyword.calldata', foreground: '569CD6' }
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorCursor.foreground': '#aeafad',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.findMatchBackground': '#515c6a',
        'editor.findMatchHighlightBackground': '#3a3d41',
        'editor.hoverHighlightBackground': '#2a2d2e',
        'editor.lineHighlightBorder': '#454545',
        'editor.rangeHighlightBackground': '#2a2d2e',
        'editor.symbolHighlightBackground': '#2a2d2e',
        'editorWhitespace.foreground': '#404040'
      }
    })

    // Apply the Cursor-like theme
    monaco.editor.setTheme('cursor-dark')
    
    // Configure editor for Solidity with enhanced syntax highlighting
    editor.updateOptions({
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