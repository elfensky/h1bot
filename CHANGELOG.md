# Changelog

All notable changes to this project will be documented in this file. <br>
TAG ORDER: `Added, Changed, Deprecated, Removed, Fixed, Security`

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   added RELEASE.md to use for the automatic release process
-   add dependabot.yml for automatic dependabot pull requests

### Changed

-   updated CHANGELOG.md with the history of the project so far.
-   fix package.json versioning to match the changelog
-

### Security

-   bumped docker/checkout from 3 to 4 - by @dependabot
-   bumped docker/login-action from 2 to 3 - by @dependabot
-   bumped docker/setup-buildx-action from 2 to 3 - by @dependabot
-   bumped docker/build-push-action from 4 to 6 - by @dependabot
-   bumped pino from 7.11.0 to 9.6.0 - by @dependabot

## [0.2.2] - 2024-12-28

### Changed

-   Github Action for automated release has been temporarily disabled

### Removed

-   art for hellbot has been moved to the [helldivers.bot](https://github.com/elfensky/helldivers.bot) repository of the website, and will be kept (updated) there.

### Fixed

-   map.js region order

## [0.2.1] - 2024-12-27

### Added

-   getEvent() now changes the API host based on the environment.
-   defend.js now properly processes event states like "active", "success" and "failure"

### Changed

-   reorganised file names, structure and code to be more future proof
-   prisma now uses "Defend" and "Attack" tables instead of a singular "Event" table
-   prisma: Defend and Attack tables now has a "active" field to indicate if the event has been completed
-   update logic for the defend event updater to
-   defendMessage now containts enemy informato

### Fixed

-   cron now runs every 30 seconds instead of once a minute
-   runMigrations() now returns true if successful
-   sentry fixes
-   logging fixes

## [0.2.0] - 2024-12-26

### Added

-   prisma as the ORM of choise
-   avatar art for hellbot
-   sentry for error tracking
-   pino and chalk for logging and debugging

### Deprecated

-   sequelize is no longer used
-   sqlite is no longer used

## [0.1.0] - 2024-12-17

### Added

-   initial setup of discord.js
-   README.md and (re)organise code
-   bot command /api
-   send events about campaign
-   setup sequelize
