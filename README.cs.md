# Brawl Stars Integrace pro Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Custom integrace pro Home Assistant, která se připojuje k [Brawl Stars API](https://developer.brawlstars.com/) a zobrazuje statistiky hráče jako senzory s vlastní Lovelace kartou na dashboardu.

## Funkce

- **Senzory statistik hráče**: Trofeje, nejvyšší trofeje, level, výhry (3v3, solo, duo), počet brawlerů
- **Profilový senzor**: Kompletní profil hráče se všemi daty jako atributy
- **Custom Lovelace karta**: Karta na dashboard zobrazující statistiky hráče a top brawlery
- **Automatická aktualizace**: Data se obnovují každých 5 minut
- **Čeština a angličtina**: Plná podpora obou jazyků v UI

## Instalace

### HACS (doporučeno)

1. Otevři HACS v Home Assistantovi
2. Klikni na tři tečky vpravo nahoře
3. Vyber **Vlastní repozitáře** (Custom repositories)
4. Přidej URL tohoto repozitáře: `https://github.com/joshuaaaaa/HA-Brawl-Stars`
5. Vyber kategorii: **Integrace**
6. Klikni **Přidat**
7. Vyhledej "Brawl Stars" a nainstaluj
8. Restartuj Home Assistant

### Manuální instalace

1. Zkopíruj složku `custom_components/brawl_stars` do adresáře `custom_components` ve tvém Home Assistantovi
2. Restartuj Home Assistant

## Konfigurace

1. Získej API klíč na [developer.brawlstars.com](https://developer.brawlstars.com/)
   - Vytvoř si účet
   - Vytvoř nový API klíč (přidej IP adresu tvého Home Assistant serveru do whitelistu)
2. V Home Assistantovi jdi do **Nastavení > Zařízení a služby > Přidat integraci**
3. Vyhledej **Brawl Stars**
4. Zadej API klíč a tag hráče (např. `#2ABC123`)

## Lovelace karta

### Nastavení karty (nutný manuální krok)

Home Assistant neumí automaticky registrovat custom JS karty z integrace. Po instalaci je potřeba provést tyto kroky:

1. **Zkopíruj soubor karty** z integrace do složky `www` v Home Assistantovi:
   ```
   Zdrojový soubor: custom_components/brawl_stars/www/brawl-stars-card.js
   Cílová složka:   config/www/brawl-stars-card.js
   ```
2. **Přidej Lovelace resource** v Home Assistantovi:
   - Jdi do **Nastavení > Dashboardy > tři tečky vpravo nahoře > Zdroje** (Resources)
   - Klikni **Přidat zdroj**
   - URL: `/local/brawl-stars-card.js`
   - Typ: **JavaScript modul**
3. **Vymaž cache** prohlížeče (Ctrl+F5) a obnov stránku

### Přidání karty na dashboard

#### Přes vizuální editor
1. Uprav svůj dashboard
2. Klikni **Přidat kartu**
3. Zvol **Manuální** (dole)
4. Vlož YAML konfiguraci:

```yaml
type: custom:brawl-stars-card
entity: sensor.jmeno_hrace_profile
show_top_brawlers: true
```

#### Přímo v YAML dashboardu
```yaml
type: custom:brawl-stars-card
entity: sensor.jmeno_hrace_profile
show_top_brawlers: true
```

### Nastavení karty

| Volba | Typ | Výchozí | Popis |
|-------|-----|---------|-------|
| `entity` | string | **Povinné** | ID entity profilového senzoru |
| `title` | string | Jméno hráče | Vlastní nadpis karty |
| `show_top_brawlers` | boolean | `true` | Zobrazit sekci top 5 brawlerů |

## Senzory

Integrace vytvoří tyto senzory pro každého nakonfigurovaného hráče:

| Senzor | Popis |
|--------|-------|
| `Trophies` | Aktuální celkové trofeje |
| `Highest Trophies` | Nejvyšší dosažené trofeje |
| `Experience Level` | Level hráče |
| `3v3 Victories` | Celkové výhry v 3v3 |
| `Solo Victories` | Celkové výhry v solo |
| `Duo Victories` | Celkové výhry v duo |
| `Brawlers Unlocked` | Počet odemčených brawlerů |
| `Total Victories` | Celkové výhry napříč všemi módy |
| `Profile` | Hlavní profilový senzor se všemi daty jako atributy |

## Disclaimer

Tento projekt není oficiální produkt společnosti Supercell a není s ní nijak spojen ani jí schválen. "Brawl Stars" je ochranná známka Supercell Oy. Veškerý herní obsah a materiály jsou majetkem příslušných vlastníků. Tento projekt využívá veřejné [Brawl Stars API](https://developer.brawlstars.com/) v souladu se [Supercell Fan Content Policy](https://supercell.com/en/fan-content-policy/).

## Licence

MIT
