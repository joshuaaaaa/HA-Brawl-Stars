/**
 * Brawl Stars Event Rotation Card for Home Assistant
 * Custom Lovelace card displaying current Brawl Stars event rotation
 */

const MODE_INFO = {
  gemGrab: { name: "Gem Grab", icon: "💎", color: "#9b59b6" },
  brawlBall: { name: "Brawl Ball", icon: "⚽", color: "#3498db" },
  bounty: { name: "Bounty", icon: "⭐", color: "#2ecc71" },
  heist: { name: "Heist", icon: "🔓", color: "#e74c3c" },
  siege: { name: "Siege", icon: "🏰", color: "#e67e22" },
  hotZone: { name: "Hot Zone", icon: "🔥", color: "#e74c3c" },
  knockout: { name: "Knockout", icon: "💀", color: "#f39c12" },
  soloShowdown: { name: "Solo Showdown", icon: "👤", color: "#1abc9c" },
  duoShowdown: { name: "Duo Showdown", icon: "👥", color: "#16a085" },
  wipeout: { name: "Wipeout", icon: "💥", color: "#c0392b" },
  payload: { name: "Payload", icon: "📦", color: "#8e44ad" },
  paintBrawl: { name: "Paint Brawl", icon: "🎨", color: "#e91e63" },
  brawlBall5V5: { name: "Brawl Ball 5v5", icon: "⚽", color: "#2196f3" },
  wipeout5V5: { name: "Wipeout 5v5", icon: "💥", color: "#f44336" },
  knockout5V5: { name: "Knockout 5v5", icon: "💀", color: "#ff9800" },
  gemGrab5V5: { name: "Gem Grab 5v5", icon: "💎", color: "#9c27b0" },
  trophyThieves: { name: "Trophy Thieves", icon: "🏆", color: "#ff5722" },
  hunters: { name: "Hunters", icon: "🎯", color: "#795548" },
  lastStand: { name: "Last Stand", icon: "🛡️", color: "#607d8b" },
  holdTheTrophy: { name: "Hold The Trophy", icon: "🏆", color: "#ffc107" },
  botDrop: { name: "Bot Drop", icon: "🤖", color: "#00bcd4" },
  snowtelThieves: { name: "Snowtel Thieves", icon: "❄️", color: "#03a9f4" },
};

function getModeInfo(mode) {
  return MODE_INFO[mode] || { name: mode, icon: "🎮", color: "#95a5a6" };
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  // Format: "20250208T080000.000Z"
  const y = timeStr.substring(0, 4);
  const m = timeStr.substring(4, 6);
  const d = timeStr.substring(6, 8);
  const h = timeStr.substring(9, 11);
  const min = timeStr.substring(11, 13);
  return `${d}.${m}. ${h}:${min}`;
}

class BrawlStarsEventsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this._updateCard();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity (the event rotation sensor)");
    }
    this._config = config;
    this._updateCard();
  }

  getCardSize() {
    return 4;
  }

  _updateCard() {
    if (!this._config || !this._hass) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card header="Brawl Stars Events">
          <div style="padding: 16px; color: var(--error-color);">
            Entity not found: ${this._config.entity}
          </div>
        </ha-card>
      `;
      return;
    }

    const events = entity.attributes.events || [];
    const title = this._config.title || "Event Rotation";

    const eventItems = events
      .map((ev) => {
        const info = getModeInfo(ev.mode);
        return `
          <div class="event-item">
            <div class="event-mode-bar" style="background: ${info.color};"></div>
            <div class="event-content">
              <div class="event-top">
                <span class="event-icon">${info.icon}</span>
                <span class="event-mode">${info.name}</span>
              </div>
              <div class="event-map">${ev.map}</div>
              <div class="event-time">${formatTime(ev.end_time)}</div>
            </div>
          </div>
        `;
      })
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 0;
          overflow: hidden;
        }
        .card-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 12px 20px;
          color: white;
          font-size: 1.1em;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .events-list {
          display: flex;
          flex-direction: column;
        }
        .event-item {
          display: flex;
          align-items: stretch;
          border-bottom: 1px solid var(--divider-color, #333);
        }
        .event-item:last-child {
          border-bottom: none;
        }
        .event-mode-bar {
          width: 4px;
          flex-shrink: 0;
        }
        .event-content {
          padding: 10px 16px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .event-top {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 140px;
        }
        .event-icon {
          font-size: 1.2em;
        }
        .event-mode {
          font-weight: 600;
          font-size: 0.9em;
          color: var(--primary-text-color, #fff);
        }
        .event-map {
          flex: 1;
          font-size: 0.85em;
          color: var(--secondary-text-color, #aaa);
        }
        .event-time {
          font-size: 0.75em;
          color: var(--secondary-text-color, #aaa);
          opacity: 0.7;
          white-space: nowrap;
        }
      </style>

      <ha-card>
        <div class="card-header">🗓️ ${title}</div>
        <div class="events-list">
          ${eventItems || '<div style="padding: 16px; opacity: 0.5;">No events available</div>'}
        </div>
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("brawl-stars-events-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
    };
  }
}

class BrawlStarsEventsCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor { padding: 16px; }
        .row { margin-bottom: 12px; }
        label { display: block; margin-bottom: 4px; font-weight: 500; }
        input {
          width: 100%; padding: 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #000);
          box-sizing: border-box;
        }
      </style>
      <div class="editor">
        <div class="row">
          <label>Entity (Event Rotation sensor)</label>
          <input type="text" id="entity" value="${this._config.entity || ""}" />
        </div>
        <div class="row">
          <label>Title (optional)</label>
          <input type="text" id="title" value="${this._config.title || ""}" placeholder="Event Rotation" />
        </div>
      </div>
    `;
    this.shadowRoot.getElementById("entity").addEventListener("change", (e) => {
      this._updateConfig("entity", e.target.value);
    });
    this.shadowRoot.getElementById("title").addEventListener("change", (e) => {
      this._updateConfig("title", e.target.value);
    });
  }

  _updateConfig(key, value) {
    const event = new CustomEvent("config-changed", {
      detail: { config: { ...this._config, [key]: value } },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("brawl-stars-events-card", BrawlStarsEventsCard);
customElements.define("brawl-stars-events-card-editor", BrawlStarsEventsCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "brawl-stars-events-card",
  name: "Brawl Stars Events Card",
  description: "A card displaying current Brawl Stars event rotation",
  preview: true,
  documentationURL: "https://github.com/joshuaaaaa/HA-Brawl-Stars",
});
