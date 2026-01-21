import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const TermsAndConditionPage = () => {
  const { t, i18n } = useTranslation();
  const { langId, brands } = useParams();
  const [brandsList, setBrandsList] = useState([]);

  useEffect(() => {
    if (langId) {
      i18n.changeLanguage(langId);
    }
  }, [langId, i18n]);

  useEffect(() => {
    const list = brands ? brands.split("-").map(decodeURIComponent) : [];
    setBrandsList(list);
  }, [brands]);

  return (
    <div className="max-w-[900px] mx-auto p-5 bg-white">

      <ol className="flex flex-col gap-2">
        <li>1. {t("termsRule1")}</li>
        <li>1.1 {t("termsRule1_2")}</li>
        <li>2. {t("termsRule2")}</li>
        <li>3. {t("termsRule3")}</li>
        <li>4. {t("termsRule4")}</li>
        <li>
          5.
          {t("termsRule5_start")}
          {brandsList.length > 0 && <span>{t("termsRule5_middle")}</span>}
          {brandsList.length > 0 ? (
            brandsList.map((el, i) => {
              return (
                <span key={i} className="text-gray-900 font-semibold">
                  {el}
                  {i < brandsList.length - 1 ? ", " : ""}
                </span>
              );
            })
          ) : (
            <span className="text-gray-900 font-semibold">
              {t("termsRule5_optional")}
            </span>
          )}
          <span>{t("termsRule5_end")}</span>
        </li>
        <li>6. {t("termsRule6")}</li>
        <li>7. {t("termsRule7")}</li>
        <li>7.1 {t("termsRule7_1")}</li>
        <li>7.2 {t("termsRule7_2")}</li>
      </ol>
    </div>
  );
};

export default TermsAndConditionPage;
