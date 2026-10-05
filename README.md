# MusicEmbedAPI

**MusicEmbedAPI** is a lightweight, modular, client-side audio embed player built with **Vanilla JavaScript (ES6)**.

It provides a modern music-player experience with a UI inspired by the overall experience of services such as **Spotify**, while remaining a standalone browser component that does not require React, Vue, or another frontend framework.

The library supports:

- Full-featured music player UI
- Compact track card UI
- Dedicated synchronized lyrics UI
- LRC lyric parsing and time synchronization
- Dark and light modes
- Album/cover artwork
- Artist information
- Credits and license information
- Web Share API with clipboard fallback
- Configurable playback controls
- Responsive styling
- Multiple player instances on the same page

> **Design note:** MusicEmbedAPI is inspired by modern music-streaming interfaces, with Spotify being the primary visual and UX reference. It is an independent project and is **not affiliated with, endorsed by, or sponsored by Spotify**.

## Live Demo

**Live Demo:**  
https://jproject-1.github.io/musicembedapi/

**Repository:**  
https://github.com/JPROJECT-1/musicembedapi

---

## Features

### 1. Three UI Types

MusicEmbedAPI provides three display modes:

| Type | Description |
|---|---|
| `full` | Complete player with artwork, playback controls, progress bar, lyrics, artist information, credits, and sharing |
| `track` | Compact music-card style component focused on the cover, title, artist, and play interaction |
| `lyrics` | Large synchronized lyrics-focused component with cover, title, artist, and active-line highlighting |

The default type is `full`.

---

### 2. Audio Playback

The player uses the browser's native `HTMLAudioElement`.

Supported audio sources can be any browser-compatible audio URL, such as:

- MP3
- WAV
- Other formats supported by the target browser

MusicEmbedAPI does not host or distribute audio files. You provide the audio URL through the `src` option.

---

### 3. Synchronized Lyrics

Lyrics can be supplied as a string in **LRC format**.

Example:

```text
[00:05.20]First line of the song
[00:10.50]Second line of the song
[00:15.90]Third line of the song
```

The player parses the timestamps and automatically highlights the current lyric line as the audio plays.

Lyrics can also automatically scroll to keep the active line visible.

---

### 4. Theme Support

The player supports:

- `dark`
- `light`

Dark mode is the default.

The compact `track` and `lyrics` cards can also use a custom `themeColor`.

---

### 5. Artist Information

The full player can optionally display an artist section with:

- Artist banner
- Artist name
- Verification indicator
- Artist statistics
- Artist description

---

### 6. Credits and Licensing

You can show production credits and a license label directly inside the full player.

This is useful when distributing music or other media with attribution requirements.

---

### 7. Share Support

The full player includes sharing support through the browser's **Web Share API**.

When Web Share is unavailable, MusicEmbedAPI falls back to copying the configured share URL to the clipboard.

---

### 8. Configurable Controls

You can disable selected controls without modifying the source code:

- Scrubbing
- Duration text
- Skip buttons
- Share button

---

## Requirements

MusicEmbedAPI is intended for modern browsers that support:

- ES6 JavaScript
- `HTMLAudioElement`
- DOM APIs
- CSS
- Optional: Web Share API
- Optional: Clipboard API

No frontend framework is required.

No build step is required for normal browser usage.

---

# Installation

MusicEmbedAPI is a browser-side JavaScript library.

Place the JavaScript file in your project and load it with a normal `<script>` tag.

```html
<script src="./musicembed.js"></script>
```

Then create a container for the player:

```html
<div id="player-root"></div>
```

Finally, initialize the player:

```html
<script>
  const player = new MusicEmbed({
    container: "#player-root",
    type: "full",
    src: "./music/song.mp3",
    cover: "./images/cover.jpg",
    title: "My Song",
    author: "My Artist"
  });
</script>
```

---

# Basic Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MusicEmbedAPI Example</title>
</head>
<body>

  <div id="music-player"></div>

  <script src="./musicembed.js"></script>

  <script>
    const player = new MusicEmbed({
      type: "full",
      container: "#music-player",
      width: "360px",
      height: "700px",

      src: "./music/song.mp3",
      cover: "./images/cover.jpg",
      title: "My Song",
      author: "My Artist",

      mode: "dark"
    });
  </script>

