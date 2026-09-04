import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Parcel } from '../../data/mockParcels';

interface ParcelMapProps {
  parcels: Parcel[];
  selectedParcelId: string | null;
  onParcelSelect: (parcelId: string) => void;
}

// Component to fit map bounds whenever the parcels change
const FitBounds: React.FC<{ parcels: Parcel[] }> = ({ parcels }) => {
  const map = useMap();

  useEffect(() => {
    if (parcels.length === 0) return;
    const allCoords = parcels.flatMap(p =>
      p.geometry.coordinates[0].map(c => [c[1], c[0]] as [number, number]),
    );
    if (allCoords.length > 0) {
      map.fitBounds(allCoords as [number, number][], { padding: [40, 40] });
    }
  }, [map, parcels]);

  return null;
};

export const ParcelMap: React.FC<ParcelMapProps> = ({ parcels, selectedParcelId, onParcelSelect }) => {
  const geojsonData = {
    type: 'FeatureCollection' as const,
    features: parcels.map(parcel => ({
      type: 'Feature' as const,
      id: parcel.id,
      geometry: parcel.geometry,
      properties: {
        id: parcel.id,
        name: parcel.name,
        ...parcel.properties,
      },
    })),
  };

  const getStyle = (feature: GeoJSON.Feature | undefined) => {
    if (!feature) return {};
    const props = feature.properties as Parcel['properties'] & { id: string };
    const isSelected = props.id === selectedParcelId;
    const isFlagged = props.status === 'flagged';

    return {
      fillColor: isFlagged ? '#FBBF24' : '#4ADE80',
      fillOpacity: isSelected ? 0.35 : 0.15,
      color: isSelected ? '#fff' : isFlagged ? '#FBBF24' : '#4ADE80',
      weight: isSelected ? 2.5 : 1.5,
      opacity: isSelected ? 1 : 0.6,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties as { id: string; name: string };

    layer.on({
      click: (_e: LeafletMouseEvent) => {
        onParcelSelect(props.id);
      },
      mouseover: (e: LeafletMouseEvent) => {
        const target = e.target;
        target.setStyle({ fillOpacity: 0.3, weight: 2.5, opacity: 1 });
      },
      mouseout: (e: LeafletMouseEvent) => {
        const target = e.target;
        const isSelected = props.id === selectedParcelId;
        target.setStyle({
          fillOpacity: isSelected ? 0.35 : 0.15,
          weight: isSelected ? 2.5 : 1.5,
          opacity: isSelected ? 1 : 0.6,
        });
      },
    });

    layer.bindTooltip(
      `<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 4px;">
        <strong>${props.id}</strong><br/>${props.name}
      </div>`,
      { className: 'parcel-tooltip', direction: 'top', offset: [0, -8] },
    );
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-default)' }}>
      <MapContainer
        center={[26.8485, 80.9470]}
        zoom={16}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
        />
        <GeoJSON
          key={`${selectedParcelId || 'default'}-${parcels.length}`}
          data={geojsonData as GeoJSON.FeatureCollection}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
        <FitBounds parcels={parcels} />
      </MapContainer>
    </div>
  );
};
