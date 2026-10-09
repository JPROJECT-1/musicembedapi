/**
 * MusicEmbedAPI
 * A modular audio player engine with lyrics support, time synchronization, and responsive UI.
 * @version 2.0.0
 * @author JPROJECT-1
 * @license MIT
 */
class MusicEmbed {
  /**
   * Initializes the MusicEmbed Player
   * @param {Object} userConfig - Player configuration object.
   * @param {"full"|"track"|"lyrics"} userConfig.type - The UI layout type.
   * @param {string} userConfig.container - CSS Selector for the wrapper (e.g., "#player-root").
   * @param {string} userConfig.src - URL of the audio file (mp3, wav).
   * @param {string} userConfig.cover - URL of the album cover image.
   * @param {string} userConfig.title - Song title.
   * @param {string} userConfig.author - Artist or creator name.
   * @param {string} userConfig.lyrics - Lyrics text in LRC format.
   */
  constructor(userConfig = {}) {
    // Deep merge default config with user config
    this.config = {
      type: userConfig.type || "full", // "full", "track", "lyrics"
      container: userConfig.container || "body",
      width: userConfig.width || "300px",
      height: userConfig.height || "400px",
      overflow: userConfig.overflow || "hidden",
      themeColor: userConfig.themeColor || "#2b4015",

      src: userConfig.src || "",
      cover: userConfig.cover || "",
      title: userConfig.title || "",
      author: userConfig.author || "",
      mode: userConfig.mode === "light" ? "light" : "dark",
      license: userConfig.license || "",

      disableScrubbing: userConfig.disableScrubbing ?? false,
      disableDurationText: userConfig.disableDurationText ?? false,
      disableSkip: userConfig.disableSkip ?? false,
      disableShare: userConfig.disableShare ?? false,

      lyrics: typeof userConfig.lyrics === "string" ? userConfig.lyrics : false,
      autoScrollLyrics: userConfig.autoScrollLyrics ?? true,
      lyricFontSize: userConfig.lyricFontSize || "auto",

      artistInformation: {
        active: userConfig.artistInformation?.active ?? false,
        banner: userConfig.artistInformation?.banner || "",
        name: userConfig.artistInformation?.name || "",
        verified: userConfig.artistInformation?.verified ?? false,
        stats: userConfig.artistInformation?.stats || "",
        description: userConfig.artistInformation?.description || "",
      },
      credits: {
        active: userConfig.credits?.active ?? false,
        list: Array.isArray(userConfig.credits?.list)
          ? userConfig.credits.list
          : [],
      },
      share: {
        title: userConfig.share?.title || userConfig.title || "Shared Audio",
        description:
          userConfig.share?.description || "Check out this audio track",
        url: userConfig.share?.url || window.location.href,
      },
    };

    // Player State
    this.audio = new Audio(this.config.src);
    this.lyricsData = this.parseLrc(this.config.lyrics);
    this.activeLyricIndex = -1;
    this.instanceId = "me-" + Math.random().toString(36).substring(2, 9);

    // Container Element
    this.containerEl = document.querySelector(this.config.container);
    if (!this.containerEl) {
      console.error(
        `[MusicEmbed] Container '${this.config.container}' not found.`,
      );
      return;
    }

    this.init();
  }

  /**
   * Runs the initial setup cycle.
   */
  init() {
    this.injectCSS();

    switch (this.config.type) {
      case "full":
        this.renderFull();
        break;
      case "track":
        this.renderTrack();
        break;
      case "lyrics":
        this.renderLyrics();
        break;
      default:
        this.renderFull();
    }

    this.cacheDOM();
    this.attachEvents();
  }

