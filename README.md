# mOmentiOn website

English-default / Korean product website. GitHub Pages: https://bool100e.github.io/mOmentiOn/

Static HTML/CSS/JavaScript. No build dependencies. Publish the root of `main` with GitHub Pages.

## Pages

- `index.html`: product overview, supplied banner, ride image, heatmap/comparison videos, download links.
- `guide.html`: introduction and product media.
- `getting-started.html`: setup instructions.
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
- Japanese, German and Spanish cover Home, Guide, Getting started and Screen guide. Support, Release notes and Privacy Policy link to the English pages with an "(English)" note.
- After editing a page or a translation file, run `python3 tools/build_i18n.py` from the repository root and commit the regenerated folders. It lists any strings still missing a translation.
