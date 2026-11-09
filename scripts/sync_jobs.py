#!/usr/bin/env python3
"""RoleGlobe: publisher ATS feed checks. This is link discovery, not job verification by a human."""
import datetime as dt, hashlib, html, json, pathlib, re, sys, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG = ROOT / "sources.json"
DATA = ROOT / "site/data/jobs.json"
UTC = dt.timezone.utc
PROVIDERS = {"greenhouse":"boards-api.greenhouse.io", "lever":"api.lever.co", "ashby":"api.ashbyhq.com"}
CATEGORIES = re.compile(r"software|developer|devops|cyber|cloud|machine learning|data engineer|data scientist|data platform|data analyst|network engineer|site reliability|frontend|backend|full.?stack|security engineer|security scientist|ai engineer|applied scientist|ai research|it support|qa engineer|systems engineer|infrastructure|analytics engineer|integration engineer|platform engineer|forward deployed engineer|product engineer|engineering manager|ux engineer|business engineer|solutions engineer|technical support|technical quality|data architect|database|embedded engineer|ml engineer|mobile engineer|\bios engineer\b|\bandroid engineer\b|\bfield engineer\b|\bdesign engineer\b|research engineer|business systems|\bcompliance engineer\b",re.I)
COUNTRIES = {
    "India":r"india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune|noida",
    "United States":r"united states|usa|u\.?s\.?a\.?|u\.?s\.?|san francisco|los angeles|new york|california|seattle|boston|texas|chicago|washington|austin",
    "Canada":r"canada|toronto|vancouver|montreal|ottawa",
    "United Kingdom":r"united kingdom|u\.?k\.?|london|manchester|england|scotland",
    "Germany":r"germany|berlin|munich|frankfurt",
    "Australia":r"australia|sydney|melbourne|brisbane",
    "United Arab Emirates":r"uae|dubai|abu dhabi",
    "Singapore":r"singapore","France":r"france|paris","Netherlands":r"netherlands|amsterdam",
    "Brazil":r"brazil|são paulo|sao paulo","Japan":r"japan|tokyo|osaka",
    "Ireland":r"ireland|dublin","Israel":r"israel|tel aviv",
    "South Korea":r"south korea|seoul","Sweden":r"sweden|stockholm",
}
def domain_ok(url, domains):
    try:
        p=urllib.parse.urlsplit(url)
        return p.scheme=="https" and p.hostname and p.username is None and any(p.hostname==d or p.hostname.endswith("."+d) for d in domains)
    except (TypeError, ValueError): return False
def text(value, length=150):
    value=re.sub(r"<[^>]+>"," ",str(value or ""))
    return re.sub(r"\s+"," ",html.unescape(value)).strip()[:length]
def endpoint(p, board):
    if p not in PROVIDERS or not re.fullmatch(r"[a-zA-Z0-9_-]{2,80}",board): raise ValueError("Unsupported board/provider")
    b=urllib.parse.quote(board)
    if p=="greenhouse": return "https://boards-api.greenhouse.io/v1/boards/"+b+"/jobs?content=true"
    if p=="lever": return "https://api.lever.co/v0/postings/"+b+"?mode=json"
    return "https://api.ashbyhq.com/posting-api/job-board/"+b
