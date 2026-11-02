import React from "react";
import { Clapperboard, Star, Eye, Rocket, Search, Film, Camera, Trophy } from "lucide-react";

export function AvatarIcon({
  id,
  className = "w-4 h-4 text-[#D9A441]",
}: {
  id?: string;
  className?: string;
}) {
  switch (id) {
    case "avatar_director":
      return <Clapperboard className={className} />;
    case "avatar_actor":
      return <Star className={className} />;
    case "avatar_lens":
      return <Eye className={className} />;
    case "avatar_scifi":
      return <Rocket className={className} />;
    case "avatar_noir":
      return <Search className={className} />;
    case "avatar_popcorn":
      return <Film className={className} />;
    case "avatar_camera":
      return <Camera className={className} />;
    case "avatar_oscar":
      return <Trophy className={className} />;
    default:
      return <Clapperboard className={className} />;
  }
}
