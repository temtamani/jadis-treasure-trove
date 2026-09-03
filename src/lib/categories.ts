import {
  Amphora,
  Armchair,
  BookOpen,
  Boxes,
  Coins,
  Frame,
  Gem,
  Lamp,
  Palette,
  Shapes,
  Watch,
  type LucideIcon,
} from "lucide-react";

/** Minimal, luxury-styled vector icon for each catalogue category. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Furniture: Armchair,
  Decorations: Lamp,
  Paintings: Palette,
  Sculptures: Shapes,
  Coins: Coins,
  Jewelry: Gem,
  Books: BookOpen,
  Watches: Watch,
  Ceramics: Amphora,
  Other: Boxes,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Boxes;
}
