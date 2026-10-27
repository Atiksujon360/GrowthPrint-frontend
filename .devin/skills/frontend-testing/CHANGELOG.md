# Changelog

All notable changes to the Frontend Testing Skill will be documented in this file.

## [1.5.0] - 2026-10-19

### Changed
- Aligned every manifest, `VERSION` and `SKILL.md` on 1.5.0, set the author to Yoni Goldberg (Practica.js), and stated the rule count as 55.

## [1.4.0] - 2026-06-03

### Removed
- Deleted the stale `skills/frontend-testing/config.toml` and `secrets.example.toml` left over from the pre-1.2.0 layout. The live templates are `testskill.config-example.toml` and `testskill.secrets-example.toml` at the plugin root; no skill file references the old paths.

### Changed
- Aligned the distribution version across `VERSION`, `plugin.json`, and the marketplace manifest (previously drifted at 1.3.0 / 1.3.0 / 1.2.0).

## [1.2.0] - 2026-06-02

### Changed
- Restructured the skill folder to align with the agentskills.io spec: root now holds only `SKILL.md`, `config.toml`, secrets, and `CHANGELOG.md`.
- Moved `patterns-and-practices/` → `references/rules/`.
- Moved supporting docs (`test-workflow.md`, `test-commands.md`, `testing-strategy-and-tooling.md`, `tools-and-agents.md`, `skill-ux-and-behaviour.md`, `How the Skill Works.md`) into `references/`.
- Moved shared assets (`report-template.html`, `the-testing-skill.png`) into a top-level `assets/` folder.
- Updated all internal links and every inbound reference from `agents/` and `commands/` to the new paths.

### Removed
- Deleted `maintenance-ideas.md` (maintainer scratch notes, not part of the shipped skill).

### Fixed
- Repointed the verifier's broken `test-verification.md` link in `tools-and-agents.md` to `test-workflow.md`.
- Removed references to the non-existent `testing-best-practices.md` file from the `setup-playwright` and `setup-vite` commands.

## [1.1.0] - 2026-02-05

### Added
- Plugin/marketplace distribution support
- VERSION tracking file
- Install and update scripts
- CHANGELOG.md for tracking changes

### Changed
- Reorganized skill structure for plugin distribution

## [1.0.0] - Initial Release

### Added
- 5 specialized agents (planner, page-analyzer, verifier, healer, locator-fixer)
- 5 slash commands for test workflow
- 9 patterns and practices documentation files
- config.toml for project configuration
- Double Gate workflow methodology
