import { branches } from "../data/branches";

export const getBrandFromBranchSlug = (slug) => {
  if (!slug) return null;

  const normalizedSlug = slug.toLowerCase().replace(/-/g, " ");

  const branch = branches.find(
    (b) => b.name.toLowerCase() === normalizedSlug
  );

  return branch ? branch.brand : null;
};
