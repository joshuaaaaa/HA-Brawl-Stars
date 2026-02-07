/**
 * Brawl Stars Card for Home Assistant
 * Custom Lovelace card displaying Brawl Stars player stats
 */

class BrawlStarsCard extends HTMLElement {
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
      throw new Error("You need to define an entity (the profile sensor)");
    }
    this._config = config;
    this._updateCard();
  }

  getCardSize() {
    return 5;
  }

  _updateCard() {
    if (!this._config || !this._hass) return;

    const entity = this._hass.states[this._config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card header="Brawl Stars">
          <div style="padding: 16px; color: var(--error-color);">
            Entity not found: ${this._config.entity}
          </div>
        </ha-card>
      `;
      return;
    }

    const attrs = entity.attributes;
    const name = attrs.name || "Unknown";
    const tag = attrs.tag || "";
    const trophies = attrs.trophies || 0;
    const highestTrophies = attrs.highest_trophies || 0;
    const expLevel = attrs.exp_level || 0;
    const victories3v3 = attrs["3v3_victories"] || 0;
    const soloVictories = attrs.solo_victories || 0;
    const duoVictories = attrs.duo_victories || 0;
    const clubName = attrs.club_name || "No Club";
    const brawlerCount = attrs.brawler_count || 0;
    const totalVictories = attrs.total_victories || 0;
    const topBrawlers = attrs.top_brawlers || [];

    const showTopBrawlers = this._config.show_top_brawlers !== false;
    const title = this._config.title || name;

    let topBrawlersHtml = "";
    if (showTopBrawlers && topBrawlers.length > 0) {
      const brawlerItems = topBrawlers
        .map(
          (b) => `
        <div class="brawler-item">
          <div class="brawler-name">${b.name}</div>
          <div class="brawler-details">
            <span class="brawler-power">P${b.power}</span>
            <span class="brawler-rank">R${b.rank}</span>
            <span class="brawler-trophies">🏆 ${b.trophies}</span>
          </div>
        </div>
      `
        )
        .join("");

      topBrawlersHtml = `
        <div class="section-title">Top Brawlers</div>
        <div class="brawlers-list">${brawlerItems}</div>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --bs-yellow: #f7d94e;
          --bs-blue: #4a90d9;
          --bs-purple: #a855f7;
          --bs-green: #22c55e;
          --bs-red: #ef4444;
        }
        ha-card {
          padding: 0;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .header-right {
          text-align: right;
          flex-shrink: 0;
          margin-left: 16px;
        }
        .player-name {
          font-size: 1.4em;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .player-tag {
          font-size: 0.8em;
          opacity: 0.7;
        }
        .club-name {
          font-size: 0.85em;
          margin-top: 2px;
          color: var(--bs-blue);
        }
        .trophy-section {
          font-size: 1.6em;
          font-weight: bold;
          color: var(--bs-yellow);
          line-height: 1.2;
        }
        .trophy-highest {
          font-size: 0.75em;
          opacity: 0.6;
          color: white;
          font-weight: normal;
        }
        .level-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 0.8em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--divider-color, #333);
          margin: 0;
        }
        .stat-item {
          background: var(--card-background-color, #1e1e1e);
          padding: 12px 8px;
          text-align: center;
        }
        .stat-value {
          font-size: 1.2em;
          font-weight: bold;
          color: var(--primary-text-color, #fff);
        }
        .stat-label {
          font-size: 0.7em;
          color: var(--secondary-text-color, #aaa);
          text-transform: uppercase;
          margin-top: 4px;
        }
        .section-title {
          padding: 12px 16px 4px;
          font-size: 0.85em;
          font-weight: bold;
          text-transform: uppercase;
          color: var(--secondary-text-color, #aaa);
        }
        .brawlers-list {
          padding: 4px 16px 16px;
        }
        .brawler-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--divider-color, #333);
        }
        .brawler-item:last-child {
          border-bottom: none;
        }
        .brawler-name {
          font-weight: 600;
          color: var(--primary-text-color, #fff);
        }
        .brawler-details {
          display: flex;
          gap: 10px;
          font-size: 0.85em;
        }
        .brawler-power {
          color: var(--bs-green);
          font-weight: 600;
        }
        .brawler-rank {
          color: var(--bs-purple);
          font-weight: 600;
        }
        .brawler-trophies {
          color: var(--bs-yellow);
          font-weight: 600;
        }
      </style>

      <ha-card>
        <div class="header">
          <div class="header-left">
            <div class="player-name">${title}</div>
            <div class="player-tag">${tag}</div>
            <div class="club-name">🛡️ ${clubName}</div>
          </div>
          <div class="header-right">
            <div class="trophy-section">🏆 ${trophies.toLocaleString()}</div>
            <div class="trophy-highest">Best: ${highestTrophies.toLocaleString()}</div>
            <div class="level-badge">⭐ Level ${expLevel}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${victories3v3.toLocaleString()}</div>
            <div class="stat-label">3v3 Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${soloVictories.toLocaleString()}</div>
            <div class="stat-label">Solo Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${duoVictories.toLocaleString()}</div>
            <div class="stat-label">Duo Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalVictories.toLocaleString()}</div>
            <div class="stat-label">Total Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${brawlerCount}</div>
            <div class="stat-label">Brawlers</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${expLevel}</div>
            <div class="stat-label">Level</div>
          </div>
        </div>

        ${topBrawlersHtml}
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement("brawl-stars-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      show_top_brawlers: true,
    };
  }
}

class BrawlStarsCardEditor extends HTMLElement {
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
        .editor {
          padding: 16px;
        }
        .row {
          margin-bottom: 12px;
        }
        label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 4px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #000);
          box-sizing: border-box;
        }
      </style>
      <div class="editor">
        <div class="row">
          <label>Entity (Profile sensor)</label>
          <input
            type="text"
            id="entity"
            value="${this._config.entity || ""}"
          />
        </div>
        <div class="row">
          <label>Title (optional)</label>
          <input
            type="text"
            id="title"
            value="${this._config.title || ""}"
            placeholder="Player name"
          />
        </div>
        <div class="row">
          <label>
            <input
              type="checkbox"
              id="show_top_brawlers"
              ${this._config.show_top_brawlers !== false ? "checked" : ""}
            />
            Show Top Brawlers
          </label>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById("entity").addEventListener("change", (e) => {
      this._updateConfig("entity", e.target.value);
    });
    this.shadowRoot.getElementById("title").addEventListener("change", (e) => {
      this._updateConfig("title", e.target.value);
    });
    this.shadowRoot
      .getElementById("show_top_brawlers")
      .addEventListener("change", (e) => {
        this._updateConfig("show_top_brawlers", e.target.checked);
      });
  }

  _updateConfig(key, value) {
    const newConfig = { ...this._config, [key]: value };
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("brawl-stars-card", BrawlStarsCard);
customElements.define("brawl-stars-card-editor", BrawlStarsCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "brawl-stars-card",
  name: "Brawl Stars Card",
  description: "A card displaying Brawl Stars player statistics",
  preview: true,
  documentationURL: "https://github.com/joshuaaaaa/HA-Brawl-Stars",
});
