#!/usr/bin/env python3
import os
import re
from html.parser import HTMLParser

class Analyzer(HTMLParser):
    def __init__(self):
        super().__init__()
        self.book_buttons = []
        self.has_book_func = False
        self.href_issues = []
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'button' and 'onclick' in attrs_dict and 'bookClass' in attrs_dict['onclick']:
            self.book_buttons.append(self.getpos()[0])
        if tag == 'a':
            href = attrs_dict.get('href')
            if href in (None, '#'):
                self.href_issues.append(('anchor missing link', self.getpos()[0]))
        if tag == 'img' and 'alt' not in attrs_dict:
            self.href_issues.append(('img missing alt', self.getpos()[0]))
        if tag == 'script':
            self.in_script = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False

    def handle_data(self, data):
        if self.in_script and re.search(r'function\s+bookClass', data):
            self.has_book_func = True


def analyze_file(path):
    parser = Analyzer()
    with open(path, 'r', encoding='utf-8') as f:
        parser.feed(f.read())
    return parser


def main():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    for fname in html_files:
        parser = analyze_file(fname)
        print(f'File: {fname}')
        print(f'  Book buttons: {len(parser.book_buttons)}')
        print(f'  Has bookClass function: {parser.has_book_func}')
        for issue, line in parser.href_issues:
            print(f'  Issue: {issue} at line {line}')
        print()

if __name__ == '__main__':
    main()
