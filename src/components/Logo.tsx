import logo from "@/assets/logo.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Gold D logo mark */}
      <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-gold-gradient shadow-gold">
        <img
          src={logo}
          alt="Duxbank Logo"
          className="h-11 w-11 object-contain"
        />
      </div>

      <div className="leading-tight">
        <div className="font-bold tracking-tight">
          Duxbank
        </div>

        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Microfinance
        </div>
      </div>
    </div>
  );
}