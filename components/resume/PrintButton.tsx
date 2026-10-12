"use client";

/** Opens the browser's print dialog; the print styles leave only the two sheets. */
export default function PrintButton() {
  return (
    <button type="button" className="btn btn--ghost" onClick={() => window.print()} data-magnetic>
      Print
    </button>
  );
}
