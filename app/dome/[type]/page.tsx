"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "../../components/IntlProvider";
import BackButton from "../../components/BackButton";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "../../../app/LandingPage.css";
import "./DomePage.css";

interface Location {
  location_id: number;
  tour_id: number;
  location_name: string;
  location_label: string;
  position_x: number;
  position_y: number;
}

const MAPS: Record<string, string> = {
  desert: "/desert_map.png",
  show: "/show_map.png",
  tropical: "/tropical_map.png",
};

export default function DomePage({ params }: { params: { type: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("dome");
  const { languageId } = useLocale();
  const tourId = searchParams.get("route_id");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  const mapSrc = MAPS[params.type] || MAPS["desert"];

  const type = params.type;
  const title = t(`${type}Title`);
  const description = t(`${type}Description`);

  useEffect(() => {
    if (tourId) {
      fetchLocations();
    }
  }, [tourId]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/locations?tour_id=${tourId}`);
      const result = await response.json();

      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="button-controls">
        <BackButton />
      </div>
      <h2 className="dome-page-title">{title}</h2>
      <div className="mapContainer">
        <TransformWrapper
          doubleClick={{ disabled: false }}
          wheel={{ disabled: false }}
          panning={{ disabled: false }}
          zoomAnimation={{ disabled: false }}
          minScale={1}
          maxScale={4}
        >
          <TransformComponent>
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src={mapSrc}
                alt={`${params.type} map`}
                style={{ width: "100%", display: "block", touchAction: "none" }}
              />
              {locations.map((location) => (
                <div
                  key={location.location_id}
                  className="mapMarker"
                  style={{
                    left: `${location.position_x * 100}%`,
                    bottom: `${location.position_y * 100}%`,
                  }}
                  title={location.location_name}
                  onClick={() =>
                    router.push(
                      `/info/${location.location_id}?language_id=${languageId}`
                    )
                  }
                >
                  <div className="markerDot">
                    {showLabels && (
                      <p className="markerLabel">{location.location_label}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
        {!loading && (
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="toggle-labels-button"
          >
            {showLabels ? t("hideLabels") : t("showLabels")}
          </button>
        )}
      </div>

      <p className="dome-page-description">{description}</p>
    </>
  );
}
