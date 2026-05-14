from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(
    title="University List API",
    description="API tra cứu danh sách trường đại học, cao đẳng, bệnh viện tại Việt Nam",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("university.json", "r", encoding="utf-8") as f:
    data = json.load(f)

universities = data["data"]


@app.get("/")
def root():
    return {
        "status": True,
        "message": "University List API",
        "endpoints": {
            "all": "/api/v1/universities",
            "search": "/api/v1/universities/search?q=...",
            "by_id": "/api/v1/universities/{id}",
            "docs": "/docs",
        },
    }


@app.get("/api/v1/universities")
def get_all():
    return {"status": True, "message": "Success", "count": len(universities), "data": universities}


@app.get("/api/v1/universities/search")
def search(q: str = Query("", description="Từ khóa tìm kiếm (tên trường, mã, v.v.)")):
    q = q.lower().strip()
    if not q:
        return {"status": True, "message": "Success", "count": len(universities), "data": universities}
    results = [
        u for u in universities
        if q in u.get("label", "").lower()
        or q in u.get("code", "").lower()
        or q in u.get("eng", "").lower()
        or q in u.get("shortName", "").lower()
        or q in u.get("location", "").lower()
    ]
    return {"status": True, "message": "Success", "count": len(results), "data": results}


@app.get("/api/v1/universities/{item_id}")
def get_by_id(item_id: str):
    for u in universities:
        if u["value"] == item_id:
            return {"status": True, "message": "Success", "data": u}
    return {"status": False, "message": "Not found"}, 404
