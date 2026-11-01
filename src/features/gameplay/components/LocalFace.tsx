"use client";

import React, { useState } from "react";

export const LocalFace: React.FC<{
  src?: string;
  fallback: React.ReactNode;
  className: string;
  imgClassName?: string;
}> = ({ src, fallback, className, imgClassName = "w-full h-full object-cover" }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  return (
    <div className={className}>
      <img src={src} alt="" loading="lazy" className={imgClassName} onError={() => setFailed(true)} />
    </div>
  );
};
