"use client";

import { useEffect, useRef, useState } from "react";

// A lightweight SVG world map that highlights visited countries.
// Uses a simplified GeoJSON-like approach with inline path data for common countries.
// For a full world map we fetch the world-atlas topojson and project it client-side.

interface WorldMapProps {
  visitedCountries: string[]; // ISO 3166-1 alpha-3 codes e.g. ["JPN", "USA"]
}

interface CountryFeature {
  id: string;
  name: string;
  d: string;
}

export function WorldMap({ visitedCountries }: WorldMapProps) {
  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [{ default: topojson }, world] = await Promise.all([
          import("topojson-client"),
          fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json()),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geo = (topojson as any).feature(world, world.objects.countries) as {
          type: string;
          features: { id: string; type: string; geometry: { type: string; coordinates: unknown } }[];
        };

        // Map numeric IDs to country names using a simple lookup
        const idToName: Record<string, string> = {
          "004": "AFG", "008": "ALB", "012": "DZA", "024": "AGO", "032": "ARG",
          "036": "AUS", "040": "AUT", "050": "BGD", "056": "BEL", "076": "BRA",
          "100": "BGR", "116": "KHM", "120": "CMR", "124": "CAN", "152": "CHL",
          "156": "CHN", "170": "COL", "191": "HRV", "203": "CZE", "208": "DNK",
          "214": "DOM", "218": "ECU", "818": "EGY", "231": "ETH", "246": "FIN",
          "250": "FRA", "276": "DEU", "288": "GHA", "300": "GRC", "320": "GTM",
          "332": "HTI", "340": "HND", "348": "HUN", "356": "IND", "360": "IDN",
          "364": "IRN", "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA",
          "388": "JAM", "392": "JPN", "400": "JOR", "404": "KEN", "408": "PRK",
          "410": "KOR", "414": "KWT", "418": "LAO", "422": "LBN", "434": "LBY",
          "458": "MYS", "484": "MEX", "504": "MAR", "508": "MOZ", "524": "NPL",
          "528": "NLD", "540": "NCL", "554": "NZL", "566": "NGA", "578": "NOR",
          "586": "PAK", "591": "PAN", "598": "PNG", "604": "PER", "608": "PHL",
          "616": "POL", "620": "PRT", "634": "QAT", "642": "ROU", "643": "RUS",
          "682": "SAU", "694": "SLE", "706": "SOM", "710": "ZAF", "724": "ESP",
          "144": "LKA", "736": "SDN", "752": "SWE", "756": "CHE", "760": "SYR",
          "158": "TWN", "764": "THA", "788": "TUN", "792": "TUR", "800": "UGA",
          "804": "UKR", "784": "ARE", "826": "GBR", "840": "USA", "858": "URY",
          "862": "VEN", "704": "VNM", "887": "YEM", "716": "ZWE",
        };

        const nameById: Record<string, string> = {
          "JPN": "Japan", "USA": "United States", "GBR": "United Kingdom", "FRA": "France",
          "DEU": "Germany", "ITA": "Italy", "ESP": "Spain", "AUS": "Australia", "CHN": "China",
          "IND": "India", "BRA": "Brazil", "CAN": "Canada", "KOR": "South Korea",
          "THA": "Thailand", "VNM": "Vietnam", "IDN": "Indonesia", "MYS": "Malaysia",
          "PHL": "Philippines", "NZL": "New Zealand", "MEX": "Mexico", "ARG": "Argentina",
          "NLD": "Netherlands", "BEL": "Belgium", "CHE": "Switzerland", "AUT": "Austria",
          "PRT": "Portugal", "GRC": "Greece", "TUR": "Turkey", "RUS": "Russia",
          "ZAF": "South Africa", "NGA": "Nigeria", "KEN": "Kenya", "EGY": "Egypt",
          "SAU": "Saudi Arabia", "ARE": "UAE", "ISR": "Israel", "NOR": "Norway",
          "SWE": "Sweden", "DNK": "Denmark", "FIN": "Finland", "POL": "Poland",
          "CZE": "Czech Republic", "HUN": "Hungary", "ROU": "Romania", "BGR": "Bulgaria",
        };

        // Simple equirectangular projection
        const W = 960;
        const H = 460;

        function project(coord: [number, number]): [number, number] {
          const [lon, lat] = coord;
          return [
            ((lon + 180) / 360) * W,
            ((90 - lat) / 180) * H,
          ];
        }

        function coordsToD(geometry: { type: string; coordinates: unknown }): string {
          function ringToD(ring: [number, number][]): string {
            if (!ring.length) return "";
            const [sx, sy] = project(ring[0]);
            let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
            for (let i = 1; i < ring.length; i++) {
              const [x, y] = project(ring[i]);
              d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            return d + " Z";
          }

          if (geometry.type === "Polygon") {
            const rings = geometry.coordinates as [number, number][][];
            return rings.map(ringToD).join(" ");
          } else if (geometry.type === "MultiPolygon") {
            const polys = geometry.coordinates as [number, number][][][];
            return polys.flatMap(rings => rings.map(ringToD)).join(" ");
          }
          return "";
        }

        if (cancelled) return;

        const result: CountryFeature[] = geo.features
          .map(f => {
            const numId = String(f.id).padStart(3, "0");
            const iso3 = idToName[numId] ?? "";
            const name = (nameById[iso3] ?? iso3) || `Country ${f.id}`;
            const d = coordsToD(f.geometry as { type: string; coordinates: unknown });
            return { id: iso3 || String(f.id), name, d };
          })
          .filter(f => f.d.length > 0);

        setFeatures(result);
      } catch (e) {
        console.error("WorldMap load failed:", e);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const visitedSet = new Set(visitedCountries.map(c => c.toUpperCase()));

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: "8px", overflow: "hidden", backgroundColor: "#E8EEF4" }}>
      {features.length === 0 ? (
        <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#717171", fontSize: "13px" }}>Loading map…</p>
        </div>
      ) : (
        <svg
          ref={svgRef}
          viewBox="0 0 960 460"
          style={{ width: "100%", display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {features.map(f => {
            const isVisited = visitedSet.has(f.id);
            return (
              <path
                key={f.id}
                d={f.d}
                fill={isVisited ? "#1B3A5C" : "#C8D8E8"}
                stroke="#fff"
                strokeWidth="0.5"
                style={{ cursor: isVisited ? "pointer" : "default", transition: "fill 0.15s" }}
                onMouseEnter={(e) => {
                  const svgRect = svgRef.current?.getBoundingClientRect();
                  if (!svgRect) return;
                  setTooltip({ name: f.name, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>
      )}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x + 8, top: tooltip.y - 28,
          backgroundColor: "rgba(0,0,0,0.75)", color: "#fff",
          fontSize: "12px", fontWeight: 500, padding: "4px 8px", borderRadius: "6px",
          pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10,
        }}>
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
