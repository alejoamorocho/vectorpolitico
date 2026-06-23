"""Pydantic models — espejo de packages/schema/src/types.ts.

Estos modelos son la fuente de verdad de validación en Python.
Deben mantenerse sincronizados 1:1 con los tipos TypeScript.

Si cambias un campo en types.ts, debes cambiarlo aquí también.
El CI de `validate-data.yml` correrá estos modelos sobre todos los JSON en
packages/data/** y fallará si hay divergencia.
"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator

# ─── Enums ──────────────────────────────────────────────────────────────────

EntityType = Literal[
    "president",
    "vice_president",
    "presidential_candidate",
    "vp_candidate",
    "senator",
    "representative",
    "governor",
    "mayor",
]

IncoherenceCategory = Literal[
    "economia",
    "seguridad",
    "derechos_humanos",
    "medio_ambiente",
    "corrupcion",
    "relaciones_exteriores",
    "educacion",
    "salud",
]

Severity = Literal["low", "medium", "high"]
Confidence = Literal["low", "medium", "high"]
Quadrant = Literal["auth_left", "auth_right", "lib_left", "lib_right"]


# ─── Helpers ────────────────────────────────────────────────────────────────

Score = float  # validado por Field constraints en cada uso


def _score_field(description: str = "") -> object:
    return Field(..., ge=-10, le=10, description=description)


# ─── Base config ────────────────────────────────────────────────────────────


class StrictModel(BaseModel):
    """Modelo base que rechaza campos extra y normaliza."""

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
        populate_by_name=True,
    )


# ─── Building blocks ────────────────────────────────────────────────────────


class Source(StrictModel):
    url: HttpUrl
    title: str | None = Field(default=None, min_length=3, max_length=300)
    outlet: str = Field(..., min_length=2, max_length=200)
    date: date  # type: ignore[assignment]
    archived: HttpUrl | None = None


class Period(StrictModel):
    role: EntityType
    startDate: date
    endDate: date | None = None
    region: str | None = Field(default=None, min_length=2, max_length=120)
    electedWith: float | None = Field(default=None, ge=0, le=100)

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.endDate and self.endDate < self.startDate:
            raise ValueError("endDate debe ser >= startDate")
        return self


# ─── Compass ────────────────────────────────────────────────────────────────


class DimensionScores(StrictModel):
    # Eje X — Económico
    fiscalPolicy: Score = _score_field("Política fiscal")  # type: ignore[assignment]
    marketPosition: Score = _score_field("Posición frente al mercado")  # type: ignore[assignment]
    socialPolicy: Score = _score_field("Política social")  # type: ignore[assignment]
    tradePolicy: Score = _score_field("Comercio exterior")  # type: ignore[assignment]
    # Eje Y — Social
    civilRights: Score = _score_field("Derechos civiles")  # type: ignore[assignment]
    securityApproach: Score = _score_field("Aproximación a seguridad")  # type: ignore[assignment]
    socialRights: Score = _score_field("Derechos sociales")  # type: ignore[assignment]
    powerConcentration: Score = _score_field("Concentración de poder")  # type: ignore[assignment]


class CompassPosition(StrictModel):
    x: Score = _score_field("Eje económico")  # type: ignore[assignment]
    y: Score = _score_field("Eje social")  # type: ignore[assignment]
    # justification y sources son opcionales en CompassPosition genérica
    # (el compassSelfPerceived puede omitirlas si se derivan de ideologySelf).
    # En EvidencedCompassPosition se recomienda fuertemente incluirlas.
    justification: str | None = Field(default=None, min_length=20, max_length=5000)
    sources: list[Source] | None = Field(default=None, min_length=1)
    # Los partidos pueden traer `confidence` sin dimensionScores (no son entidades individuales).
    # En Entity se usa EvidencedCompassPosition que lo exige y además requiere dimensionScores.
    confidence: Confidence | None = None


class EvidencedCompassPosition(CompassPosition):
    confidence: Confidence
    dimensionScores: DimensionScores


# ─── Incoherencia ───────────────────────────────────────────────────────────


class IncoherenceStatement(StrictModel):
    text: str = Field(..., min_length=10, max_length=2000)
    source: Source

    @field_validator("source")
    @classmethod
    def _archived_required(cls, v: Source) -> Source:
        if v.archived is None:
            raise ValueError("Source.archived es obligatorio en una incoherencia")
        return v


class Incoherence(StrictModel):
    id: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    category: IncoherenceCategory
    severity: Severity
    verified: bool
    verifiedBy: str | None = None
    proposal: IncoherenceStatement
    action: IncoherenceStatement
    nuances: str | None = Field(default=None, max_length=2000)
    addedBy: str = Field(..., min_length=1, max_length=100)
    addedAt: date

    @model_validator(mode="after")
    def _verified_integrity(self):
        if self.verified and not self.verifiedBy:
            raise ValueError("Si verified=true, verifiedBy es obligatorio")
        if self.verified and self.verifiedBy == self.addedBy:
            raise ValueError(
                "Una incoherencia verificada debe ser revisada por alguien distinto al que la agregó"
            )
        return self


# ─── Ideología ──────────────────────────────────────────────────────────────


class ExternalLink(StrictModel):
    title: str = Field(..., min_length=2, max_length=200)
    url: HttpUrl
    outlet: str | None = Field(default=None, min_length=2, max_length=200)


class Ideology(StrictModel):
    id: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    name: str = Field(..., min_length=2, max_length=120)
    nameEn: str | None = Field(default=None, min_length=2, max_length=120)
    x: Score = _score_field()  # type: ignore[assignment]
    y: Score = _score_field()  # type: ignore[assignment]
    width: float = Field(..., gt=0, le=20)
    height: float = Field(..., gt=0, le=20)
    quadrant: Quadrant
    color: str = Field(..., pattern=r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
    description: str = Field(..., min_length=20, max_length=3000)
    longDescription: str | None = Field(default=None, min_length=50, max_length=10000)
    historicalContext: str | None = Field(default=None, min_length=20, max_length=5000)
    contemporaryRelevance: str | None = Field(default=None, min_length=20, max_length=3000)
    commonCriticisms: str | None = Field(default=None, min_length=20, max_length=3000)
    keyThinkers: list[str] | None = None
    historicalExamples: list[str] | None = None
    relatedIdeologies: list[str] | None = None
    wikipediaUrl: HttpUrl | None = None
    externalLinks: list[ExternalLink] | None = None


# ─── Partido ────────────────────────────────────────────────────────────────


class Party(StrictModel):
    id: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    country: str = Field(..., pattern=r"^[a-z]{2}$")
    name: str = Field(..., min_length=2, max_length=120)
    fullName: str = Field(..., min_length=2, max_length=200)
    color: str = Field(..., pattern=r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
    logoUrl: HttpUrl | None = None
    websiteUrl: HttpUrl | None = None
    foundedYear: int | None = Field(default=None, ge=1800, le=2100)
    dissolvedYear: int | None = Field(default=None, ge=1800, le=2100)
    description: str = Field(..., min_length=20, max_length=3000)
    ideologies: list[str]
    compassPosition: CompassPosition | None = None
    sources: list[Source] | None = None
    incoherences: list[Incoherence] = Field(default_factory=list)
    lastUpdated: date
    contributors: list[str]


# ─── Entidad política ───────────────────────────────────────────────────────


class VpFormula(StrictModel):
    """Fórmula vicepresidencial — solo para presidential_candidate."""

    fullName: str = Field(..., min_length=3, max_length=200)
    shortName: str | None = Field(default=None, min_length=2, max_length=120)
    bio: str | None = Field(default=None, min_length=10, max_length=3000)


class IdeologyAssignment(StrictModel):
    """Asignación ideológica con trazabilidad (metodología v2).

    Documenta por qué una persona recibe una ideología concreta, con
    justificación explícita y al menos una fuente verificable.
    """

    ideologyId: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    justification: str = Field(..., min_length=20, max_length=3000)
    sources: list[Source] = Field(..., min_length=1)


class Entity(StrictModel):
    id: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    country: str = Field(..., pattern=r"^[a-z]{2}$")
    type: EntityType
    fullName: str = Field(..., min_length=3, max_length=200)
    displayName: str = Field(..., min_length=2, max_length=120)
    photoUrl: HttpUrl | None = None
    party: str | None = Field(default=None, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    vpFormula: VpFormula | None = None
    periods: list[Period] = Field(..., min_length=1)
    compassSelfPerceived: CompassPosition
    compassEvidenced: EvidencedCompassPosition
    ideologies: list[str]
    ideologySelf: str | None = Field(default=None, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    ideologyEvidenced: str | None = Field(default=None, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    ideologySelfAssignment: IdeologyAssignment | None = None
    ideologyEvidencedAssignment: IdeologyAssignment | None = None
    bio: str = Field(..., min_length=50, max_length=5000)
    incoherences: list[Incoherence]
    lastUpdated: date
    contributors: list[str] = Field(..., min_length=1)

    @model_validator(mode="after")
    def _ideology_assignments_match_legacy(self):
        if self.ideologySelfAssignment and self.ideologySelf:
            if self.ideologySelfAssignment.ideologyId != self.ideologySelf:
                raise ValueError(
                    "ideologySelfAssignment.ideologyId debe coincidir con ideologySelf"
                )
        if self.ideologyEvidencedAssignment and self.ideologyEvidenced:
            if self.ideologyEvidencedAssignment.ideologyId != self.ideologyEvidenced:
                raise ValueError(
                    "ideologyEvidencedAssignment.ideologyId debe coincidir con ideologyEvidenced"
                )
        return self


__all__ = [
    "EntityType",
    "IncoherenceCategory",
    "Severity",
    "Confidence",
    "Quadrant",
    "Source",
    "Period",
    "DimensionScores",
    "CompassPosition",
    "EvidencedCompassPosition",
    "IncoherenceStatement",
    "Incoherence",
    "Ideology",
    "Party",
    "VpFormula",
    "IdeologyAssignment",
    "Entity",
]