</body>
</html>
```

---

# Configuration

The constructor accepts an optional configuration object:

```js
const player = new MusicEmbed({
  // configuration here
});
```

## General Options

| Option | Type | Default | Description |
|---|---|---|---|
| `type` | `"full" \| "track" \| "lyrics"` | `"full"` | Selects the player layout |
| `container` | `string` | `"body"` | CSS selector for the element where the player is rendered |
| `width` | `string` | `"300px"` | Player width |
| `height` | `string` | `"400px"` | Player height |
| `overflow` | `string` | `"hidden"` | Vertical overflow behavior |
| `themeColor` | `string` | `"#2b4015"` | Background color used by compact layouts |
| `mode` | `"dark" \| "light"` | `"dark"` | Visual theme |
| `src` | `string` | `""` | Audio file URL |
| `cover` | `string` | `""` | Cover image URL |
| `title` | `string` | `""` | Track title |
| `author` | `string` | `""` | Artist or creator name |
| `license` | `string` | `""` | License text shown in the credits section |

### Example

```js
const player = new MusicEmbed({
  type: "full",
  container: "#player",
  width: "420px",
  height: "760px",
  overflow: "auto",
  themeColor: "#2b4015",

  src: "https://example.com/audio/song.mp3",
  cover: "https://example.com/images/cover.jpg",
  title: "Night Drive",
  author: "JPROJECT-1",

  mode: "dark",
  license: "CC BY 4.0"
});
```

---

# Playback Control Options

MusicEmbedAPI allows specific controls to be disabled.

| Option | Type | Default | Effect |
|---|---|---|---|
| `disableScrubbing` | `boolean` | `false` | Disables manual seeking with the progress bar |
| `disableDurationText` | `boolean` | `false` | Hides current-time and duration text |
| `disableSkip` | `boolean` | `false` | Hides the previous/next seek buttons |
| `disableShare` | `boolean` | `false` | Hides the share button |

Example:

```js
const player = new MusicEmbed({
  container: "#player",
  src: "./song.mp3",
  title: "Locked Playback",
  author: "Artist",

  disableScrubbing: true,
  disableDurationText: true,
  disableSkip: true,
  disableShare: true
});
```

## Important: Skip Button Behavior

The previous/next buttons are **not playlist navigation controls**.

They seek approximately:

- Previous: `-5 seconds`
- Next: `+5 seconds`

For example:

```text
Current position: 01:30
Previous button: 01:25
Next button: 01:35
```

---

# Lyrics Configuration

Use the `lyrics` option to provide LRC-formatted lyrics.

```js
const player = new MusicEmbed({
  container: "#player",
  src: "./song.mp3",
  cover: "./cover.jpg",
  title: "Example Song",
  author: "Example Artist",

  lyrics: `
[00:02.00]Welcome to the song
[00:06.50]This line appears next
[00:11.20]Now the third line is active
`
});
```

## LRC Format

Each lyric line should contain a timestamp:

```text
[mm:ss.xx]Lyric text
```

Example:

```text
[00:12.40]Hello world
[00:18.25]This is another line
[01:02.10]The song continues
```

The parser accepts timestamps with one to three decimal places.

Blank or missing lyric text is displayed as:

```text
♪
```

Lyrics are sorted automatically by timestamp.

---

## Automatic Lyric Scrolling

Automatic scrolling is enabled by default.

```js
autoScrollLyrics: true
```

Disable it with:

```js
autoScrollLyrics: false
```

---

## Lyric Font Size

The `lyrics` layout supports a custom font size.

Default:

```js
lyricFontSize: "auto"
```

When set to `"auto"`, the default size used by the lyrics card is `32px`.

You may also provide a number:

```js
lyricFontSize: 28
```

This becomes:

```css
28px
```

Or use a CSS size string:

```js
lyricFontSize: "2rem"
```

Example:

```js
const player = new MusicEmbed({
  type: "lyrics",
  container: "#lyrics-player",
  src: "./song.mp3",
  cover: "./cover.jpg",
  title: "Ocean",
  author: "Artist",

  lyrics: `
[00:03.00]A lyric line
[00:07.00]Another lyric line
[00:11.50]The song continues
`,

  autoScrollLyrics: true,
  lyricFontSize: "30px"
});
```

---

# Artist Information

Artist information is disabled by default.

Enable it with:

```js
artistInformation: {
  active: true,
  banner: "./artist-banner.jpg",
  name: "Artist Name",
  verified: true,
  stats: "12.4M monthly listeners",
  description: "Artist biography or additional information."
}
```

## Artist Options

| Option | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | `false` | Enables the artist information card |
| `banner` | `string` | `""` | Artist banner image URL |
| `name` | `string` | `""` | Artist name |
| `verified` | `boolean` | `false` | Displays the verification icon when an artist name is available |
| `stats` | `string` | `""` | Optional artist statistics |
| `description` | `string` | `""` | Artist description |

---

# Credits

Credits are also optional.

```js
credits: {
  active: true,
  list: [
    {
      role: "Artist",
      name: "Example Artist"
    },
    {
      role: "Composer",
      name: "Example Composer"
    },
    {
      role: "Producer",
      name: "Example Producer"
    }
  ]
}
```

Each credit entry contains:

| Property | Type | Description |
|---|---|---|
| `role` | `string` | Credit role |
| `name` | `string` | Person or organization name |

Example:

```js
const player = new MusicEmbed({
  container: "#player",
  src: "./song.mp3",
  title: "Example Song",
  author: "Example Artist",

  credits: {
    active: true,
    list: [
      { role: "Artist", name: "Example Artist" },
      { role: "Composer", name: "Example Composer" },
      { role: "Producer", name: "Example Producer" }
    ]
  },

  license: "CC BY 4.0"
});
```

The `license` text is displayed together with the credits section when provided.

---

# Sharing

Configure the share information with:

```js
share: {
  title: "My Song",
  description: "Check out this audio track",
  url: "https://example.com/song"
}
```

Options:

| Option | Type | Default |
|---|---|---|
| `title` | `string` | Track title or `"Shared Audio"` |
| `description` | `string` | `"Check out this audio track"` |
| `url` | `string` | `window.location.href` |

Example:

```js
const player = new MusicEmbed({
  container: "#player",
  src: "./song.mp3",
  title: "My Song",
  author: "My Artist",

  share: {
    title: "Listen to My Song",
    description: "A track from my project",
    url: "https://example.com/music/my-song"
  }
});
```

## Share Fallback

When `navigator.share` is available, the player uses the Web Share API.

When it is not available, the configured URL is copied to the clipboard and the user receives a browser alert confirming that the link was copied.

---

# UI Types

## Full Player

```js
const player = new MusicEmbed({
  type: "full",
  container: "#player",
  src: "./song.mp3",
  cover: "./cover.jpg",
  title: "Song Title",
  author: "Artist Name",
  lyrics: "[00:05.00]Hello world"
});
```

The full layout can include:

- Now Playing header
- Cover artwork
- Blurred cover background
- Song title
- Artist name
- Progress bar
- Current time
- Duration
- Play/pause
- ±5 second seek buttons
- Share button
- Synchronized lyrics
- Artist information
- Credits
- License
- MusicEmbedAPI footer

---

## Track Card

```js
const player = new MusicEmbed({
  type: "track",
  container: "#track",
  width: "320px",
  height: "400px",
  themeColor: "#2b4015",

  cover: "./cover.jpg",
  title: "Song Title",
  author: "Artist Name",
  src: "./song.mp3"
});
```

The track card is intentionally compact and focuses on:

- Cover art
- Song title
- Artist
- Play/pause interaction

Clicking the card toggles playback.

---

## Lyrics Card

```js
const player = new MusicEmbed({
  type: "lyrics",
  container: "#lyrics",
  width: "360px",
  height: "520px",
  themeColor: "#2b4015",

  cover: "./cover.jpg",
  title: "Song Title",
  author: "Artist Name",

  lyrics: `
[00:02.00]First line
[00:05.00]Second line
[00:09.00]Third line
`
});
```

The lyrics card displays:

- Mini cover
- Track title
- Artist name
- Large lyrics
- Active lyric highlighting
- Optional automatic scrolling

Clicking the card toggles playback.

---

# Multiple Players

You can create multiple MusicEmbed instances on the same page.

Each instance receives its own generated internal ID.

Example:

```html
<div id="player-one"></div>
<div id="player-two"></div>
```

```js
const playerOne = new MusicEmbed({
  container: "#player-one",
  src: "./song-one.mp3",
  cover: "./cover-one.jpg",
  title: "Song One",
  author: "Artist One"
});

