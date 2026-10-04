# Shortcuts for running and testing Taysir locally. Everything here calls the npm scripts in
# package.json, so `make` and `npm run` always do the same thing. Run `make` to list the targets.

# Where the servers listen. Override on the command line, for example `make dev PORT=3000`.
# `HOST=0.0.0.0` makes a server reachable from a phone on the same network, but note that a
# service worker only runs on localhost or HTTPS, so offline and update behaviour cannot be
# tried that way.
PORT ?= 5173
PREVIEW_PORT ?= 4173
HOST ?= localhost
# What opens a tunnel to the preview server. Cloudflare's quick tunnel needs no account
# (`brew install cloudflared`). Any tool that forwards an HTTPS address to a local port will do:
# set TUNNEL to its command, for example to one that gives a fixed address.
TUNNEL ?= cloudflared tunnel --url http://localhost:$(PREVIEW_PORT)

.DEFAULT_GOAL := help
# `ci` runs its steps in order and they share .svelte-kit, so never run targets in parallel.
.NOTPARALLEL:
.PHONY: help install dev preview tunnel tunnel-check build test test-watch e2e e2e-install check lint format data data-check ci clean distclean

help: ## List the targets
	@awk -F ':.*## ' '/^[a-zA-Z_-]+:.*## / { printf "  make %-11s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Installs again only when the dependency list has changed.
node_modules: package.json package-lock.json
	npm install
	@touch node_modules

install: node_modules ## Install dependencies

dev: node_modules ## Dev server with hot reload (http://localhost:5173)
	npm run dev -- --host $(HOST) --port $(PORT) --strictPort

preview: node_modules build ## Build, then serve the production build with its service worker (http://localhost:4173)
	npm run preview -- --host $(HOST) --port $(PREVIEW_PORT) --strictPort

# Checked before the build, so a missing tool costs no wait.
tunnel-check:
	@command -v $(firstword $(TUNNEL)) >/dev/null || { \
		echo "$(firstword $(TUNNEL)) is not installed. For the default tunnel, run: brew install cloudflared"; \
		exit 1; }

# Serves the fresh build and opens a tunnel to it, because a phone cannot use the service worker (so
# cannot try offline use or the update prompt) over plain http on the local network: it needs https.
# The tunnel's address changes each time, and a phone's saved progress belongs to one address.
tunnel: node_modules tunnel-check build ## Serve the build at a temporary https address, to try it on a phone
	@./node_modules/.bin/vite preview --host localhost --port $(PREVIEW_PORT) --strictPort & server=$$!; \
	trap 'kill $$server 2>/dev/null' EXIT INT TERM; \
	for i in $$(seq 1 50); do curl -sf -o /dev/null http://localhost:$(PREVIEW_PORT)/ && break; sleep 0.2; done; \
	echo "Serving the build. Open the https address below on your phone. Press Ctrl-C to stop."; \
	$(TUNNEL)

build: node_modules ## Static build into build/
	npm run build

test: node_modules ## Run the unit tests once
	npm test

test-watch: node_modules ## Run the unit tests again on every change
	npm run test:unit

# Builds the app and serves the build itself. Add E2E_CHANNEL=chrome to use the Chrome you already
# have instead of the downloaded Chromium. A failed run leaves a report: npx playwright show-report.
e2e: node_modules ## Browser tests: build, serve the build, drive it with Playwright
	npm run e2e

e2e-install: node_modules ## Download the Chromium the browser tests use (needed once)
	npm run e2e:install

check: node_modules ## Type-check Svelte and TypeScript
	npm run check

lint: node_modules ## Prettier and ESLint, without changing files
	npm run lint

format: node_modules ## Format every file with Prettier
	npm run format

data: node_modules ## Rebuild the Quran data in src/lib/data/generated
	npm run data:build

# The generated data is committed, so it must match what the build script produces.
data-check: data ## Fail if the generated data is not what the build script produces
	git diff --exit-code -- src/lib/data/generated

ci: node_modules data-check check lint test build e2e ## Everything the CI workflow runs, in the same order
	@echo "All CI steps passed."

clean: ## Remove build output (build/ and .svelte-kit/)
	rm -rf build .svelte-kit

distclean: clean ## Also remove node_modules
	rm -rf node_modules
