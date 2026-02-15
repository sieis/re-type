# Typing Practice Web Application

A simple, clean typing practice application built with vanilla HTML, CSS (Tailwind), and JavaScript.

## Features

- **Multiple Passages**: Select from various typing passages via dropdown menu
- **Real-time Highlighting**: Text highlights green for correct input, red for incorrect
- **Automatic Timer**: Starts when you begin typing, stops when passage is complete
- **WPM Calculation**: Displays words per minute when you finish
- **Session Reset**: Selecting a new passage resets everything

## How to Run

### Local Development
Simply open `index.html` in your web browser. No build process required.

### Netlify Deployment
1. Push this repository to GitHub
2. Connect to Netlify
3. Deploy (no build command needed)

## File Structure

```
typing-practice/
├── index.html       # Main HTML file
├── app.js          # JavaScript logic
├── passages.json   # Typing passages data
└── README.md       # This file
```

## Adding New Passages

Edit `passages.json` and add new objects with this format:

```json
{
    "title": "Your Passage Title",
    "passage": "Your passage text goes here..."
}
```

The dropdown will automatically update with your new passages.

## Technology Stack

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)

## License

Free to use and modify.
