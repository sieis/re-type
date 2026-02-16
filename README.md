# Typing for Literary Speedrunners

A simple interface for practicing typing. Comes with Bible verses and literary passages so my kids have good things to meditate on while learning to type.

Added bonus: an auto start/stop timer for a little competition.

## Live Site

Deployed on Netlify:

[![Netlify Status](https://api.netlify.com/api/v1/badges/81e36560-621c-48c7-9b11-b512328a520a/deploy-status)](https://app.netlify.com/projects/re-type/deploys)

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