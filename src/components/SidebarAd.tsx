import React from "react";
import { Card } from "../components/ui/card";

interface SidebarAdProps {
  adUrl?: string;
  adImageSrc?: string;
  adTitle?: string;
  adDescription?: string;
}

const SidebarAd = ({
  adUrl = "https://example.com/ad",
  adImageSrc = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&q=80",
  adTitle = "Sponsored Content",
  adDescription = "Check out our latest products and services!",
}: SidebarAdProps) => {
  return (
    <div className="w-40 h-[700px] bg-gray-100 dark:bg-gray-800 p-3 flex flex-col items-center">
      <Card className="w-full h-full overflow-hidden flex flex-col">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
          {adTitle}
        </div>

        <a
          href={adUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-between"
        >
          <div className="w-full h-48 mb-3">
            <img
              src={adImageSrc}
              alt="Advertisement"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-xs text-center mb-3">{adDescription}</div>

          <div className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2">
            Learn More
          </div>
        </a>

        <div className="w-full mt-auto">
          <div className="text-[10px] text-gray-400 text-center">
            Advertisement
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SidebarAd;
