"""Maintain sitemap from existing approved URLs and explicitly opted-in HTML."""
import subprocess, re, datetime, urllib.parse, xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
BASE='https://kidd.re.kr/'
class Meta(HTMLParser):
    def __init__(self):
        super().__init__(); self.blocked=False; self.public=False; self.canonical=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='meta':
            name=(a.get('name') or '').lower(); content=(a.get('content') or '').lower()
            if name in ('robots','googlebot','yeti','bingbot') and re.search(r'\b(noindex|none)\b',content): self.blocked=True
            if name=='kidd-publication' and content=='public': self.public=True
        if tag=='link' and 'canonical' in (a.get('rel') or '').lower().split(): self.canonical=a.get('href')
def url(path):
    return BASE+urllib.parse.quote(path[:-10] if path.endswith('index.html') and (path=='index.html' or path.endswith('/index.html')) else path,safe='/')
def path(u):
    if not u.startswith(BASE): return None
    p=urllib.parse.unquote(u[len(BASE):])
    return p+'index.html' if not p or p.endswith('/') else p
f=Path('sitemap.xml'); original=f.read_text()
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
existing={e.find('s:loc',ns).text:e for e in ET.fromstring(original).findall('s:url',ns)}
tracked=set(subprocess.check_output(['git','ls-files','-z'],text=True).split('\0'))
out=original
for p in sorted(tracked):
    if not p.endswith('.html') or not Path(p).is_file(): continue
    u=url(p); m=Meta(); m.feed(Path(p).read_text(encoding='utf-8',errors='replace'))
    if m.blocked or (m.canonical and m.canonical!=u): continue
    if u not in existing and m.public and m.canonical==u:
        date=subprocess.check_output(['git','log','-1','--format=%cs','--',p],text=True).strip()
        line='<url><loc>'+u+'</loc>'+('<lastmod>'+date+'</lastmod>' if date else '')+'</url>\n'
        out=out.replace('</urlset>',line+'</urlset>')
# Preserve comments and existing curated entries; remove only missing or explicitly noindex URLs.
for u in existing:
    p=path(u)
    if not p: continue
    m=Meta()
    if p in tracked and Path(p).is_file(): m.feed(Path(p).read_text(encoding='utf-8',errors='replace'))
    if p not in tracked or not Path(p).is_file() or m.blocked:
        pattern=r'<url>\s*<loc>'+re.escape(u)+r'</loc>.*?</url>\s*'
        out=re.sub(pattern,'',out,flags=re.S)
ET.fromstring(out)
if out!=original: f.write_text(out,encoding='utf-8')