const playerTwo = new MusicEmbed({
  container: "#player-two",
  type: "track",
  src: "./song-two.mp3",
  cover: "./cover-two.jpg",
  title: "Song Two",
  author: "Artist Two",
  themeColor: "#243b53"
});
```

Each player renders into its configured container.

> **Note:** the keyboard shortcut described below is attached globally to the document. Pressing `Space` can therefore affect the player instance handling that shortcut, so keyboard behavior should be considered when using multiple players.

---

# Keyboard Shortcut

Press:

```text
Space
```

to toggle play/pause.

The shortcut is ignored when the user is typing inside an:

- `<input>`
- `<textarea>`

---

# Public Methods

MusicEmbedAPI currently exposes the following class methods that are useful when working with the player internally or extending the library.

## `parseLrc(text)`

Parses an LRC lyric string.

```js
const lyrics = player.parseLrc(`
[00:05.00]Hello
[00:10.50]World
`);

console.log(lyrics);
```

Returns an array similar to:

```js
[
  { time: 5, text: "Hello" },
  { time: 10.5, text: "World" }
]
```

The returned list is sorted by timestamp.

---

## `formatTime(sec)`

Converts seconds into `minutes:seconds`.

```js
player.formatTime(185);
```

Result:

```text
3:05
```

Invalid or infinite values return:

```text
0:00
```

---

## Internal Rendering Methods

The class also contains rendering/setup methods such as:

```js
init()
injectCSS()
renderFull()
renderTrack()
renderLyrics()
cacheDOM()
attachEvents()
```

These methods are primarily used by the library itself.

Changing them is intended for developers who want to customize or fork MusicEmbedAPI.

---

# Loading Without Media

A player can be initialized without an audio source.

```js
const player = new MusicEmbed({
  container: "#player",
  title: "Loading...",
  author: "Artist"
});
```

When `src` is empty, the UI can still be rendered, but playback controls are disabled because there is no media source.

Missing cover, title, and artist values can also display built-in loading/skeleton placeholders.

---

# Styling and Dependencies

MusicEmbedAPI injects its base CSS into the document automatically.

The source also imports:

- **Inter** from Google Fonts
- **Font Awesome 6.4.0** from cdnjs

Therefore, the final appearance can depend on network access to those external resources.

The main UI is generated dynamically, so you do not need to manually copy the component CSS into your HTML.

---

# Basic Project Structure

A simple project can look like this:

```text
my-project/
├── index.html
├── musicembed.js
├── music/
│   └── song.mp3
└── images/
    └── cover.jpg
