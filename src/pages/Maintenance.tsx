import { Settings } from "lucide-react";

export default function Maintenance() {
  return (
    <main className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/5">
        <Settings
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-11 w-11 text-primary motion-safe:animate-[spin_8s_linear_infinite]"
        />
      </div>
      <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
        Voltamos em instantes
      </h1>
    </main>
  );
}