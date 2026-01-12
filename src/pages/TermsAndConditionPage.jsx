import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const TermsAndConditionPage = () => {
    const {t, i18n} = useTranslation();
    const urlParams = useParams();
    const [brandsList, setBrandsList] = useState([]);
    
    console.log("urlParams:", urlParams);
    useEffect(() => {
        const brandsArray = urlParams.brands ? urlParams.brands.split("-") : [];
        setBrandsList(brandsArray);
    }, [urlParams]);
    // const brandsParam = urlParams.get("brands") || "";
    // const brandsList = brandsParam.split(",").map((brand) => brand.trim());
  return (
    <div>
      <div className="relative max-w-[900px] bg-[#fff] px-5 pb-5 overflow-y-scroll rounded">

        <div className="">
            {console.log("brandsList:", brandsList)}
          {brandsList.length > 0 &&
            brandsList.map((el, i) => {
              return (
                <span key={i} className="text-gray-900 font-semibold">
                  {el}{i < brandsList.length - 1 ? ", " : ""}
                </span>
              );
            })}
          <ol type="1" className="flex flex-col gap-1 mb-2">
            <li>
              <span>1. </span>
              {t("termsRule1")}
            </li>
            <li>
              <span>1.1 </span>
              {t("termsRule1_2")}
            </li>
            <li>
              <p>
                <span>2. </span>
                {t("termsRule2")}
              </p>
            </li>
            <li>
              <span>3. </span>
              {t("termsRule3")}
            </li>
            <li>
              <span>4. </span>
              {t("termsRule4")}
            </li>
            <li>
              <span>5. </span>
              {t("termsRule5")}
            </li>
            <li>
              <span>6. </span>
              {t("termsRule6")}
            </li>
            <li>
              <span>7. </span>
              {t("termsRule7")}
            </li>
            <li>
              <span>7.1 </span>
              {t("termsRule7_1")}
            </li>
            <li>
              <span>7.2 </span>
              {t("termsRule7_2")}
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionPage;
