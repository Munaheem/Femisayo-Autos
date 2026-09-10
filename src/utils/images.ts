import type { PartItem, VehicleItem } from '../types';

export const MAX_GALLERY_SIZE = 15;

export function vehicleImages(v: VehicleItem): string[] {
  if (v.gallery && v.gallery.length > 0) {
    return v.gallery.slice(0, MAX_GALLERY_SIZE);
  }
  return [v.image];
}

export function partImages(p: PartItem): string[] {
  if (p.gallery && p.gallery.length > 0) {
    return p.gallery.slice(0, MAX_GALLERY_SIZE);
  }
  return [p.image];
}