# Collaborative Solidity Editor

A real-time collaborative Solidity code editor built with React, Monaco Editor, and React Together.

## Features

- **Real-time Collaboration**: Multiple users can edit Solidity code simultaneously
- **Live Cursors**: See where other users are typing in real-time
- **Chat System**: Built-in chat for discussing code changes
- **User Management**: View connected users with avatars and status
- **Session Sharing**: Share sessions via QR codes and direct links
- **VS Code-like Interface**: Familiar dark theme and layout
- **Solidity Syntax Highlighting**: Full support for Solidity language

## Tech Stack

- **React 18** with TypeScript
- **Monaco Editor** for code editing
- **React Together** for real-time collaboration
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **QR Code React** for session sharing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collab-solidity
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Joining a Session

1. Open the application in your browser
2. You'll automatically join the collaborative session
3. Start editing Solidity code with others

### Sharing a Session

1. Click the "Share" button in the header
2. Share the QR code or link with others
3. They can scan the QR code or click the link to join

### Features

- **Real-time Editing**: All changes are synchronized across users
- **Live Cursors**: See where other users are typing
- **Chat**: Use the chat panel to discuss code changes
- **User List**: View all connected users and their status

## Project Structure

```
src/
├── components/
│   ├── CodeEditor.tsx      # Monaco Editor with Solidity support
│   ├── ChatPanel.tsx       # Real-time chat functionality
│   ├── UserList.tsx        # Connected users display
│   └── SharePanel.tsx      # Session sharing with QR codes
├── App.tsx                 # Main application component
├── main.tsx               # React entry point
└── index.css              # Global styles and Tailwind
```

## Configuration

The application uses React Together for real-time collaboration. The API key and session configuration are set in `src/main.tsx`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding Features

1. **New Components**: Add to `src/components/`
2. **Styling**: Use Tailwind CSS classes with VS Code theme colors
3. **Real-time Features**: Use React Together hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 