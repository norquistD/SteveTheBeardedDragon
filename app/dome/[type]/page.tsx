"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const MAPS: Record<string, string> = {
  desert: "/desert_map.png",
  show: "/show_map.png",
  tropical: "/tropical_map.png",
};

export default function DomePage({ params }: { params: { type: string } }) {
  const mapSrc = MAPS[params.type] || MAPS["desert"];
  return (
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
  );
}
