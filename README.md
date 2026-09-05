# EchoVerse

A modern music web application built with HTML, CSS, and vanilla JavaScript.

## Current Phase

Phase 5 - JavaScript Architecture

## Technologies

- HTML5
- CSS3
- JavaScript

## Current Features

- Responsive music streaming UI
- Sidebar navigation
- Search interface
- Music cards
- Featured section
- Recently played section
- Playlist section
- Music player UI

## Phase 4 - LocalStorage & User Library

- Like/unlike songs
- Persistent liked songs
- Recently played tracking
- Persistent recently played history
- Library view
- Empty states
- Search integration
- Persistent user state

## Phase 5 - JavaScript Architecture

- Native ES modules
- Separated song data, player, storage, search, and UI responsibilities
- Application controller for coordination
- Improved maintainability without changing the user experience

### JavaScript Structure

```text
js/
├── app.js
├── data/songs.js
├── player/player.js
├── search/search.js
├── storage/storage.js
└── ui/ui.js
```

Run EchoVerse through a local development server because browser ES modules do not reliably load from `file://` URLs. For example:

```text
python -m http.server 8000
```

## Completed Phases

- Phase 1 - UI foundation
- Phase 2 - Music playback and player controls
- Phase 3 - Dynamic music library, search, and filtering
- Phase 4 - LocalStorage and user library

## Future Phases

- Phase 5 - API integration
- Phase 6 - Advanced features
