#!/usr/bin/env python3
"""Generate the translated copies of the site.

The English pages in the repository root are the source. Korean text comes
from each element's data-ko attribute; Japanese, German and Spanish text comes
from i18n/<lang>.json, keyed by the English text. Pages without a translation
for a language stay English and are linked with an "(English)" note.

Run from the repository root after editing any page or translation file:

    python3 tools/build_i18n.py

It rewrites ko/, ja/, de/ and es/ and refreshes the hreflang links in the
English pages. Only the Python standard library is used.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://bool100e.github.io/mOmentiOn/'
ALL_PAGES = ['index', 'getting-started', 'screen-guide', 'support', 'release-notes', 'privacy']
CORE_PAGES = ['index', 'getting-started', 'screen-guide']
LANGUAGES = {'ko': ALL_PAGES, 'ja': CORE_PAGES, 'de': CORE_PAGES, 'es': CORE_PAGES}
ALT_START, ALT_END = '<!-- i18n:alternates -->', '<!-- /i18n:alternates -->'

TEXT_ELEMENT = re.compile(r'<(\w+)\b([^>]*?\sdata-en="([^"]*)"[^>]*)>(.*?)</\1>', re.S)
TRANSLATABLE_ATTR = re.compile(r'\b(alt|aria-label|title)="([^"]*)"')
META_CONTENT = re.compile(r'(<meta (?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description)" content=")([^"]*)(")')
RELATIVE_URL = re.compile(r'\b(href|src|poster|data-src)="(?![a-z]+:|#|/|\.\./)([^"]*)"')


def page_url(lang, page):
    return SITE + ('' if lang == 'en' else f'{lang}/') + ('' if page == 'index' else f'{page}.html')


def languages_for(page):
    return ['en'] + [lang for lang, pages in LANGUAGES.items() if page in pages]


def alternates(page):
    links = [f'<link rel="alternate" hreflang="{lang}" href="{page_url(lang, page)}">' for lang in languages_for(page)]
    links.append(f'<link rel="alternate" hreflang="x-default" href="{page_url("en", page)}">')
    return ALT_START + ''.join(links) + ALT_END


def set_alternates(source, page):
    source = re.sub(re.escape(ALT_START) + '.*?' + re.escape(ALT_END), '', source, flags=re.S)
    return source.replace('</head>', alternates(page) + '</head>', 1)


def korean_dictionary(sources):
    table = json.loads((ROOT / 'i18n' / 'ko.json').read_text(encoding='utf-8'))
    for source in sources:
        for tag in re.finditer(r'<[^>]*\sdata-en="([^"]*)"[^>]*>', source):
            ko = re.search(r'\sdata-ko="([^"]*)"', tag.group(0))
            if ko:
                table.setdefault(html.unescape(tag.group(1)), html.unescape(ko.group(1)))
    return table


def translate_page(source, page, lang, table):
    def text(value):
        return table.get(value, value)

    def element(match):
        tag, attrs, english, _ = match.groups()
        return f'<{tag}{attrs}>{html.escape(text(html.unescape(english)), quote=False)}</{tag}>'

    def attribute(match):
        name, value = match.groups()
        return f'{name}="{html.escape(text(html.unescape(value)))}"'

    def url(match):
        name, target = match.groups()
        name_page = target.split('#')[0].split('?')[0]
        if name_page.endswith('.html') and name_page[:-5] in LANGUAGES[lang]:
            return match.group(0)
        return f'{name}="../{target}"'

    out = TEXT_ELEMENT.sub(element, source)
    out = TRANSLATABLE_ATTR.sub(attribute, out)
    out = META_CONTENT.sub(lambda m: m.group(1) + html.escape(text(html.unescape(m.group(2)))) + m.group(3), out)
    out = re.sub(r'<title>([^<]*)</title>', lambda m: f'<title>{html.escape(text(html.unescape(m.group(1))), quote=False)}</title>', out, count=1)
    out = re.sub(r'data-video-label-en="([^"]*)"(?! aria-label=)', lambda m: f'{m.group(0)} aria-label="{html.escape(text(html.unescape(m.group(1))))}"', out)
    out = out.replace('<html lang="en">', f'<html lang="{lang}">', 1)
    out = out.replace(f'href="{page_url("en", page)}"', f'href="{page_url(lang, page)}"')
    out = out.replace(f'content="{page_url("en", page)}"', f'content="{page_url(lang, page)}"')
    out = out.replace(f'<option value="{lang}">', f'<option value="{lang}" selected>')
    out = RELATIVE_URL.sub(url, out)
    note = html.escape(text('(English)'))
    for other in ALL_PAGES:
        if other not in LANGUAGES[lang]:
            out = re.sub(rf'(<a href="\.\./{re.escape(other)}\.html[^"]*"[^>]*>)(.*?)</a>', rf'\1\2 <small class="en-only">{note}</small></a>', out, flags=re.S)
    return set_alternates(out, page)


def main():
    sources = {page: (ROOT / f'{page}.html').read_text(encoding='utf-8') for page in ALL_PAGES}
    for page, source in sources.items():
        english = re.sub(r'(data-video-label-en="([^"]*)")(?! aria-label=)', r'\1 aria-label="\2"', source)
        (ROOT / f'{page}.html').write_text(set_alternates(english, page), encoding='utf-8')
    tables = {'ko': korean_dictionary(sources.values())}
    for lang in ('ja', 'de', 'es'):
        tables[lang] = json.loads((ROOT / 'i18n' / f'{lang}.json').read_text(encoding='utf-8'))
    for lang, pages in LANGUAGES.items():
        folder = ROOT / lang
        folder.mkdir(exist_ok=True)
        for stale in folder.glob('*.html'):
            stale.unlink()
        for page in pages:
            (folder / f'{page}.html').write_text(translate_page(sources[page], page, lang, tables[lang]), encoding='utf-8')
        missing = sorted({html.unescape(m.group(3)) for page in pages for m in TEXT_ELEMENT.finditer(sources[page])} - tables[lang].keys())
        if missing:
            print(f'{lang}: {len(missing)} untranslated strings left in English:', *missing[:10], sep='\n  ')
    print('Generated', ', '.join(f'{lang}/ ({len(pages)} pages)' for lang, pages in LANGUAGES.items()))


if __name__ == '__main__':
    main()
