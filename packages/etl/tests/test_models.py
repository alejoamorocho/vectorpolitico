"""Tests de los modelos Pydantic — verifican los constraints del schema."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.models import (
    CompassPosition,
    Entity,
    EvidencedCompassPosition,
    Ideology,
    Party,
    Source,
)


def _valid_compass_position() -> dict:
    return {
        "x": -3.5,
        "y": 2.1,
        "justification": "Justificacion suficientemente larga para pasar el minimo de 20 chars.",
        "sources": [
            {
                "url": "https://example.com/x",
                "outlet": "Example",
                "date": "2024-01-15",
            }
        ],
    }


def _valid_evidenced_position() -> dict:
    return {
        **_valid_compass_position(),
        "confidence": "medium",
        "dimensionScores": {
            "fiscalPolicy": -2,
            "marketPosition": -3,
            "socialPolicy": -4,
            "tradePolicy": -1,
            "civilRights": -3,
            "securityApproach": 0,
            "socialRights": -4,
            "powerConcentration": -1,
        },
    }


class TestCompassPosition:
    def test_valid(self):
        CompassPosition.model_validate(_valid_compass_position())

    def test_x_out_of_range(self):
        data = _valid_compass_position()
        data["x"] = 11
        with pytest.raises(ValidationError):
            CompassPosition.model_validate(data)

    def test_no_sources(self):
        data = _valid_compass_position()
        data["sources"] = []
        with pytest.raises(ValidationError):
            CompassPosition.model_validate(data)


class TestEvidencedPosition:
    def test_valid(self):
        EvidencedCompassPosition.model_validate(_valid_evidenced_position())

    def test_dimension_out_of_range(self):
        data = _valid_evidenced_position()
        data["dimensionScores"]["fiscalPolicy"] = 12
        with pytest.raises(ValidationError):
            EvidencedCompassPosition.model_validate(data)


class TestIdeology:
    def test_valid(self):
        Ideology.model_validate(
            {
                "id": "democratic-socialism",
                "name": "Socialismo Democrático",
                "nameEn": "Democratic Socialism",
                "x": -5,
                "y": -3,
                "width": 2.5,
                "height": 1.8,
                "quadrant": "lib_left",
                "color": "#16a34a",
                "description": "Combina mecanismos democraticos con propiedad social estrategica.",
            }
        )

    def test_invalid_quadrant(self):
        with pytest.raises(ValidationError):
            Ideology.model_validate(
                {
                    "id": "x",
                    "name": "X",
                    "x": 0,
                    "y": 0,
                    "width": 1,
                    "height": 1,
                    "quadrant": "invalid",
                    "color": "#ff0000",
                    "description": "descripcion suficientemente larga para pasar.",
                }
            )

    def test_invalid_color(self):
        with pytest.raises(ValidationError):
            Ideology.model_validate(
                {
                    "id": "x",
                    "name": "X",
                    "x": 0,
                    "y": 0,
                    "width": 1,
                    "height": 1,
                    "quadrant": "lib_right",
                    "color": "not-hex",
                    "description": "descripcion suficientemente larga para pasar.",
                }
            )


class TestEntity:
    def _valid(self) -> dict:
        return {
            "id": "test-figure",
            "country": "co",
            "type": "senator",
            "fullName": "Nombre Completo Apellido",
            "displayName": "Nombre Apellido",
            "party": "test-party",
            "periods": [
                {
                    "role": "senator",
                    "startDate": "2022-07-20",
                }
            ],
            "compassSelfPerceived": _valid_compass_position(),
            "compassEvidenced": _valid_evidenced_position(),
            "ideologies": ["democratic-socialism"],
            "bio": "Biografia neutral y factual suficientemente larga para pasar el minimo de 50 chars.",
            "incoherences": [],
            "lastUpdated": "2026-04-11",
            "contributors": ["test-user"],
        }

    def test_valid(self):
        Entity.model_validate(self._valid())

    def test_period_invalid_order(self):
        data = self._valid()
        data["periods"][0]["endDate"] = "2020-01-01"
        with pytest.raises(ValidationError):
            Entity.model_validate(data)

    def test_no_periods(self):
        data = self._valid()
        data["periods"] = []
        with pytest.raises(ValidationError):
            Entity.model_validate(data)


class TestParty:
    def test_valid(self):
        Party.model_validate(
            {
                "id": "test-party",
                "country": "co",
                "name": "Test Party",
                "fullName": "Test Party Complete",
                "color": "#123456",
                "description": "Descripcion suficientemente larga para pasar validacion.",
                "ideologies": ["social-democracy"],
                "lastUpdated": "2026-04-11",
                "contributors": ["test"],
            }
        )
