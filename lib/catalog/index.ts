import catalog from "@/lib/catalog/catalog.json";
import type { CatalogIndex } from "@/lib/catalog/types";

export function getCatalog(): CatalogIndex {
  return catalog as CatalogIndex;
}
