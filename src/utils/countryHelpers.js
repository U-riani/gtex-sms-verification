export const getCountryName = (countries, id, lang = "en") => {
  if (id === null || id === undefined) return "";
  if (!countries[id]) return "";
  return countries[id][lang] || "";
};

export const getCountryOptions = (countries, lang = "en") => {
  return Object.values(countries).map(c => ({
    id: c.id,
    label: c[lang],
    flag: c.flag
  }));
};

export const getCountryById = (countries, id) => {
  if (id === null || id === undefined) return null;
  return countries[id] || null;
};


export const isValidCountryId = (countries, id) => {
  return id !== null && id !== undefined && countries[id] !== undefined;
};


export const findCountryIdByName = (countries, name, lang = "en") => {
  const entry = Object.values(countries).find(
    c => c[lang].toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.id : null;
};
