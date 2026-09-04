from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ParcelStatus(str, Enum):
    verified = "verified"
    flagged = "flagged"
    pending = "pending"


class GeometryType(str, Enum):
    polygon = "Polygon"
    multi_polygon = "MultiPolygon"


class Geometry(BaseModel):
    """PostGIS-ready geometry model. In production, this would map to
    a PostGIS geometry column using GeoAlchemy2."""
    type: GeometryType = GeometryType.polygon
    coordinates: list  # GeoJSON coordinates array


class ParcelProperties(BaseModel):
    area_sqm: float
    perimeter_m: float
    confidence: float
    land_use: str
    status: ParcelStatus
    discrepancy_flag: bool = False
    discrepancy_description: Optional[str] = None
    shift_distance_m: Optional[float] = None
    owner_name: Optional[str] = None


class ParcelActivity(BaseModel):
    action: str
    timestamp: str
    type: str  # detection, comparison, flag, verification


class Parcel(BaseModel):
    """PostGIS-ready parcel model.
    In production:
    - `geometry` maps to a PostGIS `geometry(Polygon, 4326)` column
    - Spatial indexes would be created via `CREATE INDEX ... USING GIST`
    - Queries like ST_Contains, ST_Intersects used for spatial analysis
    """
    id: str
    name: str
    geometry: Geometry
    properties: ParcelProperties
    activity: list[ParcelActivity] = []


class ProcessingStatus(BaseModel):
    job_id: str
    status: str  # uploading, orthomosaic_check, segmentation, done
    step: int
    total_steps: int = 6
    parcels_detected: Optional[int] = None
    discrepancies: Optional[int] = None


class UploadResponse(BaseModel):
    job_id: str
    filename: str
    size_bytes: int
    status: str = "processing"


class DiscrepancyReport(BaseModel):
    parcel_id: str
    description: str
    confidence: float
    shift_distance_m: float
    status: str = "pending_review"
