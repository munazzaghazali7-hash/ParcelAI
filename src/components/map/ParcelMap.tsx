import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getParcelGeoJSON, type Parcel } from '../../data/mockParcels';

interface ParcelMapProps {
  selectedParcelId: string | null;
  onParcelSelect: (parcelId: string) => void;
}

// Component to fit map bounds when parcels load
const FitBounds: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const geojson = getParcelGeoJSON();
    if (geojson.features.length > 0) {
      const allCoords = geojson.features.flatMap(f =>
        f.geometry.coordinates[0].map(c => [c[1], c[0]] as [number, number])
      );
      if (allCoords.length > 0) {
        const latLngBounds = allCoords as [number, number][];
        map.fitBounds(latLngBounds, { padding: [40, 40] });
      }
    }
  }, [map]);

  return null;
};

export const ParcelMap: React.FC<ParcelMapProps> = ({ selectedParcelId, onParcelSelect }) => {
  const geojsonData = getParcelGeoJSON();

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
        target.setStyle({
          fillOpacity: 0.3,
          weight: 2.5,
          opacity: 1,
        });
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
      {
        className: 'parcel-tooltip',
        direction: 'top',
        offset: [0, -8],
      }
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
          key={selectedParcelId || 'default'}
          data={geojsonData as GeoJSON.FeatureCollection}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
        <FitBounds />
      </MapContainer>
    </div>
  );
};
