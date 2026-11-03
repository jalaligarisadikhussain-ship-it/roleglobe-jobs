#!/usr/bin/env python3
"""Publish an RSS 2.0 feed of employer-board discovery links, not verified vacancies."""
import datetime as dt
import email.utils
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "site/data/jobs.json"
FEED = ROOT / "site/feed.xml"
SITE = "https://roleglobe-jobs.pages.dev"
ATOM = "http://www.w3.org/2005/Atom"
ET.register_namespace("atom", ATOM)

def generate(data):
    """Use only already-published, allowlisted ATS links; keep stable item identifiers."""
    channel = ET.Element("channel")
    for name, value in (
        ("title", "RoleGlobe Jobs — employer-source opportunities"),
        ("link", SITE + "/"),
        ("description", "International IT and non-IT career discovery sourced from employer job boards. Listings are not guaranteed open; verify location, requirements and eligibility on the employer's official source."),
        ("language", "en"),
    ):
        ET.SubElement(channel, name).text = value
    ET.SubElement(channel, "{%s}link" % ATOM, {"href": SITE + "/feed.xml", "rel": "self", "type": "application/rss+xml"})
    try:
        stamp = dt.datetime.fromisoformat(data["last_updated"].replace("Z", "+00:00")).astimezone(dt.timezone.utc)
        ET.SubElement(channel, "lastBuildDate").text = email.utils.format_datetime(stamp, usegmt=True)
    except (KeyError, TypeError, ValueError):
        pass
    from urllib.parse import urlsplit
    allowed = {"boards.greenhouse.io", "job-boards.greenhouse.io", "jobs.ashbyhq.com", "jobs.lever.co"}
    rows = sorted(data.get("jobs", []), key=lambda j: (str(j.get("company", "")).casefold(), str(j.get("title", "")).casefold()))
    for job in rows[:150]:  # Bounded feed for low-bandwidth mobile subscribers.
        link = str(job.get("apply_url", ""))
        try:
            url = urlsplit(link)
        except ValueError:
            continue
        if url.scheme != "https" or url.hostname not in allowed or url.username or url.password:
            continue
        if not job.get("id") or not job.get("title") or not job.get("company"):
            continue
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = str(job["title"]) + " — " + str(job["company"])
        ET.SubElement(item, "link").text = link
        ET.SubElement(item, "guid", {"isPermaLink": "false"}).text = str(job["id"])
        ET.SubElement(item, "description").text = (
            "Employer-board listing: " + str(job["company"]) +
            " | Location: " + str(job.get("location", "not specified")) +
            " | Country: " + str(job.get("country", "not specified")) +
            " | Career field: " + str(job.get("category", "unspecified")) +
            ". RoleGlobe has not independently confirmed current availability, work authorization or sponsorship. Check the employer source."
        )
    rss = ET.Element("rss", {"version": "2.0"})
    rss.append(channel)
    ET.indent(rss, space="  ")
    return ET.tostring(rss, encoding="unicode", xml_declaration=True) + "\n"

def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    xml = generate(data)
    ET.fromstring(xml)  # Validate before replacing the published feed.
    FEED.write_text(xml, encoding="utf-8")
    print(f"Generated RSS feed from {len(data.get('jobs', []))} published employer-source records")

if __name__ == "__main__":
    main()