  /**
   * Injects the base CSS into the Document Head (Only once).
   */
  injectCSS() {
    if (document.getElementById("music-embed-styles")) return;
    const style = document.createElement("style");
    style.id = "music-embed-styles";
    style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
            @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

            /* --- GLOBAL --- */
            .me-base-wrapper {
                font-family: 'Inter', sans-serif;
                box-sizing: border-box;
                overflow-x: hidden !important; 
                position: relative;
            }
            .me-skeleton {
                background: rgba(150, 150, 150, 0.2);
                background-image: linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.1) 40px, transparent 80px);
                background-size: 200% 100%;
                animation: me-loading 1.5s infinite;
                color: transparent !important;
                border-radius: 8px;
                user-select: none;
                pointer-events: none;
            }
            @keyframes me-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

            /* --- TYPE: FULL --- */
            .me-full-wrapper {
                background-color: var(--me-bg, #121212);
                color: var(--me-text, #ffffff);
                border-radius: 24px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                margin: 0 auto;
            }
            .me-full-wrapper.light { --me-bg: #f8fafc; --me-text: #0f172a; --me-subtext: #64748b; --me-control-bg: rgba(0,0,0,0.05); --me-card-bg: #ffffff; }
            .me-full-wrapper.dark { --me-bg: #121212; --me-text: #ffffff; --me-subtext: #888888; --me-control-bg: rgba(255,255,255,0.1); --me-card-bg: #222222; }
            
            .me-header { display: flex; justify-content: space-between; padding: 20px; font-size: 10px; font-weight: 700; letter-spacing: 2px; z-index: 10; position: relative;}
            .me-header i { font-size: 16px; cursor: pointer; opacity: 0.7; transition: 0.2s; }
            .me-header i:hover { opacity: 1; }
            
            .me-cover-area { position: relative; z-index: 10; padding: 10px 40px; display: flex; justify-content: center; }
            .me-cover-area img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
            .me-bg-blur { position: absolute; inset: 0; background-size: cover; background-position: center; filter: blur(40px) brightness(0.3); z-index: 0; transform: scale(1.2); }
            
            .me-controls { position: relative; z-index: 10; padding: 10px 24px 30px; }
            .me-info .me-title { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
            .me-info .me-author { font-size: 14px; color: var(--me-subtext); font-weight: 500; }
            
            /* PROGRESS BAR YOUTUBE STYLE */
            .me-progress { display: flex; align-items: center; gap: 10px; margin: 20px 0; width: 100%; }
            .me-time { font-size: 12px; min-width: 35px; font-variant-numeric: tabular-nums; }
            .me-curr-time { color: var(--me-text); font-weight: 700; text-align: left; } 
            .me-dur-time { color: var(--me-subtext); font-weight: 500; text-align: right; }
            
            .me-slider { 
                flex: 1; -webkit-appearance: none; height: 4px; 
                background: rgba(255, 255, 255, 0.2); border-radius: 2px; 
                cursor: pointer; outline: none;
                background-image: linear-gradient(to right, var(--me-text) 0%, var(--me-text) 0%, rgba(255, 255, 255, 0.2) 0%);
            }
            .me-slider::-webkit-slider-thumb { 
                -webkit-appearance: none; height: 12px; width: 12px; border-radius: 50%; 
                background: var(--me-text); margin-top: -4px; cursor: pointer; 
                box-shadow: 0 0 4px rgba(0,0,0,0.5);
            }
            .me-slider.no-scrub { pointer-events: none; }
            
            .me-buttons { display: flex; justify-content: center; align-items: center; gap: 24px; }
            .me-btn-play { width: 56px; height: 56px; border-radius: 50%; background: var(--me-text); color: var(--me-bg); font-size: 20px; display: flex; justify-content: center; align-items: center; cursor: pointer; border: none;}
            .me-btn-skip { background: transparent; border: none; color: var(--me-text); font-size: 20px; cursor: pointer; opacity: 0.8; transition: 0.2s;}
            .me-btn-skip:hover { opacity: 1; transform: scale(1.1); }
            
            .me-content { position: relative; z-index: 5; background: var(--me-bg); padding: 30px 20px 20px; border-radius: 24px 24px 0 0; }
            .me-section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
            
            .me-lyrics-box { background: var(--me-control-bg); border-radius: 12px; padding: 20px; height: 300px; overflow-y: auto; scroll-behavior: smooth; margin-bottom: 24px; }
            .me-lyric-line { font-size: 16px; font-weight: 600; color: var(--me-subtext); margin-bottom: 16px; transition: 0.3s; opacity: 0.5; }
            .me-lyric-line.active { color: var(--me-text); font-size: 18px; opacity: 1; }
            
            .me-artist-card { background: var(--me-card-bg); border-radius: 16px; overflow: hidden; margin-bottom: 24px; }
            .me-artist-banner-wrapper { position: relative; height: 200px; width: 100%; background: var(--me-control-bg); }
            .me-artist-banner-wrapper::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%); z-index: 1; }
            .me-artist-banner-wrapper img { width: 100%; height: 100%; object-fit: cover; }
            .me-artist-label { position: absolute; top: 16px; left: 16px; color: #fff; font-weight: 700; font-size: 15px; z-index: 2;}
            .me-artist-body { padding: 20px; }
            .me-artist-name { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
            .me-artist-verified { color: #4ade80; font-size: 16px; }
            .me-artist-stats { font-size: 13px; color: var(--me-subtext); margin-bottom: 16px; }
            .me-artist-desc { font-size: 14px; line-height: 1.5; color: var(--me-text); }
            .me-credits { background: var(--me-control-bg); border-radius: 12px; padding: 15px; font-size: 13px;}
            .me-credit-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .me-credit-role { color: var(--me-subtext); }
            .me-license-row { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(150,150,150,0.2); }
            .me-footer { text-align: center; font-size: 10px; color: var(--me-subtext); margin-top: 30px; letter-spacing: 1px; padding-bottom: 10px; }
            .me-footer a { color: var(--me-text); text-decoration: none; font-weight: 800; transition: 0.2s;}

            /* --- TYPE: CARDS (TRACK & LYRICS) --- */
            .me-card-track, .me-card-lyrics {
                border-radius: 16px; padding: 24px; color: #fff; position: relative;
                overflow: hidden; cursor: pointer; transition: transform 0.2s;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 0 auto; display: flex;
            }
            .me-card-track:active, .me-card-lyrics:active { transform: scale(0.98); }
            
            /* TYPE: TRACK (ABSOLUTE SQUARE COVER) */
            .me-card-track { flex-direction: column; justify-content: center; align-items: center; text-align: center; }
            .me-story-cover { 
                width: 100%;
                /* Smart CSS: Maintains 1:1 ratio, ensuring it doesn't overflow height-wise */
                max-width: max(80%, 80%); 
                aspect-ratio: 1 / 1 !important; 
                border-radius: 12px; 
                object-fit: cover; 
                margin: 0 auto 20px auto; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                flex-shrink: 0; 
            }
            .me-story-title { font-size: 24px; font-weight: 800; margin-bottom: 4px; line-height: 1.2; width: 100%; }
            .me-story-author { font-size: 15px; color: rgba(255,255,255,0.8); font-weight: 500; width: 100%; }
            
            /* TYPE: LYRICS */
            .me-card-lyrics { flex-direction: column; }
            .me-story-lyrics-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-shrink: 0; }
            .me-story-mini-cover { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
            .me-story-lyrics-title { font-size: 16px; font-weight: 800; }
            .me-story-lyrics-subtitle { font-size: 13px; color: rgba(255,255,255,0.8); }
            
            .me-story-big-lyric-container {
                flex: 1; overflow-y: auto; scroll-behavior: smooth;
                mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
                -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
            }
            .me-story-big-lyric-container::-webkit-scrollbar { display: none; }
            .me-story-big-lyric-container { -ms-overflow-style: none; scrollbar-width: none; }
            
            .me-story-big-lyric-line {
                font-size: 1em; font-weight: 800; line-height: 1.3;
                opacity: 0.4; transition: opacity 0.3s;
                margin-bottom: 20px; padding-bottom: 10px;
            }
            .me-story-big-lyric-line.active { opacity: 1; }
            
            .me-story-play-indicator { 
                position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; 
                background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; 
                align-items: center; justify-content: center; backdrop-filter: blur(5px); 
                opacity: 0; transition: 0.2s; z-index: 10;
            }
            .me-card-track:hover .me-story-play-indicator, .me-card-lyrics:hover .me-story-play-indicator { opacity: 1; }
        `;
    document.head.appendChild(style);
  }

  /**
   * Parses an LRC formatted string into an array of objects.
   * @param {string} text - The LRC lyrics text.
   * @returns {Array} Array of objects containing {time, text}.
   */
  parseLrc(text) {
    if (typeof text !== "string" || !text.trim()) return [];
    const lines = text.split("\n");
    const result = [];
    const regex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;
    lines.forEach((line) => {
      const match = regex.exec(line.trim());
      if (match) {
        const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
        result.push({ time, text: match[3].trim() || "♪" });
      }
    });
    return result.sort((a, b) => a.time - b.time);
  }

  /**
   * Formats seconds into a minute:second string (e.g., 3:05).
   */
  formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  renderFull() {
    const c = this.config;
    const noMedia = !c.src;

    const titleHtml = c.title
      ? `<div class="me-title">${c.title}</div>`
      : `<div class="me-title me-skeleton" style="width: 70%; height: 26px; margin-bottom: 8px;">Loading</div>`;
    const authorHtml = c.author
      ? `<div class="me-author">${c.author}</div>`
      : `<div class="me-author me-skeleton" style="width: 40%; height: 16px;">Loading</div>`;
    const coverHtml = c.cover
      ? `<img src="${c.cover}" alt="Cover">`
      : `<div class="me-skeleton" style="width: 100%; aspect-ratio: 1/1; border-radius: 12px;"></div>`;
    const bgBlurHtml = c.cover
      ? `background-image: url('${c.cover}')`
      : `background: var(--me-control-bg)`;

    let html = `
        <div class="me-base-wrapper me-full-wrapper ${c.mode}" id="${this.instanceId}" style="width: ${c.width}; height: ${c.height}; overflow-y: ${c.overflow};">
            <div class="me-bg-blur" style="${bgBlurHtml}"></div>
            <div class="me-header">
                <span>NOW PLAYING</span>
                ${!c.disableShare ? `<i class="fa-solid fa-share-nodes me-share-btn"></i>` : `<div></div>`}
            </div>
            <div class="me-cover-area">${coverHtml}</div>
            <div class="me-controls">
                <div class="me-info">${titleHtml}${authorHtml}</div>
                <div class="me-progress">
                    <span class="me-time me-curr-time" style="${c.disableDurationText ? "display:none;" : ""}">0:00</span>
                    <input type="range" class="me-slider ${c.disableScrubbing ? "no-scrub" : ""}" value="0" step="0.1" min="0" max="100" ${noMedia ? "disabled" : ""}>
                    <span class="me-time me-dur-time" style="${c.disableDurationText ? "display:none;" : ""}">0:00</span>
                </div>
                <div class="me-buttons">
                    ${!c.disableSkip ? `<button class="me-btn-skip me-prev-btn" ${noMedia ? "disabled" : ""}><i class="fa-solid fa-backward-step"></i></button>` : ``}
                    <button class="me-btn-play" ${noMedia ? "disabled" : ""}><i class="fa-solid fa-play" style="margin-left:4px;"></i></button>
                    ${!c.disableSkip ? `<button class="me-btn-skip me-next-btn" ${noMedia ? "disabled" : ""}><i class="fa-solid fa-forward-step"></i></button>` : ``}
                </div>
            </div>
            <div class="me-content">`;

    if (c.artistInformation.active) {
      const artName =
        c.artistInformation.name ||
        '<span class="me-skeleton" style="width:120px;height:24px;display:inline-block"></span>';
      const artBanner = c.artistInformation.banner
        ? `<img src="${c.artistInformation.banner}" alt="Banner">`
        : `<div class="me-skeleton" style="width:100%; height:100%;"></div>`;
      const artDesc =
        c.artistInformation.description ||
        '<div class="me-skeleton" style="width:100%;height:40px;margin-top:10px;"></div>';

      html += `
                <div class="me-artist-card">
                    <div class="me-artist-banner-wrapper">
                        <div class="me-artist-label">About the artist</div>
                        ${artBanner}
                    </div>
                    <div class="me-artist-body">
                        <div class="me-artist-name">
                            ${artName}
                            ${c.artistInformation.verified && c.artistInformation.name ? '<i class="fa-solid fa-circle-check me-artist-verified"></i>' : ""}
                        </div>
                        ${c.artistInformation.stats ? `<div class="me-artist-stats">${c.artistInformation.stats}</div>` : ""}
                        <div class="me-artist-desc">${artDesc}</div>
                    </div>
                </div>`;
    }

    if (c.lyrics !== false) {
      html += `
                <div class="me-section-title">Lyrics</div>
                <div class="me-lyrics-box">
                    ${
                      this.lyricsData.length > 0
                        ? this.lyricsData
                            .map(
                              (l, i) =>
                                `<div class="me-lyric-line" data-index="${i}">${l.text}</div>`,
                            )
                            .join("")
                        : `<div class="me-lyric-line" style="text-align:center; padding-top:40px;">Lyrics unavailable</div>`
                    }
                </div>`;
    }

    if ((c.credits.active && c.credits.list.length > 0) || c.license) {
      html += `<div class="me-section-title" style="margin-top:10px;">Credits</div><div class="me-credits">`;
      if (c.credits.active) {
        html += c.credits.list
          .map(
            (cred) => `
                    <div class="me-credit-row">
                        <span class="me-credit-role">${cred.role || "Unknown"}</span>
                        <span style="font-weight:600;">${cred.name || "Unknown"}</span>
                    </div>
                `,
          )
          .join("");
      }
      if (c.license) {
        html += `<div class="me-credit-row me-license-row"><span class="me-credit-role">License</span><span style="font-weight:600; max-width:60%; text-align:right;">${c.license}</span></div>`;
      }
      html += `</div>`;
    }

    html += `
                <div class="me-footer">POWERED BY <a href="https://github.com/JPROJECT-1/musicembedapi" target="_blank">MUSICEMBEDAPI</a></div>
            </div>
        </div>`;

    this.containerEl.innerHTML = html;
  }

  renderTrack() {
    const c = this.config;
    const coverSrc = c.cover
      ? `<img src="${c.cover}" class="me-story-cover" alt="Cover">`
      : `<div class="me-skeleton me-story-cover"></div>`;
    const titleStr = c.title
      ? c.title
      : `<span class="me-skeleton" style="width:180px;height:28px;display:inline-block">Loading</span>`;
    const authorStr = c.author
      ? c.author
      : `<span class="me-skeleton" style="width:100px;height:16px;display:inline-block;margin-top:4px;">Loading</span>`;

    let html = `
        <div class="me-base-wrapper me-card-track" id="${this.instanceId}" style="width: ${c.width}; height: ${c.height}; background-color: ${c.themeColor};">
            <div class="me-story-play-indicator"><i class="fa-solid fa-play"></i></div>
            ${coverSrc}
            <div class="me-story-title">${titleStr}</div>
            <div class="me-story-author">${authorStr}</div>
        </div>`;
    this.containerEl.innerHTML = html;
  }

  renderLyrics() {
    const c = this.config;
    const miniCoverSrc = c.cover
      ? `<img src="${c.cover}" class="me-story-mini-cover" alt="Mini">`
      : `<div class="me-skeleton me-story-mini-cover"></div>`;
    let fontSize =
      c.lyricFontSize === "auto"
        ? "32px"
        : typeof c.lyricFontSize === "number"
          ? c.lyricFontSize + "px"
          : c.lyricFontSize;

    let html = `
        <div class="me-base-wrapper me-card-lyrics" id="${this.instanceId}" style="width: ${c.width}; height: ${c.height}; background-color: ${c.themeColor};">
            <div class="me-story-play-indicator"><i class="fa-solid fa-play"></i></div>
            <div class="me-story-lyrics-header">
                ${miniCoverSrc}
                <div>
                    <div class="me-story-lyrics-title">${c.title || '<span class="me-skeleton" style="width:100px;height:16px;display:inline-block"></span>'}</div>
                    <div class="me-story-lyrics-subtitle">Track • ${c.author || "Unknown"}</div>
                </div>
            </div>
            <div class="me-story-big-lyric-container" style="font-size: ${fontSize};">
                ${
                  this.lyricsData.length > 0
                    ? this.lyricsData
                        .map(
                          (l, i) =>
                            `<div class="me-story-big-lyric-line" data-index="${i}">${l.text}</div>`,
                        )
                        .join("")
                    : "Lyrics unavailable"
                }
            </div>
        </div>`;
    this.containerEl.innerHTML = html;
  }

  /**
   * Caches DOM elements to avoid frequent DOM lookups.
   */
  cacheDOM() {
    const w = document.getElementById(this.instanceId);
    this.dom = {
      wrapper: w,
      playBtn: w.querySelector(`.me-btn-play`),
      prevBtn: w.querySelector(`.me-prev-btn`),
      nextBtn: w.querySelector(`.me-next-btn`),
      slider: w.querySelector(`.me-slider`),
      currTime: w.querySelector(`.me-curr-time`),
      durTime: w.querySelector(`.me-dur-time`),
      lyricBox: w.querySelector(`.me-lyrics-box`),
      shareBtn: w.querySelector(`.me-share-btn`),
      cardClickable:
        w.classList.contains("me-card-track") ||
        w.classList.contains("me-card-lyrics")
          ? w
          : null,
      storyPlayIcon: w.querySelector(`.me-story-play-indicator i`),
      bigLyricContainer: w.querySelector(`.me-story-big-lyric-container`),
    };
  }

  /**
   * Attaches all event listeners for playback, interactions, and keyboard shortcuts.
   */
  attachEvents() {
    const { audio, dom, config } = this;
    if (!config.src) return;

    // Toggle Play/Pause UI & Audio
    const togglePlayPause = () => {
      if (audio.paused) {
        audio
          .play()
          .catch((e) => console.warn("[MusicEmbed] Failed to play:", e));
        if (dom.playBtn)
          dom.playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        if (dom.storyPlayIcon)
          dom.storyPlayIcon.className = "fa-solid fa-pause";
      } else {
        audio.pause();
        if (dom.playBtn)
          dom.playBtn.innerHTML =
            '<i class="fa-solid fa-play" style="margin-left:4px;"></i>';
        if (dom.storyPlayIcon) dom.storyPlayIcon.className = "fa-solid fa-play";
      }
    };

    // UI Slider Handler (YouTube Style Gradient)
    const updateSliderGradient = () => {
      if (dom.slider && audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        const fillColor = config.mode === "light" ? "#0f172a" : "#ffffff";
        const emptyColor = "rgba(255, 255, 255, 0.2)";
        dom.slider.style.backgroundImage = `linear-gradient(to right, ${fillColor} ${percentage}%, ${emptyColor} ${percentage}%)`;
      }
    };

    // Keyboard Shortcut: Spacebar to Play/Pause
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === " ") {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          togglePlayPause();
        }
      }
    });

    // Click Events
    if (dom.cardClickable)
      dom.cardClickable.addEventListener("click", togglePlayPause);
    if (dom.playBtn) dom.playBtn.addEventListener("click", togglePlayPause);

    // Audio Events
    audio.addEventListener("loadedmetadata", () => {
      if (dom.slider) dom.slider.max = audio.duration;
      if (dom.durTime)
        dom.durTime.textContent = this.formatTime(audio.duration);
      updateSliderGradient();
    });

    audio.addEventListener("timeupdate", () => {
      if (
        dom.slider &&
        (!dom.slider.matches(":active") || config.disableScrubbing)
      ) {
        dom.slider.value = audio.currentTime;
        updateSliderGradient();
      }
      if (dom.currTime)
        dom.currTime.textContent = this.formatTime(audio.currentTime);

      // Lyrics Synchronization Engine
      if (config.lyrics && this.lyricsData.length > 0) {
        let newIndex = -1;
        for (let i = 0; i < this.lyricsData.length; i++) {
          if (audio.currentTime >= this.lyricsData[i].time) newIndex = i;
          else break;
        }

        if (newIndex !== this.activeLyricIndex) {
          this.activeLyricIndex = newIndex;
          const updateActiveLyric = (container) => {
            if (!container) return;
            const oldEl = container.querySelector(".active");
            if (oldEl) oldEl.classList.remove("active");

            if (newIndex !== -1) {
              const newEl = container.querySelector(
                `[data-index="${newIndex}"]`,
              );
              if (newEl) {
                newEl.classList.add("active");
                if (config.autoScrollLyrics) {
                  container.scrollTop =
                    newEl.offsetTop - container.clientHeight / 2 + 20;
                }
              }
            }
          };

          updateActiveLyric(dom.lyricBox);
          updateActiveLyric(dom.bigLyricContainer);
        }
      }
    });

    audio.addEventListener("ended", () => {
      if (dom.playBtn)
        dom.playBtn.innerHTML =
          '<i class="fa-solid fa-play" style="margin-left:4px;"></i>';
      if (dom.storyPlayIcon) dom.storyPlayIcon.className = "fa-solid fa-play";
      if (dom.slider) {
        dom.slider.value = 0;
        updateSliderGradient();
      }

      if (dom.lyricBox) dom.lyricBox.scrollTop = 0;
      if (dom.bigLyricContainer) dom.bigLyricContainer.scrollTop = 0;

      if (dom.lyricBox)
        dom.lyricBox.querySelector(".active")?.classList.remove("active");
      if (dom.bigLyricContainer)
        dom.bigLyricContainer
          .querySelector(".active")
          ?.classList.remove("active");

      this.activeLyricIndex = -1;
    });

    // Skip Controls
    if (dom.prevBtn)
      dom.prevBtn.addEventListener("click", () => {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
        updateSliderGradient();
      });
    if (dom.nextBtn)
      dom.nextBtn.addEventListener("click", () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        updateSliderGradient();
      });

    // Manual Scrubbing
    if (!config.disableScrubbing && dom.slider) {
      dom.slider.addEventListener("input", (e) => {
        audio.currentTime = e.target.value;
        updateSliderGradient();
      });
    }

    // Web Share API
    if (dom.shareBtn) {
      dom.shareBtn.addEventListener("click", async () => {
        try {
          if (navigator.share)
            await navigator.share({
              title: config.share.title,
              text: config.share.description,
              url: config.share.url,
            });
          else {
            navigator.clipboard.writeText(config.share.url);
            alert("Link copied to clipboard!");
          }
        } catch (err) {}
      });
    }
  }
}
