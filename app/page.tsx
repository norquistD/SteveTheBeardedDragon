"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import "./LandingPage.css";

// Marker interface
export interface MapMarker {
  id: string;
  label?: string;
  xPercent: number;
  yPercent: number;
  color?: string;
  onClick?: () => void;
}

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations();

  // Dome marker positions (estimated visually from the provided map)
  const markers: MapMarker[] = [
    {
      id: "floral-show",
      label: t("domes.floral"),
      xPercent: 24,
      yPercent: 24,
      color: "#b96fd9",
      onClick: () => router.push("/dome/show?route_id=5"),
    },
    {
      id: "arid-desert",
      label: t("domes.desert"),
      xPercent: 72.5,
      yPercent: 26,
      color: "#e6d36f",
      onClick: () => router.push("/dome/desert?route_id=4"),
    },
    {
      id: "tropical-jungle",
      label: t("domes.tropical"),
      xPercent: 73,
      yPercent: 76,
      color: "#3a7d3a",
      onClick: () => router.push("/dome/tropical?route_id=6"),
    },
  ];
  return (
    <>
      <h2
        style={{
          textAlign: "center",
          margin: "1.5rem 0 1rem 0",
          fontSize: "1.5rem",
          color: "var(--dark-green)",
        }}
      >
        {t("landing.title")} <br /> {t("landing.subtitle")}
      </h2>
      <div className="mapContainer">
        <TransformWrapper
          doubleClick={{ disabled: false }}
          wheel={{ disabled: false }}
          panning={{ disabled: false }}
          zoomAnimation={{ disabled: false }}
          minScale={0.5}
          maxScale={4}
        >
          <TransformComponent>
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src="/complete_map.png"
                alt="Complete Map"
                style={{ width: "100%", display: "block", touchAction: "none" }}
              />
              {/* Dome Markers */}
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  onClick={marker.onClick}
                  className="dome-marker"
                  style={{
                    top: `${marker.yPercent}%`,
                    left: `${marker.xPercent}%`,
                  }}
                  title={marker.label}
                />
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      <h3
        style={{
          textAlign: "center",
          margin: "1.5rem 0",
          fontSize: "1.25rem",
          color: "var(--dark-green)",
        }}
      >
        {t("landing.guidedTour")}
      </h3>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            margin: "16px 0",
            padding: "8px 20px",
            fontSize: 18,
            borderRadius: 8,
            cursor: "pointer",
          }}
          onClick={() => router.push("/info")}
        >
          {t("landing.infoPage")}
        </button>
        <button
          style={{
            margin: "16px 0",
            padding: "8px 20px",
            fontSize: 18,
            borderRadius: 8,
            cursor: "pointer",
            backgroundColor: "var(--dark-green)",
            color: "var(--light-text)",
            border: "none",
          }}
          onClick={() => router.push("/admin")}
        >
          {t("landing.adminDashboard")}
        </button>
      </div>
    </>
  );
}
