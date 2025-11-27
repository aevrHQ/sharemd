// ./components/Site/Header.tsx

import Link from "next/link";
import SiteLogo from "@/components/Site/Logo";

const SiteHeader = () => {
  return (
    <header className="sticky top-0 p-4 py-2.5 bg-background">
      <div className="wrapper flex justify-between gap-4 max-w-5xl mx-auto">
        <Link href={"/"}>
          <SiteLogo />
        </Link>
      </div>
    </header>
  );
};

export default SiteHeader;
