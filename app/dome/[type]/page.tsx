"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "../../../app/LandingPage.css";
import "./DomePage.css";

const MAPS: Record<string, string> = {
  desert: "/desert_map.png",
  show: "/show_map.png",
  tropical: "/tropical_map.png",
};

const DOME_TITLES: Record<string, string> = {
  desert: "Desert Dome",
  show: "Floral Show Dome",
  tropical: "Tropical Dome",
};

const DOME_DESCRIPTIONS: Record<string, string> = {
  desert:
    "The Desert Dome is divided geographically into Old World and New World habitats. Visit the Sonoran, Northern Mexico, and even mountainous South American desert plantings.",
  show: "The Mitchell Park Horticultural Conservatory’s Show Dome is transformed five times each year. Each Show Dome display has a specific theme, generally categorized as historical, cultural or fantasy, and is chosen at least a year in advance.",
  tropical:
    "As you tour the Tropical Dome, take care to look up, as well as from side to side. In addition to the plants, there are several species of tropical finches, koi fish, frogs and toads, and even a world of insects living here.",
};

export default function DomePage({ params }: { params: { type: string } }) {
  const mapSrc = MAPS[params.type] || MAPS["desert"];
  const title = DOME_TITLES[params.type] || "Dome";
  const description = DOME_DESCRIPTIONS[params.type] || "";

  return (
    <>
      <h2 className="dome-page-title">{title}</h2>
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
                src={mapSrc}
                alt={`${params.type} map`}
                style={{ width: "100%", display: "block", touchAction: "none" }}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      <p className="dome-page-description">{description}</p>
    </>
  );
}
