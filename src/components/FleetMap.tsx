import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { io, type Socket } from "socket.io-client";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export type FleetMapVehicle = {
  id: string;
  label?: string;
  lat: number;
  lng: number;
};

type LiveTelemetryPayload = {
  imei?: string;
  lat?: number;
  lon?: number;
  lng?: number;
  timestamp?: number;
};

const defaultMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function FleetMap(props: {
  className?: string;
  center?: [number, number];
  zoom?: number;
  vehicles?: FleetMapVehicle[];
  tileUrl?: string;
  mapRef?: MutableRefObject<L.Map | null>;
  onZoomChange?: (zoom: number) => void;
  backendUrl?: string;
}) {
  const center = props.center ?? [28.6139, 77.209];
  const zoom = props.zoom ?? 11;
  const providedVehicles = props.vehicles;
  const tileUrl = props.tileUrl ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const [liveById, setLiveById] = useState<Record<string, FleetMapVehicle>>({});
  const socketRef = useRef<Socket | null>(null);

  const backendUrl =
    props.backendUrl ??
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_BACKEND_URL
      ? (import.meta as any).env.VITE_BACKEND_URL
      : "http://localhost:8000");

  useEffect(() => {
    // If caller supplies vehicles, we don't auto-connect.
    if (providedVehicles) return;

    const socket = io(backendUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const onUpdate = (data: unknown) => {
      try {
        const parsed: LiveTelemetryPayload =
          typeof data === "string" ? JSON.parse(data) : (data as any);

        const id = parsed.imei ? String(parsed.imei) : undefined;
        const lat = typeof parsed.lat === "number" ? parsed.lat : undefined;
        const lng = typeof parsed.lon === "number" ? parsed.lon : typeof parsed.lng === "number" ? parsed.lng : undefined;
        if (!id || lat == null || lng == null) return;

        setLiveById((prev) => ({
          ...prev,
          [id]: { id, label: id, lat, lng },
        }));
      } catch {
        // ignore bad payloads
      }
    };

    socket.on("vehicle_update", onUpdate);

    return () => {
      socket.off("vehicle_update", onUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl, providedVehicles]);

  const vehicles = useMemo(() => {
    if (providedVehicles) return providedVehicles;
    return Object.values(liveById);
  }, [providedVehicles, liveById]);

  return (
    <div className={props.className}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="z-0"
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => {
          if (props.mapRef) props.mapRef.current = map;
          props.onZoomChange?.(map.getZoom());
          map.on("zoomend", () => props.onZoomChange?.(map.getZoom()));
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={defaultMarkerIcon}
          >
            <Popup>
              <div className="text-sm text-slate-900">
                <div className="font-semibold">{vehicle.label ?? vehicle.id}</div>
                <div className="text-xs text-slate-600">
                  {vehicle.lat.toFixed(5)}, {vehicle.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