```

Example `index.html`:

```html
<div id="player"></div>

<script src="./musicembed.js"></script>

<script>
  new MusicEmbed({
    container: "#player",
    type: "full",
    width: "360px",
    height: "720px",

    src: "./music/song.mp3",
    cover: "./images/cover.jpg",
    title: "My Song",
    author: "My Artist"
  });
</script>
```

---

# Usage Rules

MusicEmbedAPI is provided as a player component. **You are responsible for the content you load into it.**

When using MusicEmbedAPI, follow these rules:

## 1. Use content you have the right to use

You must have appropriate permission, ownership, or a valid license for:

- Audio files
- Album/cover artwork
- Artist images
- Lyrics
- Other third-party media

Do not use MusicEmbedAPI as a way to distribute copyrighted music without authorization.

## 2. Respect licenses

When media requires attribution, include the appropriate information in the player or your project.

For example:

```js
license: "CC BY 4.0"
```

and:

```js
credits: {
  active: true,
  list: [
    { role: "Artist", name: "Creator Name" },
    { role: "Source", name: "Original Creator" }
  ]
}
```

## 3. Do not impersonate Spotify

MusicEmbedAPI may be inspired by Spotify's general design language, but your project should not falsely claim to be Spotify or an official Spotify product.

Do not use Spotify trademarks, branding, logos, or copyrighted assets as though they belong to MusicEmbedAPI.

## 4. Do not abuse external hosting

When loading audio, images, or lyrics from external servers, make sure your usage complies with the provider's:

- Terms of service
- Hotlinking policy
- Copyright rules
- API rules
- Bandwidth restrictions

## 5. Secure your sources

For production websites, HTTPS URLs are recommended.

Be careful when accepting URLs from untrusted users. Validate and sanitize any user-provided data before inserting it into your own application.

## 6. Respect user experience

Avoid autoplaying audio unexpectedly.

Provide clear controls and make it obvious when media is playing.

## 7. Do not use MusicEmbedAPI for illegal distribution

The library is a UI/player component. It does not grant rights to redistribute copyrighted music, lyrics, artwork, or other media.

---

# Security and Content Considerations

MusicEmbedAPI injects configuration values into generated HTML.

For projects that accept configuration from untrusted users, do not pass raw untrusted HTML or arbitrary user input directly into fields such as:

```js
title
author
lyrics
credits
license
```

Treat these values as application data and validate or sanitize them in the surrounding application when necessary.

Similarly, only load media URLs that your application trusts.

---

# Browser and CORS Considerations

MusicEmbedAPI relies on the browser's normal media loading rules.

If your audio file is hosted on another domain, the browser may require that server to allow the request appropriately.

For best results, host your audio and related assets on infrastructure configured for your website, or use a media host that explicitly permits your intended usage.

---

# Example: Complete Configuration

```js
const player = new MusicEmbed({
  type: "full",

  container: "#music-player",
  width: "380px",
  height: "760px",
  overflow: "auto",
  themeColor: "#2b4015",

  src: "https://example.com/audio/song.mp3",
  cover: "https://example.com/images/song-cover.jpg",

  title: "Example Song",
  author: "Example Artist",

  mode: "dark",

  disableScrubbing: false,
  disableDurationText: false,
  disableSkip: false,
  disableShare: false,

  lyrics: `
[00:03.00]Welcome to the song
[00:07.50]This is the second line
[00:12.30]The music continues
`,

  autoScrollLyrics: true,
  lyricFontSize: "auto",

  artistInformation: {
    active: true,
    banner: "https://example.com/images/artist-banner.jpg",
    name: "Example Artist",
    verified: true,
    stats: "1.2M listeners",
    description: "An example artist description."
  },

  credits: {
    active: true,
    list: [
      { role: "Artist", name: "Example Artist" },
      { role: "Composer", name: "Example Composer" },
      { role: "Producer", name: "Example Producer" }
    ]
  },

  license: "CC BY 4.0",

  share: {
    title: "Example Song",
    description: "Listen to Example Song",
    url: "https://example.com/music/example-song"
  }
});
```

---

# API Reference Summary

```text
MusicEmbed
│
├── General
│   ├── type
│   ├── container
│   ├── width
│   ├── height
│   ├── overflow
│   └── themeColor
│
├── Track
│   ├── src
│   ├── cover
│   ├── title
│   ├── author
│   └── mode
│
├── Controls
│   ├── disableScrubbing
│   ├── disableDurationText
│   ├── disableSkip
│   └── disableShare
│
├── Lyrics
│   ├── lyrics
│   ├── autoScrollLyrics
│   └── lyricFontSize
│
├── Artist
│   └── artistInformation
│       ├── active
│       ├── banner
│       ├── name
│       ├── verified
│       ├── stats
│       └── description
│
├── Credits
│   └── credits
│       ├── active
│       └── list
│
├── License
│   └── license
│
└── Sharing
    └── share
        ├── title
        ├── description
        └── url
