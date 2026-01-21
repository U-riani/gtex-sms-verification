import React from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const TermsCOmponent = ({ handleShowTerms, brands }) => {
  const { t } = useTranslation();
  return (
    <div
      id="open-terms-container"
      className="fixed w-full h-full z-10 flex justify-center bg-stone-900/30 p-3 sm:py-9"
      onClick={handleShowTerms}
    >
      <div className="relative max-w-[900px] bg-[#fff] px-5 pb-5 overflow-y-scroll rounded">
        <div className="flex flex-row justify-between bg-[#fff] py-5 sticky top-0">
          <h4 className="text-xl capitalize font-bold ">
            {t("termsAndConditions")}
          </h4>
          <button
            type="button"
            id="close-terms"
            className="cursor-pointer p-3 -mt-3 -me-3"
            onClick={handleShowTerms}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="">
          {brands.length > 0 &&
            brands.map((el, i) => {
              return (
                <span key={i} className="text-gray-900 font-semibold">
                  {el}
                  {i < brands.length - 1 ? ", " : ""}
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

export default TermsCOmponent;
