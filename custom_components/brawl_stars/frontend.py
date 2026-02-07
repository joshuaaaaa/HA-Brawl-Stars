"""Frontend registration for the Brawl Stars custom card."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
)
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

CARD_URL = "/brawl_stars/brawl-stars-card.js"


async def async_register_card(hass: HomeAssistant) -> None:
    """Register the Brawl Stars card as a Lovelace resource."""
    # Register the local path for serving the JS file
    hass.http.register_static_path(
        CARD_URL,
        str(Path(__file__).parent / "www" / "brawl-stars-card.js"),
        cache_headers=False,
    )
    _LOGGER.debug("Registered Brawl Stars card at %s", CARD_URL)

    # Try to add as a Lovelace resource automatically
    try:
        resources: ResourceStorageCollection = hass.data["lovelace"]["resources"]
        # Check if already registered
        for resource in resources.async_items():
            if resource.get("url", "").endswith("brawl-stars-card.js"):
                _LOGGER.debug("Brawl Stars card resource already registered")
                return

        await resources.async_create_item(
            {"res_type": "module", "url": CARD_URL}
        )
        _LOGGER.info("Brawl Stars card resource registered automatically")
    except Exception:
        _LOGGER.warning(
            "Could not auto-register Lovelace resource. "
            "Please add '%s' as a Lovelace resource manually (type: module)",
            CARD_URL,
        )