```

---

# What MusicEmbedAPI Is Not

MusicEmbedAPI is **not**:

- A music streaming service
- A music database
- A Spotify API wrapper
- A music hosting platform
- A copyright/license provider
- A backend audio-processing service
- A playlist or recommendation service

It is a **client-side JavaScript player component**.

You provide the media and metadata; MusicEmbedAPI provides the player interface and playback experience.

---

# Spotify Inspiration and Trademark Notice

MusicEmbedAPI takes inspiration from modern streaming-player patterns, especially Spotify's general approach to:

- Music-focused layouts
- Album artwork presentation
- Now-playing interfaces
- Lyrics presentation
- Artist information
- Minimal playback controls
- Dark-themed music UI

However:

**MusicEmbedAPI is an independent project and is not affiliated with Spotify.**

Spotify and related trademarks belong to their respective owners.

Do not present MusicEmbedAPI as an official Spotify product or official Spotify integration.

---

# Contributing

Contributions are welcome.

You can contribute by:

- Reporting bugs
- Suggesting improvements
- Improving documentation
- Improving accessibility
- Adding tests
- Improving browser compatibility
- Improving the player UI
- Adding new optional features

Before submitting a major change, it is recommended to explain the purpose of the change and how it affects the current API.

---

# License

Copyright (c) 2026 JPROJECT-1

MusicEmbedAPI is licensed under the **MIT License**.

The MIT License permits use, modification, distribution, and private or commercial use, provided that the copyright notice and license notice are retained.

## MIT License

```text
MIT License

Copyright (c) 2026 JPROJECT-1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

# Credits

**MusicEmbedAPI**  
Created by **JPROJECT-1**

Inspired by modern music-player experiences, with Spotify as a primary reference.

Live Demo:  
https://jproject-1.github.io/musicembedapi/

Repository:  
https://github.com/JPROJECT-1/musicembedapi

---

## Final Note

MusicEmbedAPI is designed to make it easy to embed a polished music player into ordinary web pages using only JavaScript.

You can start with a simple configuration:

```js
new MusicEmbed({
  container: "#player",
  src: "./song.mp3",
  cover: "./cover.jpg",
  title: "My Song",
  author: "My Artist"
});
```

Then progressively add synchronized lyrics, artist information, credits, sharing, themes, and control options as your project grows.

