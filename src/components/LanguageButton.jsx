import { useTranslation } from "react-i18next";

const LanguageButton = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang =
      i18n.language === "ka" ? "en" : i18n.language === "en" ? "ru" : "ka";
    i18n.changeLanguage(newLang);
    console.log(i18n.language);
  };

  return (
    <div className="fixed right-0 m-1 p-1">
      <button
        onClick={toggleLanguage}
        className="w-7 h-7 hover:scale-105 transition cursor-pointer"
      >
        {/* Show current language flag */}
        <img
          src={`${i18n.language}.png`}
          alt="LANG"
          className="w-full h-full object-cover rounded opacity-70"
        />
      </button>
    </div>
  );
};

export default LanguageButton;
