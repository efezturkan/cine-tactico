import React from "react";

const AVATAR_PATHS: Record<string, string> = {
  avatar_director: "/avatars/avatar_director.webp",
  avatar_actor: "/avatars/avatar_actor.webp",
  avatar_lens: "/avatars/avatar_lens.webp",
  avatar_scifi: "/avatars/avatar_scifi.webp",
  avatar_noir: "/avatars/avatar_noir.webp",
  avatar_popcorn: "/avatars/avatar_popcorn.webp",
  avatar_camera: "/avatars/avatar_camera.webp",
  avatar_oscar: "/avatars/avatar_oscar.webp",
  avatar_ticket: "/avatars/avatar_ticket.webp",
  avatar_3dglasses: "/avatars/avatar_3dglasses.webp",
  avatar_totem: "/avatars/avatar_totem.webp",
  avatar_vhs: "/avatars/avatar_vhs.webp",
};

export function AvatarIcon({
  id,
  className = "w-full h-full rounded-xl",
}: {
  id?: string;
  className?: string;
}) {
  const src = (id && AVATAR_PATHS[id]) || AVATAR_PATHS.avatar_director;
  const radiusFallback = className.includes("rounded") ? "" : "rounded-md";

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={256}
      height={256}
      draggable={false}
      decoding="async"
      className={`object-cover select-none shrink-0 block ${radiusFallback} ${className}`}
    />
  );
}
