# mOmentiOn website

English-default / Korean product website. GitHub Pages: https://bool100e.github.io/mOmentiOn/

Static HTML/CSS/JavaScript. No build dependencies. Publish the root of `main` with GitHub Pages.

## Pages

- `index.html`: product overview, supplied banner, ride image, heatmap/comparison videos, download links.
- `getting-started.html`: setup instructions, camera compatibility and safety notes.
- `screen-guide.html`: original 12 numbered Android controls and brand logos.
- `release-notes.html`: bilingual build history based on the supplied release notes.
- `privacy.html`: bilingual privacy policy, including advertising, local files, support email, retention/deletion, and website storage.
- `support.html`: contact information, connection/recording help, purchase restoration and privacy requests.

English is the initial language. Explicit language and theme preferences are stored locally. The initial theme follows the operating system. No analytics or external script dependencies are added.

## Media and release status

The ride screenshot and videos are real user-supplied recordings, not fictional examples. The ride image includes GPS coordinates and timestamps; these will become public when deployed. Source files were preserved without re-encoding. Videos loop muted when at least 20% visible, and pause offscreen or in a hidden tab. Native controls and explicit user pause are respected. Reduced-motion preferences disable automatic playback. Posters are extracted from the supplied videos; `preload="none"` avoids fetching offscreen video before playback.

## Before Store Submission

The privacy text uses the owner's supplied SDK audit, not a new app-source or traffic audit. Existing published policy retrieval failed during this change; compare the existing policy before replacing its URL. Verify support-retention practices and app disclosures against this text. No universal claim that Insta360 SDKs transmit nothing has been added.

After approved deployment, verify public HTTPS access to `privacy.html` and `support.html`, link the policy inside the app, and set the corresponding App Store Connect URLs. Reconcile App Store privacy and Google Play Data safety answers with the actual released SDK configuration. Local browser checks do not establish store compliance or approval.

Build 21 is labeled unreleased/replaced by 22. Earlier entries are described as development history where distribution is uncertain. iOS TestFlight has no supplied public invitation URL, so none is invented. Update availability and download links when confirmed.

No public app-source repository link is presented.

Logo and icon copied from the app repository. Outfit fonts use the SIL Open Font License; see `assets/OFL.txt`.

## Languages

The English pages in the repository root are the source. `ko/`, `ja/`, `de/` and `es/` are generated copies — do not edit them by hand.

- Korean text comes from each element's `data-ko` attribute; Japanese, German and Spanish text comes from `i18n/<lang>.json`, keyed by the English text.
- Japanese, German and Spanish cover Home, Getting started and Screen guide. Support, Release notes and Privacy Policy link to the English pages with an "(English)" note.
- After editing a page or a translation file, run `python3 tools/build_i18n.py` from the repository root and commit the regenerated folders. It lists any strings still missing a translation.

Latest website update: Android 1.0 (44) is published to the Alpha closed-testing track in 178 countries/regions for enrolled testers. iOS 1.0.4 (51) is Waiting for Review and will release automatically after approval; the current official App Store release is iOS 1.0.3 (50). iOS build 51 and Android build 44 add Simple/Advanced settings, filled Camera/Recording Speed/App/Pro cards and three onboarding steps (connect, GPS, record). Recording-speed changes are saved with Confirm; Cancel keeps the previous speed. Existing preferences and recording behavior are preserved. The guides distinguish Android 44 test availability from the pending iOS 51 release.

Hero activity pictograms are from [Tabler Icons](https://tabler.io/icons) (MIT License, see `assets/tabler-icons-LICENSE.txt`).

Apple Watch media: `assets/apple-watch-speed-loop.mp4` is 12 seconds of actual simulator preview capture with continuously changing automatic-recording speed (6–42 km/h), 416x496, without an audio track. The website preview was built in a temporary app copy; release app sources are unchanged. It loops while visible and pauses offscreen or in a hidden tab; reduced-motion preferences retain the poster. No live camera or phone link was used to record this preview.

Camera setup guidance: Home download, Getting started and Support now ask Insta360 users to enable Bluetooth Wakeup before connecting and to allow extra time for the first connection. Model-specific menu paths in Getting started link to the official Insta360 guide. This setting guidance does not claim that mOmentiOn powers on a switched-off camera.

Google Play listing alignment (2026-10-27): Home uses the approved Korean and English app names and short descriptions, with camera, route, trial and one-time Pro details in an expandable description. Korean page titles and social metadata are localized. The ride-history screenshot continuously scrolls up and down while visible in an active tab, including during hover, focus and reduced-motion settings; video playback preferences are unchanged.
