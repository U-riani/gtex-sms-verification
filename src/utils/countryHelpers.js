export const getCountryName = (countries, id, lang = "en") => {
  if (!countries[id]) return "";
  return countries[id][lang] || "";
};

export const getCountryOptions = (countries, lang = "en") => {
  return Object.values(countries).map(c => ({
    id: c.id,
    label: c[lang],
  }));
};

export const getCountryById = (countries, id) => {
  return countries[id] || null;
};

export const isValidCountryId = (countries, id) => {
  return !!countries[id];
};

export const findCountryIdByName = (countries, name, lang = "en") => {
  const entry = Object.values(countries).find(
    c => c[lang].toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.id : null;
};
