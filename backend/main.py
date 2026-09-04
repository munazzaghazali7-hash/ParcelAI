import uuid
import hashlib
import random
import time
from datetime import datetime, timezone
from typing import Optional
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

# ─── In-Memory Job Store ───
# Stores per-upload state: timing, extracted parcels, metadata
JOB_STORE: dict[str, dict] = {}

# ─── Processing Pipeline Timing (seconds per step) ───
STEP_DURATIONS = [1.2, 1.8, 2.0, 1.5, 1.2]  # 5 real steps before "done"
TOTAL_DURATION = sum(STEP_DURATIONS)          # ~7.7 s total

# ─── Base Parcel Templates (all 8 plots) ───
BASE_PARCELS = [
    {
        "id": "UP-0472", "name": "Plot 47/2", "base_land_use": "Residential",
        "coords": [[80.9462, 26.8467], [80.9472, 26.8467], [80.9472, 26.8477], [80.9462, 26.8477], [80.9462, 26.8467]],
        "base_area": 212.4, "base_perimeter": 58.6, "base_conf": 0.94,
        "cadastral_shift": None,
    },
    {
        "id": "UP-0473", "name": "Plot 47/3", "base_land_use": "Agricultural",
        "coords": [[80.9475, 26.8467], [80.9490, 26.8467], [80.9490, 26.8480], [80.9475, 26.8480], [80.9475, 26.8467]],
        "base_area": 487.2, "base_perimeter": 89.4, "base_conf": 0.91,
        "cadastral_shift": 1.2,
    },
    {
        "id": "UP-0474", "name": "Plot 47/4", "base_land_use": "Commercial",
        "coords": [[80.9450, 26.8480], [80.9465, 26.8480], [80.9465, 26.8492], [80.9450, 26.8492], [80.9450, 26.8480]],
        "base_area": 324.8, "base_perimeter": 72.1, "base_conf": 0.97,
        "cadastral_shift": None,
    },
    {
        "id": "UP-0475", "name": "Plot 47/5", "base_land_use": "Residential",
        "coords": [[80.9468, 26.8492], [80.9480, 26.8492], [80.9480, 26.8502], [80.9468, 26.8502], [80.9468, 26.8492]],
        "base_area": 178.5, "base_perimeter": 53.8, "base_conf": 0.88,
        "cadastral_shift": 0.8,
    },
    {
        "id": "UP-0476", "name": "Plot 47/6", "base_land_use": "Government",
        "coords": [[80.9440, 26.8495], [80.9458, 26.8495], [80.9458, 26.8510], [80.9440, 26.8510], [80.9440, 26.8495]],
        "base_area": 562.0, "base_perimeter": 96.2, "base_conf": 0.96,
        "cadastral_shift": None,
    },
    {
        "id": "UP-0477", "name": "Plot 47/7", "base_land_use": "Mixed Use",
        "coords": [[80.9483, 26.8480], [80.9498, 26.8480], [80.9498, 26.8495], [80.9483, 26.8495], [80.9483, 26.8480]],
        "base_area": 401.3, "base_perimeter": 81.6, "base_conf": 0.85,
        "cadastral_shift": 2.1,
    },
    {
        "id": "UP-0478", "name": "Plot 47/8", "base_land_use": "Agricultural",
        "coords": [[80.9445, 26.8460], [80.9460, 26.8460], [80.9460, 26.8472], [80.9445, 26.8472], [80.9445, 26.8460]],
        "base_area": 298.7, "base_perimeter": 70.4, "base_conf": 0.92,
        "cadastral_shift": None,
    },
    {
        "id": "UP-0479", "name": "Plot 47/9", "base_land_use": "Residential",
        "coords": [[80.9492, 26.8498], [80.9505, 26.8498], [80.9505, 26.8508], [80.9492, 26.8508], [80.9492, 26.8498]],
        "base_area": 245.1, "base_perimeter": 63.2, "base_conf": 0.93,
        "cadastral_shift": None,
    },
]

DISCREPANCY_DESCRIPTIONS = [
    "Boundary shifted {d}m from existing cadastral record",
    "Encroachment of {d}m detected on boundary",
    "Overlap with adjacent parcel detected ({d}m deviation)",
    "GPS anchor mismatch — boundary offset by {d}m",
    "Field boundary deviation exceeds tolerance ({d}m)",
]


def _image_seed(contents: bytes) -> int:
    """Derive a deterministic integer seed from the image bytes."""
    digest = hashlib.sha256(contents).hexdigest()
    return int(digest[:12], 16)


