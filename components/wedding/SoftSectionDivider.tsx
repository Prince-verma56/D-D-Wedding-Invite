import "./SoftSectionDivider.css";

/** A compact transition in normal flow; only its decorative glow is blurred. */
export function SoftSectionDivider({ tone = "paper" }: { tone?: "wine" | "paper" }) {
  return <div className={"soft-section-divider soft-section-divider-" + tone} aria-hidden="true" data-soft-divider><span className="soft-section-divider-glow" /><span className="soft-section-divider-line" /></div>;
}
