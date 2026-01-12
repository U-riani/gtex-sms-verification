import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const LANG_ORDER = ["ka", "en", "ru"];

const LanguageButton = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const toggleLanguage = () => {
    const current = i18n.language;
    const next =
      LANG_ORDER[(LANG_ORDER.indexOf(current) + 1) % LANG_ORDER.length];

    i18n.changeLanguage(next);

    // If URL has langId → replace it
    if (params.langId) {
      navigate(
        location.pathname.replace(`/${params.langId}/`, `/${next}/`),
        { replace: true }
      );
    }
  };

  return (
    <div className="fixed right-0 m-1 p-1 z-50">
      <button
        onClick={toggleLanguage}
        className="w-7 h-7 hover:scale-105 transition cursor-pointer"
      >
        <img
          src={`/${i18n.language}.png`}
          alt="LANG"
          className="w-full h-full object-cover rounded opacity-50"
        />
      </button>
    </div>
  );
};

export default LanguageButton;