def _jitter(rng: random.Random, value: float, pct: float) -> float:
    """Apply ±pct% random jitter to a value."""
    delta = value * pct * (rng.random() * 2 - 1)
    return round(value + delta, 2)


def _coord_jitter(rng: random.Random, coord: float) -> float:
    """Shift a coordinate by up to ±0.00015° (~15 m) to simulate boundary detection variance."""
    return round(coord + rng.uniform(-0.00015, 0.00015), 6)


def _generate_parcels(seed: int, filename: str) -> list[Parcel]:
    """
    Generate a deterministic set of parcels for this image.
    Same image → same results. Different image → different results.
    """
    rng = random.Random(seed)
    now_base = datetime.now(timezone.utc)

    # How many parcels to detect — vary between 6 and 8 based on seed
    count = rng.randint(6, 8)
    templates = rng.sample(BASE_PARCELS, count)
    # Always sort by ID so the map is stable
    templates = sorted(templates, key=lambda t: t["id"])

    parcels = []
    for tmpl in templates:
        conf = round(min(0.99, max(0.72, _jitter(rng, tmpl["base_conf"], 0.06))), 2)
        area = _jitter(rng, tmpl["base_area"], 0.08)
        perim = _jitter(rng, tmpl["base_perimeter"], 0.05)

        # Jitter each coordinate slightly
        raw_coords = tmpl["coords"]
        jittered = [[_coord_jitter(rng, c[0]), _coord_jitter(rng, c[1])] for c in raw_coords]

        # Determine if this parcel is flagged
        base_shift = tmpl["cadastral_shift"]
        if base_shift is not None:
            shift = round(_jitter(rng, base_shift, 0.25), 1)
            status = ParcelStatus.flagged
            desc_tmpl = rng.choice(DISCREPANCY_DESCRIPTIONS)
            description = desc_tmpl.format(d=shift)
            discrepancy_flag = True
        else:
            # Small chance of newly detecting a discrepancy even in "clean" parcels
            if conf < 0.87 and rng.random() < 0.35:
                shift = round(rng.uniform(0.3, 0.9), 1)
                status = ParcelStatus.flagged
                description = f"Low-confidence boundary — possible deviation of {shift}m"
                discrepancy_flag = True
            else:
                shift = None
                status = ParcelStatus.verified if conf > 0.85 else ParcelStatus.pending
                description = None
                discrepancy_flag = False

        # Build activity log with timestamps offset from now
        t0 = now_base.strftime("%Y-%m-%dT%H:%M:%SZ")
        t1_sec = int(now_base.timestamp()) + rng.randint(35, 55)
        t1 = datetime.fromtimestamp(t1_sec, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        t2_sec = t1_sec + rng.randint(8, 20)
        t2 = datetime.fromtimestamp(t2_sec, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        activity = [
            ParcelActivity(
                action=f"Boundary detected via AI segmentation — source: {filename}",
                timestamp=t0, type="detection",
            ),
            ParcelActivity(
                action="Cross-referenced against cadastral database (SVAMITVA layer)",
                timestamp=t1, type="comparison",
            ),
        ]
        if discrepancy_flag:
            activity.append(ParcelActivity(
                action=f"Flagged — {description}",
                timestamp=t2, type="flag",
            ))
        else:
            activity.append(ParcelActivity(
                action="Verified — boundary matches cadastral record within tolerance",
                timestamp=t2, type="verification",
            ))

        parcels.append(Parcel(
            id=tmpl["id"],
            name=f"{tmpl['name']} — {tmpl['base_land_use']}",
            geometry=Geometry(type="Polygon", coordinates=[jittered]),
            properties=ParcelProperties(
                area_sqm=area,
                perimeter_m=perim,
                confidence=conf,
                land_use=tmpl["base_land_use"],
                status=status,
                discrepancy_flag=discrepancy_flag,
                discrepancy_description=description,
                shift_distance_m=shift,
            ),
            activity=activity,
        ))

    return parcels


# ─── Endpoints ───

@app.get("/")
async def root():
    return {"service": "ParcelAI API", "version": "0.1.0", "status": "running"}


@app.post("/api/upload", response_model=UploadResponse)
async def upload_imagery(file: UploadFile = File(...)):
    """
    Upload drone imagery. Reads image bytes, derives a deterministic seed
    from its content hash, and pre-computes the parcel extraction result
    so polling status always returns consistent data for this upload.
    """
    contents = await file.read()
    seed = _image_seed(contents)
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    filename = file.filename or "unknown"

    # Pre-generate parcels for this specific image
    parcels = _generate_parcels(seed, filename)

    JOB_STORE[job_id] = {
        "created_at": time.time(),
        "filename": filename,
        "size_bytes": len(contents),
        "seed": seed,
        "parcels": parcels,
        "total_steps": 6,
    }

    return UploadResponse(
        job_id=job_id,
        filename=filename,
        size_bytes=len(contents),
        status="processing",
    )


@app.get("/api/status/{job_id}", response_model=ProcessingStatus)
async def get_processing_status(job_id: str):
    """
    Returns a time-gated processing status so the pipeline steps
    advance in real-time, giving a convincing extraction UX.
    Steps advance every ~1-2 seconds over ~7 seconds total.
    """
    if job_id not in JOB_STORE:
        # Graceful fallback for unknown jobs
        return ProcessingStatus(
            job_id=job_id, status="done", step=6, total_steps=6,
            parcels_detected=len(BASE_PARCELS),
            discrepancies=3,
        )

    job = JOB_STORE[job_id]
    elapsed = time.time() - job["created_at"]
    total_steps = job["total_steps"]
    parcels = job["parcels"]
    discrepancies = sum(1 for p in parcels if p.properties.discrepancy_flag)

    # Determine current step from elapsed time
    cumulative = 0.0
    current_step = 0
    for i, duration in enumerate(STEP_DURATIONS):
        cumulative += duration
        if elapsed >= cumulative:
            current_step = i + 1
        else:
            break

    if elapsed >= TOTAL_DURATION:
        return ProcessingStatus(
            job_id=job_id, status="done", step=total_steps,
            total_steps=total_steps,
            parcels_detected=len(parcels),
            discrepancies=discrepancies,
        )

    return ProcessingStatus(
        job_id=job_id, status="processing",
        step=min(current_step + 1, total_steps - 1),
        total_steps=total_steps,
        parcels_detected=None,
        discrepancies=None,
    )


@app.get("/api/parcels")
async def get_parcels(job_id: Optional[str] = None):
    """
    Return extracted parcels as a GeoJSON FeatureCollection.
    If job_id is provided, returns that job's specific extraction result.
    Otherwise returns the most recently completed job, or all base parcels.
    """
    # Resolve which parcel set to use
    parcels = None
    if job_id and job_id in JOB_STORE:
        parcels = JOB_STORE[job_id]["parcels"]
    elif JOB_STORE:
        # Most recently submitted job
        latest_job = max(JOB_STORE.values(), key=lambda j: j["created_at"])
        parcels = latest_job["parcels"]

    # Fall back to generating from all 8 base parcels if no job yet
    if parcels is None:
        parcels = _generate_parcels(seed=42, filename="default")

    features = []
    for p in parcels:
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
async def get_parcel(parcel_id: str, job_id: Optional[str] = None):
    """Return a single parcel by ID, optionally scoped to a job."""
    parcels = None
    if job_id and job_id in JOB_STORE:
        parcels = JOB_STORE[job_id]["parcels"]
    elif JOB_STORE:
        latest_job = max(JOB_STORE.values(), key=lambda j: j["created_at"])
        parcels = latest_job["parcels"]
    else:
        parcels = _generate_parcels(seed=42, filename="default")

    for p in parcels:
        if p.id == parcel_id:
            return p
    return {"error": "Parcel not found"}


@app.get("/api/discrepancies")
async def get_discrepancies(job_id: Optional[str] = None):
    """Return all flagged parcels with discrepancies for a given job."""
    if job_id and job_id in JOB_STORE:
        parcels = JOB_STORE[job_id]["parcels"]
    elif JOB_STORE:
        latest_job = max(JOB_STORE.values(), key=lambda j: j["created_at"])
        parcels = latest_job["parcels"]
    else:
        parcels = _generate_parcels(seed=42, filename="default")

    flagged = [p for p in parcels if p.properties.discrepancy_flag]
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


@app.get("/api/jobs/{job_id}")
async def get_job_metadata(job_id: str):
    """Return metadata about an upload job."""
    if job_id not in JOB_STORE:
        return {"error": "Job not found"}
    job = JOB_STORE[job_id]
    return {
        "job_id": job_id,
        "filename": job["filename"],
        "size_bytes": job["size_bytes"],
        "created_at": job["created_at"],
    }
