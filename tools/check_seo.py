#!/usr/bin/env python3
"""Check generated SEO content without network access or browser dependencies."""
import json
import re
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlsplit

import build_i18n as build


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.canonicals, self.alternates, self.anchors, self.schemas = [], {}, [], []
        self.footer_links, self.release, self.summary, self.visible = [], {}, '', []
        self.footer = False
        self.capture = None
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.lang = attrs['lang']
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs['href'])
        if tag == 'link' and attrs.get('rel') == 'alternate':
            language = attrs['hreflang']
            assert language not in self.alternates, 'Duplicate hreflang'
            self.alternates[language] = attrs['href']
        if tag == 'nav' and attrs.get('class') == 'footer-lang':
            self.footer = True
        if tag == 'a':
            self.anchors.append(attrs['href'])
            if self.footer:
                self.footer_links.append(attrs)
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.capture = (tag, 'schema', [])
        elif tag == 'p' and attrs.get('id') == 'app-summary':
            self.capture = (tag, 'summary', [])
        elif 'data-release-platform' in attrs:
            self.capture = (tag, attrs['data-release-platform'], [])

    def handle_data(self, data):
        if self.capture:
            self.capture[2].append(data)
        if not self.capture or self.capture[1] != 'schema':
            self.visible.append(data)

    def handle_endtag(self, tag):
        if self.capture and tag == self.capture[0]:
            _, key, chunks = self.capture
            value = ''.join(chunks)
            if key == 'schema':
                self.schemas.append(json.loads(value))
            elif key == 'summary':
                self.summary = value
            else:
                self.release[key] = value
            self.capture = None
        if tag == 'nav':
            self.footer = False


def main():
    facts = json.loads((build.ROOT / 'data/release-facts.json').read_text())
    sources = {page: (build.ROOT / f'{page}.html').read_text() for page in build.ALL_PAGES}
    tables = {'en': {}, 'ko': build.korean_dictionary(sources.values())}
    tables.update({lang: json.loads((build.ROOT / f'i18n/{lang}.json').read_text())
                   for lang in ('ja', 'de', 'es')})
    for lang in build.LANGUAGES:
        for label in ('Current release status', 'Released on the App Store.', 'Google Play review pending.',
                      'Last verified public Google Play build: {build}.', facts['distribution_note']):
            assert label in tables[lang], f'Missing status translation: {lang}: {label}'
    urls = [node.text for node in ET.parse(build.ROOT / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    assert len(urls) == len(set(urls)) == 21, 'Sitemap must keep 21 distinct URLs'
    assert urls == (build.ROOT / 'sitemap.txt').read_text().splitlines(), 'Sitemaps differ'
    pages = {}
    for url in urls:
        relative = url.removeprefix(build.SITE)
        assert url.startswith(build.SITE) and not urlsplit(url).query
        path = build.ROOT / (relative + 'index.html' if not relative or relative.endswith('/') else relative)
        source = path.read_text()
        parsed = Page(source)
        assert parsed.canonicals == [url], f'Canonical: {path}'
        parts = relative.split('/')
        lang = parts[0] if parts[0] in build.LANGUAGES else 'en'
        name = path.stem
        assert parsed.lang == lang, f'HTML language: {path}'
        expected = {language: build.page_url(language, name) for language in build.languages_for(name)}
        expected['x-default'] = build.page_url('en', name)
        assert parsed.alternates == expected, f'Hreflang: {path}'
        links = {a['hreflang']: a['href'] for a in parsed.footer_links}
        assert len(links) == len(parsed.footer_links) == len(expected) - 1
        assert links == {key: value for key, value in expected.items() if key != 'x-default'}
        assert links['en'] == build.page_url('en', name), f'English footer link rewritten: {path}'
        assert [a['hreflang'] for a in parsed.footer_links if a.get('aria-current') == 'page'] == [lang]
        for anchor in parsed.footer_links:
            assert anchor['lang'] == anchor['hreflang']
        if lang != 'en':
            expected_source = build.translate_page(sources[name], name, lang, tables[lang], facts)
            assert source == expected_source, f'Stale generated page: {path}'
        if name in ('getting-started', 'release-notes'):
            assert parsed.release == dict(build.release_lines(facts, tables[lang])), f'Release facts: {path}'
            note = facts['distribution_note']
            assert tables[lang].get(note, note) in ''.join(parsed.visible)
        if name == 'index':
            apps = [item for item in parsed.schemas if item.get('@type') == 'MobileApplication']
            websites = [item for item in parsed.schemas if item.get('@type') == 'WebSite']
            assert len(apps) == len(websites) == 1, f'JSON-LD types: {path}'
            app = apps[0]
            assert app['description'] == parsed.summary and parsed.summary
            assert app['name'] in ''.join(parsed.visible)
            assert app['url'] == url and app['@id'] == url + '#app' and app['inLanguage'] == lang
            assert app['operatingSystem'] == ['Android', 'iOS']
            assert app['downloadUrl'] == build.STORE_URLS
            assert set(app['downloadUrl']) <= set(parsed.anchors)
            assert not {'aggregateRating', 'review', 'offers', 'price'} & app.keys()
            assert websites[0]['url'] == build.SITE and websites[0]['@type'] == 'WebSite'
        assert not re.search(r'is now available|is available to existing|remains available|current public version remains|current official iOS release', source), f'Stale current claim: {path}'
        pages[url] = parsed
    for url, parsed in pages.items():
        for lang, target in parsed.alternates.items():
            assert target in pages, f'Alternate target not in sitemap: {target}'
            assert pages[target].alternates.get(parsed.lang) == url, f'Nonreciprocal hreflang: {url}'
    readme = (build.ROOT / 'README.md').read_text()
    assert all(line in readme for _, line in build.release_lines(facts, {}))
    assert f'Last verified public Google Play build: {facts["android"]["last_verified_public_build"]}.' in readme
    assert not re.search(r'\b\d{4}-\d{2}-\d{2}\b|<time\b', sources['release-notes'])
    print('PASS: 21 canonical/hreflang pages, reciprocal alternates and static language links.')
    print('PASS: 5 localized app schemas match visible summaries and official store links; no invented ratings or pricing.')
    print('PASS: shared current release facts, historical build notes and regenerated translations.')


if __name__ == '__main__':
    main()