def fetch(url, max_bytes=8_000_000):
    if not domain_ok(url,PROVIDERS.values()): raise ValueError("Non-approved endpoint")
    req=urllib.request.Request(url,headers={"User-Agent":"RoleGlobeJobs/1.0 (public employer job discovery)","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=18) as res:
        if "json" not in res.headers.get("Content-Type","").lower(): raise ValueError("Non-JSON feed")
        body=res.read(max_bytes+1)
        if len(body)>max_bytes: raise ValueError("Oversized feed")
        return json.loads(body)
def deadline_date(value):
    """Only explicit employer closing dates are deadlines; never infer from feed timestamps."""
    if not isinstance(value, str):
        return ""
    match=re.match(r"^(\d{4}-\d{2}-\d{2})(?:[T\s].*)?$",value.strip())
    if not match:
        return ""
    try:
        return dt.date.fromisoformat(match.group(1)).isoformat()
    except ValueError:
        return ""

def normalized_details(raw, provider):
    """Minimal, attributed employer-board excerpt; complete terms remain on the official link."""
    if provider=="greenhouse":
        desc=raw.get("content") or ""
        departments=raw.get("departments") or []
        team=", ".join(text(x.get("name"),70) for x in departments if isinstance(x,dict)) if isinstance(departments,list) else ""
        kind=raw.get("employment_type") or ""
        compensation=""
    elif provider=="lever":
        desc=raw.get("descriptionPlain") or raw.get("description") or ""
        cats=raw.get("categories") or {}
        team=cats.get("team") or "" if isinstance(cats,dict) else ""
        kind=cats.get("commitment") or "" if isinstance(cats,dict) else ""
        compensation=""
    else:
        desc=raw.get("descriptionPlain") or raw.get("descriptionHtml") or ""
        team=raw.get("department") or ""
        kind=raw.get("employmentType") or ""
        compensation=raw.get("compensationTierSummary") or ""
    result={}
    for key,value,length in [("overview",desc,1400),("department",team,120),
                             ("employment_type",kind,90),("salary",compensation,140)]:
        if isinstance(value,str) and value.strip():
            result[key]=text(value,length)
    closing=deadline_date(raw.get("closingDate") or raw.get("closing_date") or raw.get("validThrough") or raw.get("valid_through"))
    if closing:
        result["deadline"]=closing
    return result

def normalize(source, data):
    p=source["provider"]; company=source["company"]; board=source["board"]
    if p=="greenhouse":
        if not isinstance(data,dict) or not isinstance(data.get("jobs"),list): raise ValueError("Invalid greenhouse feed")
        raw_rows=[r for r in data["jobs"] if isinstance(r,dict)]
    elif p=="lever":
        if not isinstance(data,list): raise ValueError("Invalid lever feed")
        raw_rows=[r for r in data if isinstance(r,dict)]
    else:
        if not isinstance(data,dict) or not isinstance(data.get("jobs"),list): raise ValueError("Invalid ashby feed")
        raw_rows=[r for r in data["jobs"] if isinstance(r,dict) and r.get("isListed") is not False]
    allowed={"greenhouse":["greenhouse.io"],"lever":["lever.co"],"ashby":["ashbyhq.com"]}[p]
    results=[]
    for raw in raw_rows:
        if p=="greenhouse":
            id_,title=raw.get("id"),raw.get("title")
            location=(raw.get("location") or {}).get("name") if isinstance(raw.get("location"),dict) else raw.get("location")
            link,remote=raw.get("absolute_url"),None
        elif p=="lever":
            id_,title=raw.get("id"),raw.get("text")
            categories=raw.get("categories") or {}
            location=categories.get("location") if isinstance(categories,dict) else None
            link,remote=raw.get("hostedUrl"),raw.get("workplaceType")
        else:
            id_,title=raw.get("id"),raw.get("title")
            location,link=raw.get("location"),raw.get("jobUrl")
            remote="Remote" if raw.get("isRemote") else ""
        if not id_ or not title or not domain_ok(link,allowed): continue
        title=text(title,180);location=text(location or "Location not specified",160)
        country=next((k for k,pattern in COUNTRIES.items() if re.search(r"\b(?:"+pattern+r")\b",location,re.I)),"Other")
        work="Remote" if "remote" in (str(remote)+" "+location).lower() else ("Hybrid" if "hybrid" in location.lower() else "On-site")
        exp="Entry-level" if re.search(r"\b(intern|internship|junior|graduate|entry|new grad)\b",title,re.I) else ("Senior" if re.search(r"\b(senior|principal|staff|director|lead)\b",title,re.I) else "Unspecified")
        # Newly onboarded employer boards are discoverable by factual metadata only,
        # pending independent review of content reuse and commercial syndication rights.
        details={} if source.get("metadata_only") else normalized_details(raw,p)
        if details.get("deadline") and details["deadline"]<dt.datetime.now(UTC).date().isoformat():
            continue  # An explicit closing date has passed.
        idstr=p+":"+board+":"+str(id_);slug=hashlib.sha256(idstr.encode()).hexdigest()[:12]
        results.append({"id":idstr,"slug":slug,"title":title,"company":company,
            "country":country,"location":location,"category":"IT" if CATEGORIES.search(title) else "Non-IT",
            "workplace":work,"experience":exp,"apply_url":str(link),
            "source_name":p.title()+" / "+company,"source_key":p+":"+board,**details})
    return results
def publication_safe(previous_count, new_count):
    """Reject sudden near-total feed loss; preserve last good file for human review."""
    return previous_count < 50 or new_count >= max(10, previous_count // 5)

def main():
    now=dt.datetime.now(UTC);cfg=json.loads(CONFIG.read_text(encoding="utf-8"))["sources"];current=json.loads(DATA.read_text(encoding="utf-8"))
    previous={j["id"]:j for j in current.get("jobs",[]) if isinstance(j,dict) and j.get("id")}
    loaded={};statuses=[];failed=set();success=set()
    for src in cfg:
        if not src.get("enabled"): continue
        name=src["provider"]+":"+src["board"]
        try:
            uri=endpoint(src["provider"],src["board"])
            # Greenhouse's metadata-only listing avoids retrieving full job prose.
            if src.get("metadata_only") and src["provider"]=="greenhouse":
                uri=uri.replace("?content=true","?content=false")
            payload_limit=32_000_000 if src.get("metadata_only") else 8_000_000
            fetched=normalize(src,fetch(uri,max_bytes=payload_limit))
            success.add(name)
            for job in fetched:
                job["last_verified"]=now.isoformat()
                job["first_seen"]=previous.get(job["id"],{}).get("first_seen") or now.isoformat()
                loaded[job["id"]]=job
            statuses.append({"source":name,"status":"ok","jobs":len(fetched)})
            print(name,len(fetched))
        except Exception as e:
            failed.add(name);statuses.append({"source":name,"status":"failed","error":str(e)[:140]})
            print("Failed",name,str(e),file=sys.stderr)
    if not success:
        print("No successful sources; retaining previous output",file=sys.stderr)
        return 1
    for job in previous.values():
        if job.get("source_key") not in failed or job["id"] in loaded: continue
        try:
            last=dt.datetime.fromisoformat(job.get("last_verified",""))
            if now-last <= dt.timedelta(hours=24):loaded[job["id"]]=job
        except ValueError: pass
    if not publication_safe(len(previous), len(loaded)):
        print(f"Safety stop: employer feed collapsed from {len(previous)} to {len(loaded)} listings. Retaining last good publication until investigated.",file=sys.stderr)
        return 1
    out={"last_updated":now.isoformat(),"source_results":statuses,"jobs":sorted(loaded.values(),key=lambda j:(j["company"],j["title"]))[:1200]}
    DATA.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Published",len(out["jobs"]),"jobs")
    return 0
if __name__=="__main__":sys.exit(main())
