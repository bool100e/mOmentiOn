# mOmentiOn website

English-root product website with Korean, Japanese, German and Spanish pages. GitHub Pages: https://bool100e.github.io/mOmentiOn/

Static HTML/CSS/JavaScript. No build dependencies. Publish the root of `main` with GitHub Pages.

## Pages

- `index.html`: product overview, supplied banner, ride image, heatmap/comparison videos, download links.
- `getting-started.html`: setup instructions, camera compatibility and safety notes.
- `screen-guide.html`: main controls, status indicators and route-tool guidance.
- `release-notes.html`: bilingual build history based on the supplied release notes.
- `privacy.html`: bilingual privacy policy, including advertising, local files, support email, retention/deletion, and website storage.
- `support.html`: contact information, connection/recording help, purchase restoration and privacy requests.

English is the initial language. Explicit language and theme preferences are stored locally. The initial theme follows the operating system. No analytics or external script dependencies are added.

## Media behavior

The ride screenshot and videos are real user-supplied recordings, not fictional examples. The ride image includes GPS coordinates and timestamps; these will become public when deployed. Source files were preserved without re-encoding. Hero and showcase videos are configured for continuous muted, inline autoplay and looping, without visibility or reduced-motion gating in the playback script. Playback is requested on initial load, when the tab becomes visible and on the first pointer interaction; browser autoplay policy may require interaction. Screen-guide video loads near the viewport and plays only when the guide is considered visible, the tab is not hidden, reduced motion is disabled and no guide item is highlighted. Posters are extracted from the supplied videos. Hero and showcase videos retain `preload="auto"`; screen-guide videos use `preload="none"`. The ride-history preview continuously scrolls while visible in an active tab, including with reduced motion.

## Historical policy setup note

During an earlier website edit, the privacy text used the owner's supplied SDK audit rather than a new app-source or traffic audit. Retrieval of the previously published policy failed in that task. This is a historical retrieval result, not a fresh check or a current submission checklist. No universal claim that Insta360 SDKs transmit nothing was added.

That task's handoff identified public policy/support access, in-app and store URLs, retention practices and store disclosures as follow-up checks. Their completion is not established by this note. Local browser checks do not establish store compliance or approval.

Release notes are organized by build, without release dates. Distribution notes in older entries describe historical records.

No public app-source repository link is presented.

Logo and icon copied from the app repository. Outfit fonts use the SIL Open Font License; see `assets/OFL.txt`.

## Languages

The English pages in the repository root are the source. `ko/`, `ja/`, `de/` and `es/` are generated copies — do not edit them by hand.

- Korean element text is maintained in the root page's `data-ko`; Japanese, German and Spanish text comes from `i18n/<lang>.json`, keyed by the English text.
- The generator loads `i18n/ko.json` first, then fills missing keys from `data-ko`. Avoid conflicting overrides: the app-name element now uses `data-ko` without a duplicate JSON entry. Korean metadata, accessibility labels and generated status text still use the dictionary. Existing search spellings `모멘션` and `모맨션` are retained.
- Japanese, German and Spanish cover Home, Getting started and Screen guide. Support, Release notes and Privacy Policy link to the English pages with an "(English)" note.
- Generated status labels are translated through `i18n/<lang>.json`, including Korean.
- After editing a page, translation file or release-facts input, run `python3 tools/build_i18n.py` from the repository root and commit the regenerated folders. It lists any strings still missing a translation.

## Current release status

<!-- release:current -->

- iOS 1.0.11 (60) — Released on the App Store.
- Android 52 — Google Play review pending.
- Wear OS 10003 — Google Play review pending.
- Last verified public Google Play build: 44.

Requests to pause the Android and Wear OS closed tests are still in Google Play review. The Korean full description and trader details are also in review. Use the App Store or Google Play for official updates.
<!-- /release:current -->

The release facts above and the static current-status blocks in Getting started and Release notes are generated from `data/release-facts.json`. Store facts were supplied by the coordinator; this build does not query store consoles. Update that input only with a new store observation or newly supplied coordinator evidence, then rerun the generator. A source change or successful site check is not store-release evidence.

## Guide maintenance and local checks

The route-tool details in Getting started and Screen guide distinguish released iOS 1.0.11 (60) from Android 52, still in Google Play review, and public Android 44. The Simple settings collapse behavior is scoped to iOS 1.0.11 (60) and Android 51 onward. Detailed route and graph instructions stay inside the existing collapsed sections.

Run `python3 tools/build_i18n.py`, then `python3 tools/check_seo.py` and `git diff --check`. Run the generator a second time and compare the generated file hashes to verify deterministic output. The SEO check covers 21 canonical/hreflang targets, static language anchors, visible app/schema agreement and shared release facts. These local checks do not publish the site or verify desktop/mobile rendering.

For copy-only maintenance, preserve CSS, JavaScript, media, fonts, the 13 activity pictograms, sitemaps, robots rules, canonical URLs and official store links. The separate `reports-local.html`, `reports-local-privacy.html` and `reports-local-terms.html` pages are outside this guide-maintenance scope.

## Existing site implementation notes

The notes below describe earlier implementation and media work. They are reference history, not an active work queue.

The expanded Home description contains a factual app summary and concise camera, watch, GPX preservation and navigation answers. Its localized MobileApplication JSON-LD matches the visible summary and official store links. Static footer language links and application schema are generated after canonical URL transformation. The existing WebSite schema remains in place.

Hero activity pictograms are from [Tabler Icons](https://tabler.io/icons) (MIT License, see `assets/tabler-icons-LICENSE.txt`).

Apple Watch media: `assets/apple-watch-speed-loop.mp4` is 12 seconds of actual simulator preview capture with continuously changing automatic-recording speed (6–42 km/h), 416x496, without an audio track. The website preview was built in a temporary app copy; release app sources are unchanged. It loops while visible and pauses offscreen or in a hidden tab; reduced-motion preferences retain the poster. No live camera or phone link was used to record this preview.

Camera setup guidance: Home download, Getting started and Support ask Insta360 users to enable Bluetooth Wakeup before connecting and to allow extra time for the first connection. Model-specific menu paths in Getting started link to the official Insta360 guide. This setting guidance does not claim that mOmentiOn powers on a switched-off camera. The OSC link is labeled as historical Wi-Fi/OSC reference material, separate from current Bluetooth support guidance; the model lists are unchanged.

Google Play listing alignment (2026-10-27): Home uses the approved Korean and English app names and short descriptions, with camera, route, trial and one-time Pro details in an expandable description. Korean page titles and social metadata are localized. The ride-history screenshot continuously scrolls up and down while visible in an active tab, including during hover, focus and reduced-motion settings; video playback preferences are unchanged.

Hero MP4: remuxed with FFmpeg stream copy and `+faststart`, retaining the original video track timescale (600). The `moov` metadata now precedes media data. Codec, resolution, frame rate, track timescale, duration/start, encoded packet content and timestamps, and decoded frame content and timestamps matched the preserved original. The playback-parameter comparison used FFmpeg stream summary lines, not all metadata tags. Auxiliary container tags changed, and container/stream `creation_time` metadata was removed; these metadata changes are distinct from playback content and timing. No re-encoding, video-attribute, preload, script or CSS changes were made. Actual startup improvement has not been measured; only metadata fetch ordering improved.
