"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-bg transition hover:opacity-85">
      Download PDF
    </button>
  );
}
