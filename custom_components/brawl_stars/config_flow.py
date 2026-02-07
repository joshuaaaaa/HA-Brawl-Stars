"""Config flow for Brawl Stars integration."""
from __future__ import annotations

import logging
import re

import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import API_BASE_URL, CONF_API_KEY, CONF_PLAYER_TAG, DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_API_KEY): str,
        vol.Required(CONF_PLAYER_TAG): str,
    }
)


def _normalize_tag(tag: str) -> str:
    """Normalize player tag - ensure it starts with #."""
    tag = tag.strip().upper()
    if not tag.startswith("#"):
        tag = f"#{tag}"
    return tag


def _validate_tag(tag: str) -> bool:
    """Validate player tag format."""
    return bool(re.match(r"^#[0-9A-Z]{3,15}$", tag))


async def _test_api_connection(api_key: str, player_tag: str) -> str | None:
    """Test API connection and return error key or None if successful."""
    tag = player_tag
    if tag.startswith("#"):
        tag = tag[1:]
    encoded_tag = f"%23{tag}"
    url = f"{API_BASE_URL}/players/{encoded_tag}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    try:
        session = aiohttp.ClientSession()
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 403:
                    return "invalid_auth"
                if response.status == 404:
                    return "invalid_tag"
                if response.status != 200:
                    return "cannot_connect"
        finally:
            await session.close()
    except aiohttp.ClientError:
        return "cannot_connect"

    return None


class BrawlStarsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Brawl Stars."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            player_tag = _normalize_tag(user_input[CONF_PLAYER_TAG])

            if not _validate_tag(player_tag):
                errors["base"] = "invalid_tag"
            else:
                # Check if already configured
                await self.async_set_unique_id(player_tag)
                self._abort_if_unique_id_configured()

                # Test API connection
                error = await _test_api_connection(
                    user_input[CONF_API_KEY], player_tag
                )
                if error:
                    errors["base"] = error
                else:
                    return self.async_create_entry(
                        title=f"Brawl Stars ({player_tag})",
                        data={
                            CONF_API_KEY: user_input[CONF_API_KEY],
                            CONF_PLAYER_TAG: player_tag,
                        },
                    )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )
