import React, { useState, useEffect } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import RegionCitySelect from "../components/RegionCitySelect ";
import ReusableSearchSelect from "../components/ReusableSearchSelect";
import { useTranslation } from "react-i18next";
import LanguageButton from "../components/LanguageButton";
import { regions } from "../data/regions";
import { countries } from "../data/countries";
// import { brands } from "../data/brands";
import { phonePrefixes } from "../data/phoneNumberPrefixes";
import { getCountryName, getCountryOptions } from "../utils/countryHelpers";
import BrandNetwork from "../components/BrandNetwork";
import { BRAND_NAMES } from "../data/brands";
import { useParams } from "react-router-dom";

const HomePage = () => {
  const baseURL = "https://gtex-sms-verification-server.vercel.app";
  // const baseURL = "http://localhost:5000";
  const { activeBrandName } = useParams();

  const initialFields = {
    brands: [],
    gender: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "", // via ReusableSearchSelect
    city: "", // via ReusableSearchSelect
    email: "",
    phoneNumber: "",
    verificationCode: "",
    promotionChanel1: true, // will be "true" or "false"
    promotionChanel2: true, // will be "true" or "false"
    termsAccepted: false,
    branch: "",
    prefix: "+995",
  };

  const [fieldsData, setFieldsData] = useState(initialFields);

  const { t, i18n } = useTranslation();

  const [showTerms, setShowTerms] = useState(false);
  const [otpHash, setOtpHash] = useState("");
  const [toggleCode, setToggleCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  // const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const fieldRefs = {
    brands: React.useRef(null),
    gender: React.useRef(null),
    firstName: React.useRef(null),
    lastName: React.useRef(null),
    dateOfBirth: React.useRef(null),
    city: React.useRef(null),
    country: React.useRef(null),
    phoneNumber: React.useRef(null),
    verificationCode: React.useRef(null),
    agree: React.useRef(null),
  };

  // const allBrandIds = brands.map((b) => b.id);

  // const toggleAllBrands = () => {
  //   setFieldsData((prev) => ({
  //     ...prev,
  //     brands: prev.brands.length === allBrandIds.length ? [] : allBrandIds,
  //   }));
  // };

  useEffect(() => {
    setFieldsData((prev) => ({ ...prev, branch: activeBrandName }));
  }, [activeBrandName]);

  console.log(fieldsData.brands);
  const toggleBrandFromNetwork = (name) => {
    setFieldsData((prev) => ({
      ...prev,
      brands: prev.brands.includes(name)
        ? prev.brands.filter((b) => b !== name)
        : [...prev.brands, name],
    }));
  };

  const toggleAllFromNetwork = () => {
    setFieldsData((prev) => ({
      ...prev,
      brands: prev.brands.length === BRAND_NAMES.length ? [] : [...BRAND_NAMES],
    }));
  };

  useEffect(() => {
    setFieldsData((prev) => ({
      ...prev,
      country: i18n.language === "ka" ? 57 : "",
      city: "",
    }));
  }, [i18n.language]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const isValidPhoneLength = (raw) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    return cleaned.length >= 6 && cleaned.length <= 15;
  };

  // const isValidPhoneNumber = (raw, prefix = "+995") => {
  //   const numericPrefix = prefix.replace(/[^0-9]/g, "");
  //   const cleaned = raw.replace(/[^0-9]/g, "");

  //   // nothing entered
  //   if (!cleaned) return false;

  //   // remove leading zero (0555 → 555)
  //   let local = cleaned.startsWith("0") ? cleaned.slice(1) : cleaned;

  //   // local part must be between 4–12 digits (international safe)
  //   return local.length >= 6 && local.length <= 12;
  // };

  const isValidEmail = (email) => {
    if (!email) return true; // optional field → empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const normalizePhone = (raw = "", prefix = "+995") => {
    const numericPrefix = prefix.replace(/[^0-9]/g, "");
    const cleaned = raw.replace(/[^0-9]/g, "");

    if (!cleaned) return "";

    // If user already typed full number (e.g. 9955xxxx)
    if (cleaned.startsWith(numericPrefix)) {
      return cleaned;
    }

    // Remove leading 0 (0555 → 555)
    let local = cleaned;
    if (local.startsWith("0")) local = local.slice(1);

    return numericPrefix + local;
  };

  const handleShowTerms = (e) => {
    if (e.target && e.target.id.includes("open-terms")) {
      setShowTerms((prev) => !prev);
    }
    if (e.target && e.target.closest("#close-terms")) {
      setShowTerms(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // remove error instantly when user types/selects
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // Reset OTP when phone changes
    if (name === "phoneNumber") {
      setIsVerified(false);
      setOtpHash("");
      setToggleCode(false);
      setFieldsData((prev) => ({ ...prev, verificationCode: "" }));
      setInfoMessage("");
    }

    // Reset OTP when prefix changes
    if (name === "prefix") {
      setIsVerified(false);
      setOtpHash("");
      setToggleCode(false);
      setFieldsData((prev) => ({
        ...prev,
        verificationCode: "",
      }));
      setInfoMessage("");
    }

    setFieldsData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // const toggleBrand = (brandId) => {
  //   setErrors((prev) => ({ ...prev, brands: undefined }));

  //   setFieldsData((prev) => ({
  //     ...prev,
  //     brands: prev.brands.includes(brandId)
  //       ? prev.brands.filter((b) => b !== brandId)
  //       : [...prev.brands, brandId],
  //   }));
  // };

  const handleClear = () => {
    setFieldsData({ ...initialFields });
    setOtpHash("");
    setIsVerified(false);
    setToggleCode(false);
    setCooldown(0);
    setInfoMessage("");
  };

  // ------------------- SEND OTP -------------------
  const handleGetCode = async (e) => {
    e.preventDefault();

    if (sendingCode || cooldown > 0) return; // safety

    setSendingCode(true);
    setErrors((prev) => ({ ...prev, phoneNumber: null }));

    const raw = fieldsData.phoneNumber.trim();
    try {
      // Basic check: empty
      if (!raw) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: t("PleaseEnterYourMobile"),
          verificationCode: t("PleaseEnterValidMobile"),
        }));
        return;
      }

      // Normalize phone (remove spaces, hyphens, symbols)
      // const cleaned = raw.replace(/[^0-9]/g, "");

      // Format to Georgian 995xxx
      let formattedPhone = normalizePhone(
        fieldsData.phoneNumber,
        fieldsData.prefix || "+995"
      );

      if (!isValidPhoneLength(raw)) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: t("PleaseEnterValidMobile"),
          verificationCode: t("PleaseEnterValidMobile"),
        }));
        return;
      }

      // VALID — show info message
      setInfoMessage(`${t("verificationCodeSent")} ${formattedPhone}`);
      setErrors((prev) => ({
        ...prev,
        verificationCode: undefined,
      }));

      // const formattedPhone = fieldsData.phoneNumber.startsWith("995")
      //   ? fieldsData.phoneNumber
      //   : `995${fieldsData.phoneNumber.replace(/^0/, "")}`;

      const res = await fetch(`${baseURL}/api/sms/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      const data = await res.json();
      console.log(data);
      if (!data.success) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber:
            data.error === "Invalid Code"
              ? t("invalidCode")
              : t("couldNotSendCode"),
        }));
        console.error("OTP send error:", data.error);
        return;
      }

      setOtpHash(data.hash);
      setToggleCode(true);
      setCooldown(60); // Start 60-second cooldown ONLY when OTP sent successfully

      // alert("კოდი გაიგზავნა");
    } catch (err) {
      console.error(err);
      // alert("ვერ გაიგზავნა კოდი");
      setErrors((prev) => ({
        ...prev,
        phoneNumber: t("networkError"),
      }));
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (verifyingCode) return;

    setVerifyingCode(true);
    setErrors((prev) => ({ ...prev, verificationCode: null }));
    const raw = fieldsData.phoneNumber.trim();
    // const cleaned = raw.replace(/[^0-9]/g, "");

    if (!isValidPhoneLength(raw)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: t("PleaseEnterValidMobile"),
      }));

      return;
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.verificationCode;
      return copy;
    });

    try {
      const formattedPhone = normalizePhone(
        fieldsData.phoneNumber,
        fieldsData.prefix || "+995"
      );

      const res = await fetch(`${baseURL}/api/sms/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          hash: otpHash,
          code: fieldsData.verificationCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerified(true);
        setToggleCode(false);
        setCooldown(0);
        setInfoMessage("");
        return;
      }

      // OTP incorrect
      setErrors((prev) => ({
        ...prev,
        verificationCode:
          data.message === "Invalid code"
            ? t("invalidCode")
            : t("couldNotSendCode"),
      }));
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        verificationCode: t("couldNotSendCode"),
      }));
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT FIRED");
    console.log("termsAccepted:", fieldsData.termsAccepted);

    // Manual validation
    const newErrors = {};
    console.log(fieldsData);
    if (!fieldsData.brands || fieldsData.brands.length === 0) {
      newErrors.brands = t("chooseBrand");
    }

    if (!fieldsData.gender) newErrors.gender = t("PleaseEnterYourGender");
    if (fieldsData.brands.length == 0)
      newErrors.brands = t("pleaseSelectBrand");
    if (!fieldsData.firstName.trim())
      newErrors.firstName = t("PleaseEnterYourFirstName");
    if (!fieldsData.lastName.trim())
      newErrors.lastName = t("PleaseEnterYourLastName");
    if (!fieldsData.dateOfBirth)
      newErrors.dateOfBirth = t("PleaseEnterYourBirthDate");
    if (fieldsData.city === null || fieldsData.city === undefined)
      newErrors.city = t("PleaseEnterYourCity");
    if (fieldsData.country === null || fieldsData.country === undefined)
      newErrors.country = t("PleaseEnterYourCountry");
    //// Normalize phone for submit
    // const formattedPhone = normalizePhone(
    //   fieldsData.phoneNumber,
    //   fieldsData.prefix || "+995"
    // );

    /// PHONE NUMBER VALIDATION
    if (!fieldsData.phoneNumber.trim()) {
      newErrors.phoneNumber = t("PleaseEnterYourMobile");
    } else if (!isValidPhoneLength(fieldsData.phoneNumber)) {
      newErrors.phoneNumber = t("PleaseEnterValidMobile");
    }

    // VERIFICATION CHECK
    if (!isVerified) {
      newErrors.verificationCode = t("pleaseVerifyCode");
    }
    if (!fieldsData.termsAccepted)
      newErrors.termsAccepted = t("PleaseAgreeToTerms");

    if (fieldsData.email && !isValidEmail(fieldsData.email.trim())) {
      newErrors.email = t("PleaseEnterYourEmail");
    }

    setErrors(newErrors);
    console.log("Branch name", fieldsData.branch);

    // If errors exist → scroll to first one
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const ref = fieldRefs[firstErrorKey];

      if (ref && ref.current) {
        ref.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return;
    }

    try {
      setLoading(true);
      // setSuccessMessage("");

      const formattedPhone = normalizePhone(
        fieldsData.phoneNumber,
        fieldsData.prefix || "+995"
      );
      console.log(fieldsData.branch);
      const req = await fetch(`${baseURL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brands: fieldsData.brands,
          gender: fieldsData.gender,
          firstName: fieldsData.firstName.trim(),
          lastName: fieldsData.lastName.trim(),
          dateOfBirth: fieldsData.dateOfBirth,
          country: getCountryName(countries, fieldsData.country, "en"),
          city: getCountryName(regions, fieldsData.city, "en"),
          email: fieldsData.email.trim() || null,
          phoneNumber: formattedPhone,
          promotionChanel1: fieldsData.promotionChanel1,
          promotionChanel2: fieldsData.promotionChanel2,
          termsAccepted: fieldsData.termsAccepted,
          branch: fieldsData.branch,
        }),
      });

      const resData = await req.json();

      if (resData.success) {
        handleClear();
        setShowSuccessModal(true);
      } else {
        alert("რეგისტრაცია ვერ განხორციელდა");
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative ">
      <LanguageButton />
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-sm w-full">
            <div className="text-green-600 text-5xl mb-3">✔</div>
            <h3 className="text-xl  font-semibold mb-2">
              გაგზავნა წარმატებულია
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              თქვენი მონაცემები წარმატებით გაიგზავნა.
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showTerms && (
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
      )}
      <div className="w-full bg-[#f8f9fa] py-4 sm:py-10 px-3">
        <div className="flex flex-col items-center ">
          <div className="flex flex-col gap-5 md:gap-10 bg-cyan-100/10 rounded  p-5 sm:p-7  xl:p-10 border border-slate-300 rounded shadow-2xl">
            {/* <div className="flex justify-center items-center">
              <div>
                <img
                  src="Gtex-logo.png"
                  alt="Gtex logo"
                  className="max-h-[70px]"
                />
              </div>
            </div> */}
            <div>
              <form
                className="flex flex-col gap-4 bg-[#fff] font-Roboto w-full max-w-[800px] p-5 sm:p-7 xl:p-10 shadow-xl shadow-slate-900/30 border border-neutral-200 rounded "
                style={{
                  background: `
    linear-gradient(to bottom,
      rgba(129, 193, 253, 0.23) 0%,
      rgba(200, 224, 255, 0.41) 30%,
      rgba(187, 231, 248, 0.2) 70%,
      transparent 100%
    )
  `,
                }}
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                    e.preventDefault();
                  }
                }}
              >
                <div className="mb-5">
                  <h5 className="text-2xl text-[#242223] text-center font-bold uppercase-like">
                    {t("smsVerification")}
                  </h5>

                  <p className="text-center font text-[#242223]/40">
                    {t("registrationForm")}
                  </p>
                </div>
                <div ref={fieldRefs.brands} className="flex flex-col gap-3">
                  <div>
                    <p className="text-[#242223] font-bold">
                      {t("chooseBrand")} *
                    </p>
                    {errors.brands && (
                      <p className="text-pink-600 text-sm">
                        {errors.brands || "Please select at least one brand"}
                      </p>
                    )}
                  </div>
                  <BrandNetwork
                    selectedBrands={fieldsData.brands}
                    onToggleBrand={toggleBrandFromNetwork}
                    onToggleAll={toggleAllFromNetwork}
                  />
                </div>
                {/* <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-[#040037] font-bold">
                      {t("chooseBrand")}: *
                    </p>
                    {errors.brands && (
                      <p className="text-red-600 text-sm">
                        {t("pleaseSelectBrand") ||
                          "Please select at least one brand"}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex flex-row  justify-start items-center flex-wrap gap-3 max-w-lg"
                    ref={fieldRefs.brands}
                  >
                    {brands.map((brand, i) => {
                      const isActive = fieldsData.brands.includes(brand.id);

                      return (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => {
                            setErrors((prev) => ({
                              ...prev,
                              brands: undefined,
                            }));
                            toggleBrand(brand.id);
                          }}
                          className={`px-4 py-2 text-sm font-medium transition-all border rounded cursor-pointer
          ${
            isActive
              ? "bg-[#040037] text-white border-[#040037] shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400"
          }
        `}
                        >
                          {brand.label}
                        </button>
                      );
                    })}
                  </div>
                </div> */}

                {/* <div className="flex flex-col gap-2" ref={fieldRefs.gender}>
                  <div>
                    <p className="text-[#040037] font-bold">{t("gender")}: *</p>
                    {errors.gender && (
                      <p className="text-red-600 text-sm mt-1">
                        {t("pleaseSelectGender") || "Please select gender"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-row justify-around rounded border-gray-400 bg-transparent">
                    {["female", "male"].map((g, i) => {
                      const isActive = fieldsData.gender === g;

                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            // Clear gender error immediately when user clicks
                            setErrors((prev) => ({
                              ...prev,
                              gender: undefined,
                            }));
                            handleChange({
                              target: { name: "gender", value: g },
                            });
                          }}
                          className={`px-4 py-2 font-medium flex-1 cursor-pointer
    border border-4 border-white/30
    ${isActive ? "gender-btn-active bg-indigo-300/80" : ""}
    ${i === 0 ? "rounded-l" : ""}
    ${i === 1 ? "rounded-r" : ""}
  `}
                        >
                          {g === "female"
                            ? t("female")
                            : g === "male"
                            ? t("male")
                            : t("other")}
                        </button>
                      );
                    })}
                  </div>
                </div> */}
                <div className="flex flex-col gap-2" ref={fieldRefs.gender}>
                  <div>
                    <p className="text-[#242223] font-bold">{t("gender")}: *</p>
                    {errors.gender && (
                      <p className="text-pink-600 text-sm mt-1">
                        {t("PleaseEnterYourGender") || "Please select gender"}
                      </p>
                    )}
                  </div>

                  {/* Full glass panel with shimmer — exactly like your test */}
                  <div className="relative overflow-hidden rounded-xl bg-white/50 backdrop-blur-xl border border-white/30">
                    {/* Moving shimmer effect */}
                    <div className="absolute inset-0 pointer-events-none shimmer"></div>

                    {/* Two gender buttons inside the glass */}
                    <div className="relative bg-transparent flex gap-1 p-2">
                      {["female", "male"].map((g) => {
                        const isActive = fieldsData.gender === g;

                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              setErrors((prev) => ({
                                ...prev,
                                gender: undefined,
                              }));
                              handleChange({
                                target: { name: "gender", value: g },
                              });
                            }}
                            className={`
              flex-1 py-2 font-semibold text-lg transition-all duration-500 rounded cursor-pointer 
              ${
                isActive
                  ? "bg-[#3d97cc]/20  z-10 text-slate-800/80 hover:bg-sky-600/30"
                  : "bg-transparent text-slate-600/80 hover:bg-slate-400/20"
              }
            `}
                          >
                            <span className="relative z-10">
                              {g === "female" ? t("female") : t("male")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:flex-row ">
                  <div
                    className="flex flex-col justify-end gap-2 md:w-[150px] "
                    ref={fieldRefs.firstName}
                  >
                    <label
                      htmlFor="firstName"
                      className="text-[#242223] font-bold"
                    >
                      {t("firstName")} *
                    </label>
                    {errors.firstName && (
                      <p className="text-red-600 text-sm">
                        {t("PleaseEnterYourFirstName")}
                      </p>
                    )}

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="border px-2 py-1 rounded border-[#242223]/40"
                      value={fieldsData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div
                    className="flex flex-col justify-end flex-1 gap-2"
                    ref={fieldRefs.lastName}
                  >
                    <label
                      htmlFor="lastName"
                      className="text-[#242223] font-bold"
                    >
                      {t("lastName")} *
                    </label>
                    {errors.lastName && (
                      <p className="text-red-600 text-sm">
                        {t("PleaseEnterYourLastName")}
                      </p>
                    )}

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="border px-2 py-1 rounded border-[#242223]/40 ring-0"
                      value={fieldsData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-col gap-2"
                  ref={fieldRefs.dateOfBirth}
                >
                  <label
                    htmlFor="dateOfBirth"
                    className="text-[#242223] font-bold"
                  >
                    {t("birthDate")} *
                  </label>
                  {errors.dateOfBirth && (
                    <p className="text-red-600 text-sm">
                      {t("PleaseEnterYourBirthDate")}
                    </p>
                  )}

                  <input
                    id="dateOfBirth"
                    className="border rounded px-2 py-1 border-gray-400 text-[#242223] cursor-pointer"
                    name="dateOfBirth"
                    type="date"
                    value={fieldsData.dateOfBirth}
                    onChange={handleChange}
                    onClick={(e) =>
                      e.target.showPicker && e.target.showPicker()
                    }
                  />
                </div>

                <div className="flex flex-row  gap-5">
                  <div
                    className="flex flex-col flex-1 gap-2"
                    ref={fieldRefs.city}
                  >
                    <label htmlFor="city" className="text-[#242223] font-bold">
                      {t("city")} *
                    </label>
                    {errors.city && (
                      <p className="text-red-600 text-sm">
                        {t("PleaseEnterYourCity")}
                      </p>
                    )}

                    {/* <input
                      id="country"
                      name="country"
                      type="text"
                      className="border px-2 py-1 rounded flex-1"
                      value={fieldsData.country}
                      onChange={handleChange}
                    /> */}
                    <ReusableSearchSelect
                      forElement="city"
                      options={getCountryOptions(regions, i18n.language)}
                      value={getCountryName(
                        regions,
                        fieldsData.city,
                        i18n.language
                      )}
                      onChange={(id) => {
                        setErrors((prev) => ({ ...prev, city: undefined }));
                        setFieldsData((prev) => ({ ...prev, city: id }));
                      }}
                      error={errors.city}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2" ref={fieldRefs.country}>
                  <label htmlFor="country" className="text-[#242223] font-bold">
                    {t("country")} *
                  </label>
                  {errors.country && (
                    <p className="text-red-600 text-sm">
                      {t("PleaseEnterYourCountry")}
                    </p>
                  )}

                  <ReusableSearchSelect
                    forElement="country"
                    options={getCountryOptions(countries, i18n.language)}
                    value={getCountryName(
                      countries,
                      fieldsData.country,
                      i18n.language
                    )}
                    onChange={(id) => {
                      setErrors((prev) => ({ ...prev, country: undefined }));
                      setFieldsData((prev) => ({ ...prev, country: id }));
                    }}
                    error={errors.country}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[#242223] font-bold">
                      {t("email")}
                    </label>
                    {errors.email && (
                      <p className="text-red-600 text-sm">{errors.email}</p>
                    )}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="border px-2 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                    value={fieldsData.email}
                    onChange={handleChange}
                  />
                </div>
                <div
                  className="flex flex-col gap-2"
                  ref={fieldRefs.phoneNumber}
                >
                  <label
                    htmlFor="phoneNumber"
                    className="text-[#242223] font-bold"
                  >
                    {t("mobile")} *
                  </label>
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-sm">{errors.phoneNumber}</p>
                  )}
                  <div className="flex gap-4">
                    <select
                      className="text-[#242223] border px-1 py-1 rounded border-gray-400 cursor-pointer"
                      value={fieldsData.prefix || "+995"}
                      onChange={(e) =>
                        handleChange({
                          target: { name: "prefix", value: e.target.value },
                        })
                      }
                    >
                      {phonePrefixes.map((p) => (
                        <option key={`${p.code}-${p.country}`} value={p.code}>
                          {p.country} {p.code}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="Tel"
                      className="border px-2 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                      placeholder="ex: 555 12 34 56"
                      value={fieldsData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div
                  className="flex flex-col  gap-2 pt-1"
                  ref={fieldRefs.verificationCode}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-[#242223] font-bold">
                      {t("verificationCode")} *
                    </p>
                    {errors.verificationCode && (
                      <p className="text-red-600 text-sm">
                        {errors.verificationCode}
                      </p>
                    )}
                    {infoMessage && (
                      <p className="text-blue-600 text-sm">{infoMessage}</p>
                    )}
                  </div>
                  <div className="flex flex-1 gap-4">
                    {/* <label htmlFor="">მობილურის ნომერი</label> */}
                    <input
                      name="verificationCode"
                      type="text"
                      value={fieldsData.verificationCode}
                      onChange={handleChange}
                      className={`border px-2 py-1 rounded flex-1 text-[#242223]
                      ${
                        isVerified
                          ? "border-green-500"
                          : errors.verificationCode
                          ? "border-red-500"
                          : "border-gray-400"
                      }`}
                    />

                    {/* GET CODE BUTTON */}
                    {!toggleCode && !isVerified && (
                      <button
                        type="button"
                        disabled={cooldown > 0 || sendingCode}
                        onClick={handleGetCode}
                        className={`px-5 py-1 rounded text-white  
    ${
      cooldown > 0 || sendingCode
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#3d97cc]/60 hover:bg-[#3d97cc]/90 cursor-pointer"
    }`}
                      >
                        {sendingCode
                          ? t("sendingCode") || "Sending..."
                          : cooldown > 0
                          ? `${t("resendIn")} (${cooldown})`
                          : t("getCode")}
                      </button>
                    )}

                    {/* VERIFY BUTTON */}
                    {toggleCode && !isVerified && (
                      <button
                        type="button"
                        disabled={verifyingCode}
                        onClick={handleVerifyCode}
                        className={`px-5 py-1 rounded text-white cursor-pointer
    ${
      verifyingCode
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600/70 hover:bg-green-700/70"
    }`}
                      >
                        {verifyingCode
                          ? t("checking") || "Checking..."
                          : t("verify")}
                      </button>
                    )}

                    {/* STATUS: VERIFIED */}
                    {isVerified && (
                      <button
                        type="button"
                        disabled
                        className="px-5 py-1 rounded bg-emerald-500/30 text-gray-600 cursor-not-allowed"
                      >
                        {t("verified")}{" "}
                        <span className="text-green-400">✔</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {errors.termsAccepted && (
                    <p className="text-red-600 text-sm">
                      {t("PleaseAgreeToTerms")}
                    </p>
                  )}
                  <div className="flex flex-row items-center gap-2">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={fieldsData.termsAccepted}
                      onChange={(e) => {
                        setErrors((prev) => ({
                          ...prev,
                          termsAccepted: undefined,
                        }));
                        setFieldsData((prev) => ({
                          ...prev,
                          termsAccepted: e.target.checked,
                        }));
                      }}
                    />

                    <p className="text-[#242223] font-bold">
                      {t("termsAgreeText")}
                      <span
                        className="text-[#242223]/60 cursor-pointer underline ps-1 hover:text-blue-600/50"
                        onClick={handleShowTerms}
                        id="open-terms"
                      >
                        {t("termsAndConditions")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    className="bg-[#3d97cc]/30 py-2 px-3 rounded text-slate-500 hover:bg-[#3d97cc]/50  cursor-pointer"
                    onClick={handleClear}
                  >
                    {t("clear")}
                  </button>

                  <button
                    type="submit"
                    className="bg-slate-700/60 py-2 px-3 rounded flex-1 text-slate-50 hover:bg-slate-800/90 disabled:bg-gray-400 cursor-pointer"
                  >
                    {loading ? `${t("sending")}` : `${t("submit")}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
