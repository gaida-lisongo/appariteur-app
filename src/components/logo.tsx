import Image from "next/image";
import { logo } from "@/assets/logo";

export function Logo() {
  return (
    <div className="relative h-35 max-w-[10.847rem]">
      <Image
        src={logo.src}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        style={{ objectFit: "contain" }}
      />

      <Image
        src={logo.src}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
