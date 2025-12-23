import { Landmark } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2" prefetch={false}>
      <div className="bg-primary p-2 rounded-lg">
        <Landmark className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="text-lg font-semibold text-foreground font-headline group-data-[state=collapsed]:hidden">TG Finance App</span>
    </Link>
  );
}
