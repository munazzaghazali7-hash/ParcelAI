import uuid
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from models import (
    Parcel, ParcelProperties, Geometry, ParcelActivity,
    UploadResponse, ProcessingStatus, DiscrepancyReport, ParcelStatus
)

app = FastAPI(
    title="ParcelAI API",
    description="AI-based automated urban parcel mapping and cadastral feature extraction",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mock Data ───
MOCK_PARCELS = [
    Parcel(
        id="UP-0472",
        name="Plot 47/2 — Residential",
        geometry=Geometry(type="Polygon", coordinates=[[[80.9462, 26.8467], [80.9472, 26.8467], [80.9472, 26.8477], [80.9462, 26.8477], [80.9462, 26.8467]]]),
        properties=ParcelProperties(area_sqm=212.4, perimeter_m=58.6, confidence=0.94, land_use="Residential", status=ParcelStatus.verified, discrepancy_flag=False),
        activity=[
            ParcelActivity(action="Boundary auto-detected via AI segmentation", timestamp="2026-08-30T14:22:00Z", type="detection"),
            ParcelActivity(action="Compared against existing cadastral record", timestamp="2026-08-30T14:22:45Z", type="comparison"),
            ParcelActivity(action="Verified — no discrepancy found", timestamp="2026-08-30T14:23:10Z", type="verification"),
        ],
    ),
    Parcel(
        id="UP-0473",
        name="Plot 47/3 — Agricultural",
        geometry=Geometry(type="Polygon", coordinates=[[[80.9475, 26.8467], [80.9490, 26.8467], [80.9490, 26.8480], [80.9475, 26.8480], [80.9475, 26.8467]]]),
        properties=ParcelProperties(area_sqm=487.2, perimeter_m=89.4, confidence=0.91, land_use="Agricultural", status=ParcelStatus.flagged, discrepancy_flag=True, discrepancy_description="Boundary shifted 1.2m from existing record", shift_distance_m=1.2),
        activity=[
            ParcelActivity(action="Boundary auto-detected via AI segmentation", timestamp="2026-08-30T14:22:00Z", type="detection"),
            ParcelActivity(action="Compared against existing cadastral record", timestamp="2026-08-30T14:22:45Z", type="comparison"),
            ParcelActivity(action="Flagged — boundary shift detected (1.2m)", timestamp="2026-08-30T14:23:15Z", type="flag"),
        ],
    ),
    Parcel(
        id="UP-0474",
        name="Plot 47/4 — Commercial",
        geometry=Geometry(type="Polygon", coordinates=[[[80.9450, 26.8480], [80.9465, 26.8480], [80.9465, 26.8492], [80.9450, 26.8492], [80.9450, 26.8480]]]),
        properties=ParcelProperties(area_sqm=324.8, perimeter_m=72.1, confidence=0.97, land_use="Commercial", status=ParcelStatus.verified, discrepancy_flag=False),
        activity=[
            ParcelActivity(action="Boundary auto-detected via AI segmentation", timestamp="2026-08-30T14:22:00Z", type="detection"),
            ParcelActivity(action="Compared against existing cadastral record", timestamp="2026-08-30T14:22:48Z", type="comparison"),
            ParcelActivity(action="Verified — no discrepancy found", timestamp="2026-08-30T14:23:08Z", type="verification"),
        ],
    ),
]


# ─── Endpoints ───

@app.get("/")
async def root():
    return {"service": "ParcelAI API", "version": "0.1.0", "status": "running"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_imagery(file: UploadFile = File(...)):
    """Upload drone imagery for parcel extraction."""
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    return UploadResponse(
        job_id=job_id,
        filename=file.filename or "unknown",
        size_bytes=0,
        status="processing",
    )


@app.get("/api/parcels")
async def get_parcels():
    """Return all extracted parcels as a GeoJSON FeatureCollection."""
    features = []
    for p in MOCK_PARCELS:
        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": p.geometry.model_dump(),
            "properties": {
                "id": p.id,
                "name": p.name,
                **p.properties.model_dump(),
            },
        })
    return {"type": "FeatureCollection", "features": features}


@app.get("/api/parcels/{parcel_id}", response_model=Parcel)
async def get_parcel(parcel_id: str):
    """Return a single parcel by ID."""
    for p in MOCK_PARCELS:
        if p.id == parcel_id:
            return p
    return {"error": "Parcel not found"}


@app.get("/api/discrepancies")
async def get_discrepancies():
    """Return all flagged parcels with discrepancies."""
    flagged = [p for p in MOCK_PARCELS if p.properties.discrepancy_flag]
    return [
        DiscrepancyReport(
            parcel_id=p.id,
            description=p.properties.discrepancy_description or "Boundary deviation detected",
            confidence=p.properties.confidence,
            shift_distance_m=p.properties.shift_distance_m or 0.0,
            status="pending_review",
        )
        for p in flagged
    ]


@app.get("/api/status/{job_id}", response_model=ProcessingStatus)
async def get_processing_status(job_id: str):
    """Get processing status for a job (mock — always returns 'done')."""
    return ProcessingStatus(
        job_id=job_id,
        status="done",
        step=4,
        total_steps=4,
        parcels_detected=len(MOCK_PARCELS),
        discrepancies=sum(1 for p in MOCK_PARCELS if p.properties.discrepancy_flag),
    )
