"""Frontend registration for the Brawl Stars custom cards."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
)
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

CARD_URL = "/brawl_stars/brawl-stars-card.js"
EVENTS_CARD_URL = "/brawl_stars/brawl-stars-events-card.js"
_CARD_REGISTERED = False


async def async_register_card(hass: HomeAssistant) -> None:
    """Register the Brawl Stars cards as Lovelace resources."""
    global _CARD_REGISTERED
    if _CARD_REGISTERED:
        return
    _CARD_REGISTERED = True

    www_dir = Path(__file__).parent / "www"

    # Register static paths for both cards
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=CARD_URL,
                path=str(www_dir / "brawl-stars-card.js"),
                cache_headers=False,
            ),
            StaticPathConfig(
                url_path=EVENTS_CARD_URL,
                path=str(www_dir / "brawl-stars-events-card.js"),
                cache_headers=False,
            ),
        ]
    )
    _LOGGER.debug("Registered Brawl Stars cards")

    # Try to add as Lovelace resources automatically
    try:
        resources: ResourceStorageCollection = hass.data["lovelace"]["resources"]
        existing_urls = [
            resource.get("url", "") for resource in resources.async_items()
        ]

        for url in [CARD_URL, EVENTS_CARD_URL]:
            if not any(u.endswith(url.split("/")[-1]) for u in existing_urls):
                await resources.async_create_item(
                    {"res_type": "module", "url": url}
                )
                _LOGGER.info("Registered Lovelace resource: %s", url)
    except Exception:
        _LOGGER.warning(
            "Could not auto-register Lovelace resources. "
            "Please add them manually (type: module): %s, %s",
            CARD_URL,
            EVENTS_CARD_URL,
        )
