import os
from html.parser import HTMLParser


class TagFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.start_tags = []
        self.end_tags = []

    def handle_starttag(self, tag, attrs):
        self.start_tags.append(tag)

    def handle_endtag(self, tag):
        self.end_tags.append(tag)


def test_html_structure():
    index_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'index.html')
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = TagFinder()
    parser.feed(content)

    assert 'html' in parser.start_tags
    assert 'body' in parser.start_tags
    assert 'html' in parser.end_tags
    assert 'body' in parser.end_tags
