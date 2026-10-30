#!/usr/bin/env python3
"""RoleGlobe: publisher ATS feed checks. This is link discovery, not job verification by a human."""
import datetime as dt, hashlib, html, json, pathlib, re, sys, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG = ROOT / "sources.json"
DATA = ROOT / "site/data/jobs.json"
UTC = dt.timezone.utc
PROVIDERS = {"greenhouse":"boards-api.greenhouse.io", "lever":"api.lever.co", "ashby":"api.ashbyhq.com"}
CATEGORIES = re.compile(r"software|developer|devops|cyber|cloud|machine learning|data engineer|data scientist|network engineer|software engineer|site reliability|frontend|backend|security engineer|ai engineer|it support|qa engineer|systems engineer|infrastructure",re.I)
COUNTRIES = {
    "India":r"india|bengaluru|bangalore|hyderabad|mumbai|delhi|chennai|pune|noida",
    "United States":r"united states|usa|new york|california|seattle|boston|texas|chicago|washington|austin",
    "Canada":r"canada|toronto|vancouver|montreal|ottawa",
    "United Kingdom":r"united kingdom|london|manchester|england|scotland",
    "Germany":r"germany|berlin|munich|frankfurt",
    "Australia":r"australia|sydney|melbourne|brisbane",
    "United Arab Emirates":r"uae|dubai|abu dhabi",
    "Singapore":r"singapore","France":r"france|paris","Netherlands":r"netherlands|amsterdam",
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
def fetch(url):
    if not domain_ok(url,PROVIDERS.values()): raise ValueError("Non-approved endpoint")
    req=urllib.request.Request(url,headers={"User-Agent":"RoleGlobeJobs/1.0 (public employer job discovery)","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=18) as res:
        if "json" not in res.headers.get("Content-Type","").lower(): raise ValueError("Non-JSON feed")
        body=res.read(8_000_001)
        if len(body)>8_000_000: raise ValueError("Oversized feed")
        return json.loads(body)
def normalize(source, data):
    p=source["provider"]; company=source["company"]; board=source["board"]
    if p=="greenhouse":
        if not isinstance(data,dict) or not isinstance(data.get("jobs"),list): raise ValueError("Invalid greenhouse feed")
        rows=[(r.get("id"),r.get("title"),(r.get("location") or {}).get("name"),r.get("absolute_url"),None) for r in data["jobs"] if isinstance(r,dict)]
    elif p=="lever":
        if not isinstance(data,list): raise ValueError("Invalid lever feed")
        rows=[(r.get("id"),r.get("text"),(r.get("categories") or {}).get("location"),r.get("hostedUrl"),r.get("workplaceType")) for r in data if isinstance(r,dict)]
    else:
        if not isinstance(data,dict) or not isinstance(data.get("jobs"),list): raise ValueError("Invalid ashby feed")
        rows=[(r.get("id"),r.get("title"),r.get("location"),r.get("jobUrl"),"Remote" if r.get("isRemote") else "") for r in data["jobs"] if isinstance(r,dict)]
    allowed={"greenhouse":["greenhouse.io"],"lever":["lever.co"],"ashby":["ashbyhq.com"]}[p]
    results=[]
    for id_, title, location, link, remote in rows:
        if not id_ or not title or not domain_ok(link,allowed): continue
        title=text(title,180);location=text(location or "Location not specified",160)
        country=next((k for k,pattern in COUNTRIES.items() if re.search(r"\b(?:"+pattern+r")\b",location,re.I)),"Other")
        work="Remote" if "remote" in (str(remote)+" "+location).lower() else ("Hybrid" if "hybrid" in location.lower() else "On-site")
        exp="Entry-level" if re.search(r"\b(intern|internship|junior|graduate|entry|new grad)\b",title,re.I) else ("Senior" if re.search(r"\b(senior|principal|staff|director|lead)\b",title,re.I) else "Unspecified")
        idstr=p+":"+board+":"+str(id_);slug=hashlib.sha256(idstr.encode()).hexdigest()[:12]
        results.append({"id":idstr,"slug":slug,"title":title,"company":company,"country":country,"location":location,"category":"IT" if CATEGORIES.search(title) else "Non-IT","workplace":work,"experience":exp,"apply_url":str(link),"source_name":p.title()+" / "+company,"source_key":p+":"+board})
    return results
def main():
    now=dt.datetime.now(UTC);cfg=json.loads(CONFIG.read_text(encoding="utf-8"))["sources"];current=json.loads(DATA.read_text(encoding="utf-8"))
    previous={j["id"]:j for j in current.get("jobs",[]) if isinstance(j,dict) and j.get("id")}
    loaded={};statuses=[];failed=set();success=set()
    for src in cfg:
        if not src.get("enabled"): continue
        name=src["provider"]+":"+src["board"]
        try:
            fetched=normalize(src,fetch(endpoint(src["provider"],src["board"])))
            success.add(name)
            for job in fetched:
                job["last_verified"]=now.isoformat();loaded[job["id"]]=job
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
            if now-last <= dt.timedelta(hours=48):loaded[job["id"]]=job
        except ValueError: pass
    out={"last_updated":now.isoformat(),"source_results":statuses,"jobs":sorted(loaded.values(),key=lambda j:(j["company"],j["title"]))[:1200]}
    DATA.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Published",len(out["jobs"]),"jobs")
    return 0
if __name__=="__main__":sys.exit(main())
