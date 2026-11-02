"""Offline regression tests for RoleGlobe source location classification and link safety."""
import unittest
from scripts.sync_jobs import normalize, domain_ok, publication_safe


class SyncQualityTests(unittest.TestCase):
    def setUp(self):
        self.source = {"provider": "greenhouse", "board": "example", "company": "Example"}

    def item(self, location, link="https://job-boards.greenhouse.io/example/jobs/123"):
        rows = {"jobs": [{"id": "123", "title": "Data Engineer",
                          "location": {"name": location}, "absolute_url": link}]}
        return normalize(self.source, rows)

    def test_remote_us_and_uk_abbreviations(self):
        for value in ("Remote - US", "Remote (USA)", "New York, U.S.", "Remote, United States"):
            with self.subTest(value=value):
                self.assertEqual(self.item(value)[0]["country"], "United States")
        for value in ("Remote - UK", "London, United Kingdom"):
            with self.subTest(value=value):
                self.assertEqual(self.item(value)[0]["country"], "United Kingdom")

    def test_dont_guess_unknown_locations(self):
        self.assertEqual(self.item("Remote, location not specified")[0]["country"], "Other")
        self.assertEqual(self.item("Hyderabad, India")[0]["country"], "India")
        self.assertEqual(self.item("Toronto, Canada")[0]["country"], "Canada")

    def test_collapse_protection_keeps_last_good_feed(self):
        self.assertFalse(publication_safe(511, 0))
        self.assertFalse(publication_safe(511, 50))
        self.assertTrue(publication_safe(511, 300))
        self.assertTrue(publication_safe(0, 0))
        self.assertTrue(publication_safe(20, 0))

    def test_only_supported_official_ats_links(self):
        self.assertEqual(len(self.item("Remote - US", "https://evil.example/jobs/123")), 0)
        self.assertEqual(len(self.item("Remote - US", "https://job-boards.greenhouse.io@evil.example/jobs/123")), 0)
        self.assertEqual(len(self.item("Remote - US", "javascript:alert(1)")), 0)
        self.assertTrue(domain_ok("https://job-boards.greenhouse.io/example/jobs/123", ["greenhouse.io"]))
        self.assertFalse(domain_ok("https://greenhouse.io.evil.example/jobs", ["greenhouse.io"]))


if __name__ == "__main__":
    unittest.main()
