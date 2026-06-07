import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export function QrCard({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 240,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    QRCode.toDataURL(url, { width: 512, margin: 1 }).then(setDataUrl);
  }, [url]);

  const download = (filename: string, href: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
  };

  return (
    <div className="rounded-2xl border bg-card p-6 flex flex-col items-center gap-4 shadow-sm">
      <canvas ref={canvasRef} aria-label="Feedback QR code" />
      <p className="text-xs text-muted-foreground break-all text-center max-w-[240px]">{url}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => dataUrl && download("duxbank-feedback-qr.png", dataUrl)}
        >
          <Download className="h-4 w-4 mr-1" /> PNG
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
            const blob = new Blob([svg], { type: "image/svg+xml" });
            download("duxbank-feedback-qr.svg", URL.createObjectURL(blob));
          }}
        >
          <Download className="h-4 w-4 mr-1" /> SVG
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
      </div>
    </div>
  );
}
