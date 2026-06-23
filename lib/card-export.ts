/** Client helpers to export a DOM card as PNG / PDF, or share it natively. */

async function capture(node: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(node, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
}

export async function downloadPng(node: HTMLElement, filename: string): Promise<void> {
  const canvas = await capture(node);
  const a = document.createElement("a");
  a.download = `${filename}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

export async function downloadPdf(node: HTMLElement, filename: string): Promise<void> {
  const canvas = await capture(node);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: canvas.height >= canvas.width ? "p" : "l", unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
}

/** Native share (incl. IG). Returns true if the share sheet opened. */
export async function shareCard(node: HTMLElement, title: string, text: string): Promise<boolean> {
  const canvas = await capture(node);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return false;
  const file = new File([blob], "lovew-style-id.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
      return true;
    } catch {
      return false;
    }
  }
  // Fallback: download the image so they can post it manually.
  const a = document.createElement("a");
  a.download = "lovew-style-id.png";
  a.href = URL.createObjectURL(blob);
  a.click();
  return false;
}
