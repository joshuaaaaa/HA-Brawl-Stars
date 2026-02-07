"""Data update coordinator for Brawl Stars."""
from __future__ import annotations

import logging
from datetime import timedelta

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import API_BASE_URL, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)


class BrawlStarsDataCoordinator(DataUpdateCoordinator):
    """Coordinator to fetch data from Brawl Stars API."""

    def __init__(
        self,
        hass: HomeAssistant,
        api_key: str,
        player_tag: str,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name="Brawl Stars",
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )
        self.api_key = api_key
        self.player_tag = player_tag
        self._session: aiohttp.ClientSession | None = None

    def _get_encoded_tag(self) -> str:
        """Get URL-encoded player tag."""
        tag = self.player_tag
        if tag.startswith("#"):
            tag = tag[1:]
        return f"%23{tag}"

    async def _async_update_data(self) -> dict:
        """Fetch data from Brawl Stars API."""
        encoded_tag = self._get_encoded_tag()
        url = f"{API_BASE_URL}/players/{encoded_tag}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
        }

        try:
            session = aiohttp.ClientSession()
            try:
                async with session.get(url, headers=headers) as response:
                    if response.status == 403:
                        raise UpdateFailed("Invalid API key or IP not whitelisted")
                    if response.status == 404:
                        raise UpdateFailed(f"Player {self.player_tag} not found")
                    if response.status != 200:
                        raise UpdateFailed(
                            f"API returned status {response.status}"
                        )
                    data = await response.json()
            finally:
                await session.close()
        except aiohttp.ClientError as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err

        return self._parse_player_data(data)

    def _parse_player_data(self, data: dict) -> dict:
        """Parse raw API response into structured data."""
        club = data.get("club", {})
        brawlers = data.get("brawlers", [])

        # Sort brawlers by trophies descending
        brawlers_sorted = sorted(
            brawlers, key=lambda b: b.get("trophies", 0), reverse=True
        )

        # Top 5 brawlers for the card
        top_brawlers = []
        for b in brawlers_sorted[:5]:
            top_brawlers.append(
                {
                    "name": b.get("name", "").title(),
                    "trophies": b.get("trophies", 0),
                    "highest_trophies": b.get("highestTrophies", 0),
                    "power": b.get("power", 0),
                    "rank": b.get("rank", 0),
                }
            )

        return {
            "name": data.get("name", "Unknown"),
            "tag": data.get("tag", ""),
            "name_color": data.get("nameColor", ""),
            "icon_id": data.get("icon", {}).get("id", 0),
            "trophies": data.get("trophies", 0),
            "highest_trophies": data.get("highestTrophies", 0),
            "exp_level": data.get("expLevel", 0),
            "exp_points": data.get("expPoints", 0),
            "3v3_victories": data.get("3vs3Victories", 0),
            "solo_victories": data.get("soloVictories", 0),
            "duo_victories": data.get("duoVictories", 0),
            "club_name": club.get("name", "No Club"),
            "club_tag": club.get("tag", ""),
            "brawler_count": len(brawlers),
            "top_brawlers": top_brawlers,
            "total_victories": (
                data.get("3vs3Victories", 0)
                + data.get("soloVictories", 0)
                + data.get("duoVictories", 0)
            ),
        }
