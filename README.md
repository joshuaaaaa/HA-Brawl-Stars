# Brawl Stars Integration for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

> **[Dokumentace v cestine / Czech README](README.cs.md)**

Custom Home Assistant integration that connects to the [Brawl Stars API](https://developer.brawlstars.com/) and provides player statistics as sensors, along with a custom Lovelace dashboard card.

<img width="398" height="505" alt="image" src="https://github.com/user-attachments/assets/12f1f45c-e368-4b67-8cfe-649639dbdd8e" />


## Features

- **Player Stats Sensors**: Trophies, highest trophies, experience level, victories (3v3, solo, duo), brawler count
- **Profile Sensor**: Complete player profile with all data as attributes
- **Custom Lovelace Card**: Dashboard card showing player stats and top brawlers
- **Event Rotation Card**: Separate card showing current active events/maps
- **Auto-updating**: Data refreshes every 5 minutes
- **Multi-player support**: Add multiple players, each with their own sensors and card
- **Czech & English translations**: Full UI support in both languages

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the three dots in the top right corner
3. Select **Custom repositories**
4. Add this repository URL: `https://github.com/joshuaaaaa/HA-Brawl-Stars`
5. Select category: **Integration**
6. Click **Add**
7. Search for "Brawl Stars" and install
8. Restart Home Assistant

### Manual Installation

1. Copy the `custom_components/brawl_stars` folder to your Home Assistant `custom_components` directory
2. Restart Home Assistant

## Configuration

1. Get an API key from [developer.brawlstars.com](https://developer.brawlstars.com/)
   - Create an account
   - Create a new API key (whitelist your Home Assistant server's IP address)
2. In Home Assistant, go to **Settings > Devices & Services > Add Integration**
3. Search for **Brawl Stars**
4. Enter your API key and player tag (e.g. `#2ABC123`)

## Lovelace Card

### Card Setup (manual step required)

Home Assistant cannot automatically register custom JS cards from an integration. After installation you need to:

1. **Copy the card files** from the integration to the `www` folder in your HA config:
   ```
   custom_components/brawl_stars/www/brawl-stars-card.js        → config/www/brawl-stars-card.js
   custom_components/brawl_stars/www/brawl-stars-events-card.js  → config/www/brawl-stars-events-card.js
   ```
2. **Add Lovelace resources** in Home Assistant:
   - Go to **Settings > Dashboards > three dots top right > Resources**
   - Click **Add Resource** and add both:
     - URL: `/local/brawl-stars-card.js` — Type: **JavaScript Module**
     - URL: `/local/brawl-stars-events-card.js` — Type: **JavaScript Module**
3. **Clear your browser cache** (Ctrl+F5) and refresh the page

### Adding the Card

#### Visual Editor
1. Edit your dashboard
2. Click **Add Card**
3. Choose **Manual** (at the bottom)
4. Paste the YAML configuration:

```yaml
type: custom:brawl-stars-card
entity: sensor.player_name_profile
show_top_brawlers: true
```

### Card Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Profile sensor entity ID |
| `title` | string | Player name | Custom title for the card |
| `show_top_brawlers` | boolean | `true` | Show top 5 brawlers section |

### Event Rotation Card

Displays current active events with game mode, map name and end time.

```yaml
type: custom:brawl-stars-events-card
entity: sensor.player_name_event_rotation
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Event Rotation sensor entity ID |
| `title` | string | `Event Rotation` | Custom title for the card |

## Sensors

The integration creates the following sensors for each configured player:

| Sensor | Description |
|--------|-------------|
| `Trophies` | Current total trophies |
| `Highest Trophies` | All-time highest trophies |
| `Experience Level` | Player experience level |
| `3v3 Victories` | Total 3v3 mode wins |
| `Solo Victories` | Total solo mode wins |
| `Duo Victories` | Total duo mode wins |
| `Brawlers Unlocked` | Number of unlocked brawlers |
| `Total Victories` | Combined victories across all modes |
| `Profile` | Main profile sensor with all data as attributes |
| `Event Rotation` | Current active events with mode, map and times |

## Disclaimer

This project is not an official Supercell product and is not affiliated with or endorsed by Supercell. "Brawl Stars" is a trademark of Supercell Oy. All game content and materials are the property of their respective owners. This project uses the public [Brawl Stars API](https://developer.brawlstars.com/) in accordance with the [Supercell Fan Content Policy](https://supercell.com/en/fan-content-policy/).

## License

MIT

## http://buymeacoffee.com/jakubhruby


<img width="150" height="150" alt="qr-code" src="https://github.com/user-attachments/assets/2581bf36-7f7d-4745-b792-d1abaca6e57d" />
