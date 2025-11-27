// ./components/Site/Logo.tsx

import { Document } from "iconsax-react";

const SiteLogo = () => {
  return (
    <figure className="flex gap-1 items-center">
      <Document variant="Bulk" className="icon w-7 h-7" color="currentColor" />
      <span className="font-display tracking-tighter text-2xl pb-1">
        ShareMD
      </span>
    </figure>
  );
};

export default SiteLogo;
