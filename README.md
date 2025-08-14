# Tailwind to CSS Converter

A powerful, real-time web application that converts Tailwind CSS utility classes to their equivalent CSS code. Perfect for learning, debugging, and understanding what CSS is generated from your Tailwind classes.

![Tailwind to CSS Converter](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)

## ✨ Features

### 🚀 Core Functionality
- **Real-time Conversion**: See your Tailwind classes converted to CSS instantly as you type
- **Side-by-side Interface**: Clean input panel on the left, CSS output on the right
- **One-click Copy**: Copy generated CSS to clipboard with a single click
- **Syntax Highlighting**: Color-coded CSS output for better readability

### 🛡️ Smart Validation
- **Input Validation**: Prevents malicious input and validates Tailwind classes
- **Error Handling**: Graceful error messages with helpful suggestions
- **Warning System**: Alerts for potentially invalid or unusual classes
- **Character Limits**: Visual indicators for input length with warnings

### ⚡ Performance Optimized
- **LRU Caching**: Intelligent caching system for faster repeated conversions
- **Debounced Input**: Smooth typing experience without excessive processing
- **React Optimization**: Memoized components for optimal re-rendering
- **Virtual DOM Approach**: Efficient style extraction using browser APIs

### 📱 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Accessibility**: Full WCAG compliance with proper ARIA labels and keyboard navigation
- **Quick Examples**: Pre-built examples to get started quickly
- **Loading States**: Smooth loading indicators during conversion
- **Error Recovery**: Graceful error boundaries prevent crashes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tailwind-to-css-converter.git
   cd tailwind-to-css-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
npm start
```

## 🎯 How It Works

The converter uses a sophisticated approach to extract CSS from Tailwind classes:

1. **Virtual Element Creation**: Creates a hidden DOM element with your Tailwind classes
2. **Style Computation**: Uses `getComputedStyle()` to extract actual CSS values
3. **CSS Generation**: Formats the computed styles into readable CSS
4. **Cleanup**: Removes virtual elements after processing

This approach ensures you get the exact CSS that Tailwind would generate in a real browser environment.

## 💡 Usage Examples

### Basic Usage
```
Input:  bg-blue-500 text-white p-4 rounded-lg
Output: .element {
          background-color: rgb(59, 130, 246);
          color: rgb(255, 255, 255);
          padding: 16px;
          border-radius: 8px;
        }
```

### Complex Layouts
```
Input:  flex items-center justify-between max-w-4xl mx-auto
Output: .element {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 896px;
          margin-left: auto;
          margin-right: auto;
        }
```

### Grid Systems
```
Input:  grid grid-cols-3 gap-6 md:grid-cols-4
Output: .element {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        
        @media (min-width: 768px) {
          .element {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── TailwindConverter.tsx    # Main converter interface
│   ├── InputPanel.tsx           # Input panel with examples
│   ├── OutputPanel.tsx          # Output panel with syntax highlighting
│   ├── ErrorBoundary.tsx        # Error boundary component
│   └── __tests__/              # Component tests
├── services/              # Business logic
│   ├── cssProcessor.ts    # Core conversion logic
│   └── __tests__/         # Service tests
├── types/                 # TypeScript type definitions
│   └── converter.ts       # Interface definitions
└── __tests__/            # Integration tests
    ├── integration.test.tsx     # End-to-end tests
    ├── accessibility.test.tsx   # Accessibility tests
    └── tailwind-classes.test.tsx # Tailwind class tests
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: End-to-end conversion flow testing
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Caching and optimization validation

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:

```env
# Optional: Analytics tracking
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Error reporting
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Customization
The converter can be customized through the `ProcessorConfig` interface:

```typescript
const config: ProcessorConfig = {
  debounceMs: 300,           // Input debounce delay
  maxInputLength: 10000,     // Maximum input length
  enableSyntaxHighlighting: true, // CSS syntax highlighting
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use semantic commit messages
- Ensure accessibility compliance
- Test on multiple browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility-first framework
- [Next.js](https://nextjs.org/) for the powerful React framework
- [React](https://reactjs.org/) for the component library
- The open-source community for inspiration and tools

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@tailwind-to-css.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/tailwind-to-css-converter/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/tailwind-to-css-converter/discussions)

## 🔮 Roadmap

- [ ] Support for custom Tailwind configurations
- [ ] Dark mode theme
- [ ] Export to different CSS formats (SCSS, Less)
- [ ] Browser extension
- [ ] VS Code extension
- [ ] API endpoint for programmatic access
- [ ] Batch conversion support
- [ ] CSS to Tailwind reverse conversion

---

**Made with ❤️ by developers, for developers**

*Star ⭐ this repository if you find it helpful!*