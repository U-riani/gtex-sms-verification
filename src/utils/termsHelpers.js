export const buildTermsText = (t, brands = []) => {
  const lines = [];

  // if (brands.length) {
  //   lines.push(`Brands: ${brands.join(", ")}`);
  //   lines.push("");
  // }

  lines.push(`1. ${t("termsRule1")}`);
  lines.push(`1.1 ${t("termsRule1_2")}`);
  lines.push(`2. ${t("termsRule2")}`);
  lines.push(`3. ${t("termsRule3")}`);
  lines.push(`4. ${t("termsRule4")}`);
  // Rule 5 (same logic as UI)
  let rule5 = `5. ${t("termsRule5_start")}`;

  if (brands.length > 0) {
    rule5 += `${t("termsRule5_middle")}${brands.join(", ")}`;
  } else {
    rule5 += t("termsRule5_optional");
  }

  rule5 += t("termsRule5_end");
  lines.push(rule5);
  lines.push(`6. ${t("termsRule6")}`);
  lines.push(`7. ${t("termsRule7")}`);
  lines.push(`7.1 ${t("termsRule7_1")}`);
  lines.push(`7.2 ${t("termsRule7_2")}`);

  return lines.join("\n");
};
