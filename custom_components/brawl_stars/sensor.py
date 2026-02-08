"""Sensor platform for Brawl Stars integration."""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import BrawlStarsDataCoordinator

SENSOR_TYPES: list[dict] = [
    {
        "key": "trophies",
        "name": "Trophies",
        "icon": "mdi:trophy",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "highest_trophies",
        "name": "Highest Trophies",
        "icon": "mdi:trophy-award",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "exp_level",
        "name": "Experience Level",
        "icon": "mdi:star-circle",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "3v3_victories",
        "name": "3v3 Victories",
        "icon": "mdi:sword-cross",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "solo_victories",
        "name": "Solo Victories",
        "icon": "mdi:account",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "duo_victories",
        "name": "Duo Victories",
        "icon": "mdi:account-multiple",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "brawler_count",
        "name": "Brawlers Unlocked",
        "icon": "mdi:account-group",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
    {
        "key": "total_victories",
        "name": "Total Victories",
        "icon": "mdi:medal",
        "unit": None,
        "state_class": SensorStateClass.TOTAL,
    },
]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Brawl Stars sensors from a config entry."""
    coordinator: BrawlStarsDataCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = []
    for sensor_type in SENSOR_TYPES:
        entities.append(BrawlStarsSensor(coordinator, entry, sensor_type))

    # Add the main profile sensor with all attributes
    entities.append(BrawlStarsProfileSensor(coordinator, entry))

    # Add event rotation sensor
    entities.append(BrawlStarsEventRotationSensor(coordinator, entry))

    async_add_entities(entities)


class BrawlStarsSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Brawl Stars sensor."""

    def __init__(
        self,
        coordinator: BrawlStarsDataCoordinator,
        entry: ConfigEntry,
        sensor_type: dict,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._sensor_type = sensor_type
        self._attr_unique_id = f"{entry.entry_id}_{sensor_type['key']}"
        self._attr_icon = sensor_type["icon"]
        self._attr_native_unit_of_measurement = sensor_type["unit"]
        self._attr_state_class = sensor_type["state_class"]

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        player_name = "Brawl Stars"
        if self.coordinator.data:
            player_name = self.coordinator.data.get("name", "Brawl Stars")
        return f"{player_name} {self._sensor_type['name']}"

    @property
    def native_value(self):
        """Return the state of the sensor."""
        if self.coordinator.data:
            return self.coordinator.data.get(self._sensor_type["key"])
        return None


class BrawlStarsProfileSensor(CoordinatorEntity, SensorEntity):
    """Sensor that holds the full player profile as attributes."""

    def __init__(
        self,
        coordinator: BrawlStarsDataCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the profile sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_profile"
        self._attr_icon = "mdi:gamepad-variant"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        if self.coordinator.data:
            return f"{self.coordinator.data.get('name', 'Brawl Stars')} Profile"
        return "Brawl Stars Profile"

    @property
    def native_value(self):
        """Return current trophies as the main state."""
        if self.coordinator.data:
            return self.coordinator.data.get("trophies")
        return None

    @property
    def extra_state_attributes(self) -> dict:
        """Return all player data as attributes."""
        if self.coordinator.data:
            return self.coordinator.data
        return {}


class BrawlStarsEventRotationSensor(CoordinatorEntity, SensorEntity):
    """Sensor showing current event rotation."""

    def __init__(
        self,
        coordinator: BrawlStarsDataCoordinator,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the event rotation sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_event_rotation"
        self._attr_icon = "mdi:calendar-star"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        player_name = "Brawl Stars"
        if self.coordinator.data:
            player_name = self.coordinator.data.get("name", "Brawl Stars")
        return f"{player_name} Event Rotation"

    @property
    def native_value(self):
        """Return the number of active events."""
        if self.coordinator.data:
            events = self.coordinator.data.get("events", [])
            return len(events)
        return 0

    @property
    def extra_state_attributes(self) -> dict:
        """Return event rotation data as attributes."""
        if self.coordinator.data:
            events = self.coordinator.data.get("events", [])
            return {"events": events}
        return {"events": []}
