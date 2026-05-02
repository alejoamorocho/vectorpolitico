.PHONY: install lint test validate generate-ideologies fetch-news fetch-votes sync-staging sync-prod clean

PY := python
VENV := .venv

ifeq ($(OS),Windows_NT)
  PY_BIN := $(VENV)/Scripts/python.exe
  PIP_BIN := $(VENV)/Scripts/pip.exe
else
  PY_BIN := $(VENV)/bin/python
  PIP_BIN := $(VENV)/bin/pip
endif

install:  ## Crea venv e instala dependencias
	$(PY) -m venv $(VENV)
	$(PIP_BIN) install --upgrade pip
	$(PIP_BIN) install -r requirements.txt

lint:  ## Corre ruff sobre src/
	$(PY_BIN) -m ruff check src/

test:  ## Corre pytest
	$(PY_BIN) -m pytest tests/ -v

validate:  ## Valida todos los JSON en packages/data/
	$(PY_BIN) -m src.validate ../data/colombia ../data/ideologies.json

generate-ideologies:  ## Regenera ideologies.json desde el YAML
	$(PY_BIN) -m src.generate_ideologies

fetch-news:  ## Descarga noticias de GDELT para figuras en data/
	$(PY_BIN) -m src.fetch_news --country co

fetch-votes:  ## Descarga votaciones de CongresoVisible
	$(PY_BIN) -m src.fetch_votes --period 2022-2026

sync-staging:  ## Sincroniza JSONs validados a D1 staging
	$(PY_BIN) -m src.sync_to_d1 --env staging --dir ../data/colombia

sync-prod:  ## Sincroniza JSONs validados a D1 production (requiere confirmación)
	@echo "⚠️  ESTO MODIFICARÁ LA BASE DE DATOS DE PRODUCCIÓN"
	@read -p "¿Estás seguro? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(PY_BIN) -m src.sync_to_d1 --env production --dir ../data/colombia

clean:  ## Limpia caches y bytecode
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true

help:  ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'
