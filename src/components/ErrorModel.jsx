//src/components/ErrorModel.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const ErrorModel = ({ errorMessage, setShowErrorModal }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-sm w-full">
        <div className="text-red-600 text-5xl mb-3">✖</div>
        <h3 className="text-xl font-semibold mb-2">
          {t("somethingWentWrong")}
        </h3>
        {errorMessage && (<p className="text-gray-600 mb-6 text-sm"><span className="text-blue-900 font-bold">reason: </span>{errorMessage}</p>
        )}
        <p className="text-gray-600 mb-6 text-sm">
          {t("pleaseTryAgain")}
        </p>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          onClick={() => setShowErrorModal(false)}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorModel;
