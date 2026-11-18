import { ImageResponse } from "next/og";
import { wedding } from "@/data/wedding-content";

export const alt = wedding.names + " — " + wedding.subtitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fbf2ed", color: "#7a2338", border: "20px solid #f0d9d2" }}>
      <div style={{ display: "flex", width: 1100, height: 530, position: "absolute", border: "1px solid #bc8747", borderRadius: "200px 200px 30px 30px" }} />
      <div style={{ display: "flex", fontSize: 17, letterSpacing: 8, textTransform: "uppercase", marginBottom: 32 }}>The wedding of</div>
      <div style={{ display: "flex", fontFamily: "serif", fontStyle: "italic", fontSize: 103, letterSpacing: -4 }}>{wedding.names}</div>
      <div style={{ display: "flex", fontSize: 24, color: "#796366", marginTop: 25 }}>{wedding.hero.line}</div>
      <div style={{ display: "flex", fontSize: 17, letterSpacing: 4, marginTop: 45, color: "#956a37" }}>{wedding.date.label.toUpperCase()} · {wedding.venue.shortAddress.toUpperCase()}</div>
    </div>,
    size,
  );
}
