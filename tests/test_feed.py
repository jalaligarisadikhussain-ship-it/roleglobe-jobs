"""Offline RSS safety and quality checks for the published employer-source feed."""
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit
from scripts.generate_feed import generate

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {"boards.greenhouse.io", "job-boards.greenhouse.io", "jobs.ashbyhq.com", "jobs.lever.co"}

class FeedQualityTests(unittest.TestCase):
    def test_published_feed_is_valid_and_uses_allowed_employer_links(self):
        root = ET.parse(ROOT / "site/feed.xml").getroot()
        self.assertEqual(root.tag, "rss")
        self.assertEqual(root.attrib.get("version"), "2.0")
        channel = root.find("channel")
        self.assertIsNotNone(channel)
        items = channel.findall("item")
        self.assertGreater(len(items), 0)
        self.assertLessEqual(len(items), 150)
        seen = set()
        for item in items:
            self.assertTrue(item.findtext("title"))
            link = item.findtext("link")
            parsed = urlsplit(link)
            self.assertEqual(parsed.scheme, "https")
            self.assertIn(parsed.hostname, ALLOWED)
            self.assertFalse(parsed.username or parsed.password)
            guid = item.findtext("guid")
            self.assertTrue(guid)
            self.assertNotIn(guid, seen)
            seen.add(guid)
            self.assertIn("not independently confirmed", item.findtext("description", ""))

    def test_generator_rejects_non_ats_urls(self):
        sample = {"last_updated": "2026-11-02T09:31:48+00:00", "jobs": [
            {"id": "good", "title": "Engineer", "company": "Example", "apply_url": "https://jobs.lever.co/example/example", "location": "India"},
            {"id": "bad", "title": "Misleading", "company": "Fake", "apply_url": "https://jobs.lever.co@evil.example/fake"},
            {"id": "bad2", "title": "Unsafe", "company": "Fake", "apply_url": "javascript:alert(1)"}
        ]}
        xml = ET.fromstring(generate(sample))
        items = xml.find("channel").findall("item")
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].findtext("guid"), "good")

if __name__ == "__main__":
    unittest.main()
