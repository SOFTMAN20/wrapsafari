'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Trees } from 'lucide-react';

interface TreeLocation {
  latitude: number;
  longitude: number;
  trees: number;
  location_name: string;
}

interface TreeMapClientProps {
  locations: TreeLocation[];
  mapboxToken: string;
}

export function TreeMapClient({ locations, mapboxToken }: TreeMapClientProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxToken) return;

    // Set access token
    mapboxgl.accessToken = mapboxToken;

    // Calculate center point from locations
    let center: [number, number] = [37.3466, -3.3869]; // Default: Kilimanjaro
    let zoom = 8;

    if (locations.length > 0) {
      const avgLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
      const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
      center = [avgLng, avgLat];
      zoom = locations.length === 1 ? 12 : 10;
    }

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for map to load
    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup on unmount
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Remove map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]); // Only re-initialize if token changes

  // Add markers when map loads or locations change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'tree-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      
      // Create marker HTML
      el.innerHTML = `
        <div style="position: relative;">
          <div style="
            width: 40px;
            height: 40px;
            background-color: #16a34a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>
              <path d="M7 16v6"/>
              <path d="M13 19v3"/>
              <path d="M12 19h0a3 3 0 0 1 0-6h0c0-1.3.8-2.4 2-2.8V10a3 3 0 0 1 6 0v.2a3 3 0 0 1-1 5.8v0h-3v0h0a3 3 0 0 1-4 0Z"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #F4C542;
            color: #1B4D3E;
            font-weight: bold;
            font-size: 12px;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${location.trees}
          </div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>
              <path d="M7 16v6"/>
              <path d="M13 19v3"/>
              <path d="M12 19h0a3 3 0 0 1 0-6h0c0-1.3.8-2.4 2-2.8V10a3 3 0 0 1 6 0v.2a3 3 0 0 1-1 5.8v0h-3v0h0a3 3 0 0 1-4 0Z"/>
            </svg>
            <h3 style="font-weight: bold; color: #1B4D3E; font-size: 14px; margin: 0;">
              ${location.location_name}
            </h3>
          </div>
          <div style="font-size: 12px; color: #57534e; margin-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Trees Planted:</span>
              <span style="font-weight: bold; color: #16a34a;">${location.trees}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>CO₂ Offset:</span>
              <span style="font-weight: bold; color: #2563eb;">${location.trees * 22} kg/year</span>
            </div>
            <div style="padding-top: 8px; border-top: 1px solid #e7e5e4; font-size: 10px; color: #78716c;">
              <div>Lat: ${location.latitude.toFixed(4)}</div>
              <div>Lng: ${location.longitude.toFixed(4)}</div>
            </div>
          </div>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if there are multiple locations
    if (locations.length > 1 && mapRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(loc => {
        bounds.extend([loc.longitude, loc.latitude]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [locations, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-forest/20 bg-parchment flex items-center justify-center">
        <div className="text-center p-8">
          <Trees className="w-12 h-12 text-forest/40 mx-auto mb-4" />
          <h3 className="font-bold text-forest mb-2">Map Configuration Required</h3>
          <p className="text-sm text-stone">
            Mapbox token is missing. Please configure NEXT_PUBLIC_MAPBOX_TOKEN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-forest/20 shadow-lg"
    />
  );
}
