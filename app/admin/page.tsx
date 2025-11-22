"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

const DOME_MAPS: Record<number, string> = {
  4: "/desert_map.png",
  5: "/show_map.png",
  6: "/tropical_map.png",
};

interface Location {
  location_id: number;
  tour_id: number;
  location_name: string;
  position_x: number;
  position_y: number;
}

interface Tour {
  tour_id: number;
  tour_name: string;
  tour_description: string;
  tour_path_image_url: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [selectedDomeId, setSelectedDomeId] = useState<number | "tours">(4);
  const [positionX, setPositionX] = useState<number>(0.5);
  const [positionY, setPositionY] = useState<number>(0.5);
  const [locationName, setLocationName] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourName, setTourName] = useState<string>("");
  const [tourDescription, setTourDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch locations for the selected dome
  useEffect(() => {
    if (selectedDomeId !== "tours") {
      fetchLocations();
    } else {
      fetchTours();
    }
  }, [selectedDomeId]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/locations?tour_id=${selectedDomeId}`);
      const result = await response.json();

      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await fetch("/api/tours");
      const result = await response.json();

      if (result.success) {
        setTours(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height; // Invert Y for bottom-left origin

    setPositionX(Math.max(0, Math.min(1, x)));
    setPositionY(Math.max(0, Math.min(1, y)));
  };

  const handleCreateLocation = async () => {
    if (!locationName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tour_id: selectedDomeId,
          location_name: locationName,
          position_x: positionX,
          position_y: positionY,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLocationName("");
        setPositionX(0.5);
        setPositionY(0.5);
        fetchLocations();
      } else {
        console.error(`Failed to create location: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating location", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchLocations();
      } else {
        console.error(`Failed to delete location: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting location", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = async () => {
    if (!tourName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tour_name: tourName,
          tour_description: tourDescription,
          tour_path_image_url: "",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTourName("");
        setTourDescription("");
        fetchTours();
      } else {
        console.error(`Failed to create tour: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating tour", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <button onClick={() => router.back()} className="back-button">
        ← Back
      </button>
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={selectedDomeId === 4 ? "tab active" : "tab"}
          onClick={() => setSelectedDomeId(4)}
        >
          Desert Dome
        </button>
        <button
          className={selectedDomeId === 5 ? "tab active" : "tab"}
          onClick={() => setSelectedDomeId(5)}
        >
          Show Dome
        </button>
        <button
          className={selectedDomeId === 6 ? "tab active" : "tab"}
          onClick={() => setSelectedDomeId(6)}
        >
          Tropical Dome
        </button>
        <button
          className={selectedDomeId === "tours" ? "tab active" : "tab"}
          onClick={() => setSelectedDomeId("tours")}
        >
          Tours
        </button>
      </div>

      {selectedDomeId !== "tours" && (
        <div className="admin-content">
          <h2>Place Location Marker</h2>
          <p
            style={{
              textAlign: "center",
              color: "var(--dark-green)",
              marginBottom: "1rem",
            }}
          >
            Click anywhere on the map to place the marker
          </p>

          <div className="map-container">
            <div ref={mapRef} className="map-wrapper" onClick={handleMapClick}>
              <img
                src={DOME_MAPS[selectedDomeId as number]}
                alt={`Dome ${selectedDomeId} map`}
                className="dome-map"
              />
              {/* Existing locations */}
              {locations.map((location) => (
                <div
                  key={location.location_id}
                  className="existing-location-marker"
                  style={{
                    left: `${location.position_x * 100}%`,
                    bottom: `${location.position_y * 100}%`,
                  }}
                />
              ))}
              {/* New location being placed */}
              <div
                className="location-marker"
                style={{
                  left: `${positionX * 100}%`,
                  bottom: `${positionY * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="controls">
            <div className="position-display">
              <span>X: {positionX.toFixed(3)}</span>
              <span>Y: {positionY.toFixed(3)}</span>
            </div>
          </div>

          <div className="create-section">
            <input
              type="text"
              placeholder="Location Name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="location-name-input"
            />
            <button
              onClick={handleCreateLocation}
              disabled={loading}
              className="create-button"
            >
              {loading ? "Creating..." : "Create Location"}
            </button>
          </div>

          <div className="locations-list">
            <h3>Existing Locations</h3>
            {locations.length === 0 ? (
              <p className="no-locations">No locations yet for this dome</p>
            ) : (
              <div className="location-items">
                {locations.map((location) => (
                  <div key={location.location_id} className="location-item">
                    <span className="location-id">
                      ID: {location.location_id}
                    </span>
                    <span className="location-name">
                      {location.location_name}
                    </span>
                    <span className="location-coords">
                      ({location.position_x.toFixed(3)},{" "}
                      {location.position_y.toFixed(3)})
                    </span>
                    <button
                      onClick={() =>
                        router.push(`/admin/content/${location.location_id}`)
                      }
                      className="edit-button"
                    >
                      Edit Content
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.location_id)}
                      disabled={loading}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDomeId === "tours" && (
        <div className="admin-content">
          <h2>Create Tour</h2>

          <div className="create-section">
            <input
              type="text"
              placeholder="Tour Name"
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
              className="location-name-input"
            />
            <input
              type="text"
              placeholder="Tour Description"
              value={tourDescription}
              onChange={(e) => setTourDescription(e.target.value)}
              className="location-name-input"
            />
            <button
              onClick={handleCreateTour}
              disabled={loading}
              className="create-button"
            >
              {loading ? "Creating..." : "Create Tour"}
            </button>
          </div>

          <div className="locations-list">
            <h3>Existing Tours</h3>
            {tours.length === 0 ? (
              <p className="no-locations">No tours created yet</p>
            ) : (
              <div className="location-items">
                {tours.map((tour) => (
                  <div key={tour.tour_id} className="location-item">
                    <span className="location-id">ID: {tour.tour_id}</span>
                    <span className="location-name">{tour.tour_name}</span>
                    <span className="location-coords">
                      {tour.tour_description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
