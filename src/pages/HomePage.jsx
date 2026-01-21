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
// import { phonePrefixes } from "../data/phoneNumberPrefixes";
import { getCountryName, getCountryOptions } from "../utils/countryHelpers";
import BrandNetwork from "../components/BrandNetwork";
import { BRAND_NAMES } from "../data/brands";
import { useParams } from "react-router-dom";
// import { getBrandFromBranchSlug } from "../utils/branchHelpers";
import { branches } from "../data/branches";
import PhonePrefixSelect from "../components/PhonePrefixSelect";
import { buildTermsText } from "../utils/termsHelpers";
import ErrorModel from "../components/ErrorModel";
import TermsCOmponent from "../components/TermsCOmponent";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const getDaysInMonth = (month, year) => {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
};

const MONTHS = {
  en: [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ],
  ka: [
    { value: 1, label: "იანვარი" },
    { value: 2, label: "თებერვალი" },
    { value: 3, label: "მარტი" },
    { value: 4, label: "აპრილი" },
    { value: 5, label: "მაისი" },
    { value: 6, label: "ივნისი" },
    { value: 7, label: "ივლისი" },
    { value: 8, label: "აგვისტო" },
    { value: 9, label: "სექტემბერი" },
    { value: 10, label: "ოქტომბერი" },
    { value: 11, label: "ნოემბერი" },
    { value: 12, label: "დეკემბერი" },
  ],
  ru: [
    { value: 1, label: "Январь" },
    { value: 2, label: "Февраль" },
    { value: 3, label: "Март" },
    { value: 4, label: "Апрель" },
    { value: 5, label: "Май" },
    { value: 6, label: "Июнь" },
    { value: 7, label: "Июль" },
    { value: 8, label: "Август" },
    { value: 9, label: "Сентябрь" },
    { value: 10, label: "Октябрь" },
    { value: 11, label: "Ноябрь" },
    { value: 12, label: "Декабрь" },
  ],
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

const HomePage = () => {
  // const baseURL = "https://gtex-sms-verification-server.vercel.app";
  const baseURL = import.meta.env.VITE_API_URL;
  const { activeBranchName } = useParams();

  const initialFields = {
    brands: [],
    gender: "",
    firstName: "",
    lastName: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    country: "", // via ReusableSearchSelect
    city: "", // via ReusableSearchSelect
    email: "",
    phoneNumber: "",
    verificationCode: "",
    promotionChannelSms: true, // will be "true" or "false"
    promotionChannelEmail: true, // will be "true" or "false"
    termsAccepted: false,
    branch: "",
    prefix: "+995",
  };

  const [fieldsData, setFieldsData] = useState(initialFields);

  const { t, i18n } = useTranslation();

  const [showTerms, setShowTerms] = useState(false);
  // const [otpHash, setOtpHash] = useState("");
  const [toggleCode, setToggleCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  // const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [lockedBrand, setLockedBrand] = useState(null);

  const [otpBrandsSnapshot, setOtpBrandsSnapshot] = useState([]);

  const phoneInputRef = React.useRef(null);

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
    if (!activeBranchName) return;

    const branch = branches.find(
      (b) => b.name.toLowerCase() === activeBranchName.toLowerCase()
    );
    if (!branch?.brand) return;

    const activeBrandTimeout = setTimeout(() => {
      setFieldsData((prev) => ({
        ...prev,
        branch: activeBranchName,
        brands: [branch.brand],
      }));

      setLockedBrand(branch.brand); // 🔒 LOCK IT
    }, 2500);

    return () => clearTimeout(activeBrandTimeout);
  }, [activeBranchName]);

  const toggleBrandFromNetwork = (name) => {
    if (lockedBrand === name) return;

    setFieldsData((prev) => ({
      ...prev,
      brands: prev.brands.includes(name)
        ? prev.brands.filter((b) => b !== name)
        : [...prev.brands, name],
    }));
  };

  const toggleAllFromNetwork = () => {
    setFieldsData((prev) => {
      // If locked brand exists, always keep it
      if (lockedBrand) {
        const allExceptLocked = BRAND_NAMES.filter((b) => b !== lockedBrand);

        const isAllSelected = prev.brands.length === BRAND_NAMES.length;

        return {
          ...prev,
          brands: isAllSelected
            ? [lockedBrand] // only locked survives
            : [lockedBrand, ...allExceptLocked],
        };
      }

      // normal behavior if no lock
      return {
        ...prev,
        brands:
          prev.brands.length === BRAND_NAMES.length ? [] : [...BRAND_NAMES],
      };
    });
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
    if (fieldsData.prefix === "+995" && cleaned.length !== 9) {
      return false;
    }
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
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) return "";

    const numericPrefix = prefix.replace(/\D/g, "");

    // 🇬🇪 Georgia: strict rule
    if (numericPrefix === "995") {
      // UI already enforces leading 5
      return numericPrefix + cleaned.slice(0, 9);
    }

    // 🌍 Other countries: trim to global max
    const trimmed = cleaned.slice(0, GLOBAL_MAX_DIGITS);

    // avoid double-prefix
    if (trimmed.startsWith(numericPrefix)) {
      return trimmed;
    }

    return numericPrefix + trimmed;
  };

  const handleShowTerms = (e) => {
    if (e.target && e.target.id.includes("open-terms")) {
      setShowTerms((prev) => !prev);
    }
    if (e.target && e.target.closest("#close-terms")) {
      setShowTerms(false);
    }
  };

  const resetOtpState = () => {
    setIsVerified(false);
    // setOtpHash("");
    setToggleCode(false);
    setCooldown(0);
    setInfoMessage("");
    setFieldsData((prev) => ({
      ...prev,
      verificationCode: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // remove error instantly when user types/selects
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // // Reset OTP when phone changes
    // if (name === "phoneNumber") {
    //   setIsVerified(false);
    //   setOtpHash("");
    //   setToggleCode(false);
    //   setCooldown(0); // ✅ RESET cooldown
    //   setFieldsData((prev) => ({ ...prev, verificationCode: "" }));
    //   setInfoMessage("");
    //   resetOtpState();
    // }

    // // Reset OTP when prefix changes
    // if (name === "prefix") {
    //   setIsVerified(false);
    //   setOtpHash("");
    //   setToggleCode(false);
    //   setCooldown(0); // ✅ RESET cooldown
    //   setFieldsData((prev) => ({
    //     ...prev,
    //     verificationCode: "",
    //   }));
    //   setInfoMessage("");
    // }

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
    // setOtpHash("");
    setIsVerified(false);
    setToggleCode(false);
    setCooldown(0);
    setInfoMessage("");
    setErrors({});
    setOtpBrandsSnapshot([]);
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
      if (fieldsData.brands.length === 0) {
        setErrors((prev) => ({
          ...prev,
          brands: t("pleaseSelectBrand"),
          phoneNumber: t("PleaseEnterYourMobile"),
          verificationCode: t("PleaseEnterValidMobile"),
        }));
        fieldRefs.brands.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
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
      setInfoMessage("");
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
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          selectedBrands: fieldsData.brands,
          language: i18n.language,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber:
            data.error === "Invalid Code"
              ? t("invalidCode")
              : data.error === "Phone number already registered"
              ? t("PhoneNumberAlreadyRegistered")
              : t("couldNotSendCode"),
        }));
        console.error("OTP send error:", data.error);
        setInfoMessage("");

        return;
      }

      // setOtpHash(data.hash);
      setToggleCode(true);
      setCooldown(60); // Start 60-second cooldown ONLY when OTP sent successfully
      setOtpBrandsSnapshot([...fieldsData.brands]); // 👈 SNAPSHOT

      setInfoMessage(`${t("verificationCodeSent")} ${formattedPhone}`);

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

  const isAtLeast14 = (day, month, year) => {
    if (!day || !month || !year) return false;

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 14;
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
          code: fieldsData.verificationCode,
          brands: fieldsData.brands,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerified(true);
        setToggleCode(false);
        setCooldown(0);
        setOtpBrandsSnapshot([...fieldsData.brands]); // 👈 SNAPSHOT
        setInfoMessage("");
        setErrors((prev) => ({
          ...prev,
          verificationCode: undefined,
        }));
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

    if (otpBrandsSnapshot.length) {
      const same =
        otpBrandsSnapshot.length === fieldsData.brands.length &&
        otpBrandsSnapshot.every((b) => fieldsData.brands.includes(b));

      if (!same) {
        setErrors((prev) => ({
          ...prev,
          verificationCode: t("pleaseVerifyCode"),
        }));
        return;
      }
    }

    // Manual validation
    const newErrors = {};
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

    if (
      fieldsData.city === null ||
      fieldsData.city === undefined ||
      fieldsData.city === ""
    )
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

    // age validation
    const { birthDay, birthMonth, birthYear } = fieldsData;
    const formattedBirthDate = `${birthYear}-${String(birthMonth).padStart(
      2,
      "0"
    )}-${String(birthDay).padStart(2, "0")}`;

    if (!birthDay || !birthMonth || !birthYear) {
      newErrors.dateOfBirth = t("PleaseEnterYourBirthDate");
    } else if (!isAtLeast14(birthDay, birthMonth, birthYear)) {
      newErrors.dateOfBirth = t("YouMustBeAtLeast14");
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

      const termsText = buildTermsText(t, fieldsData.brands);
      const termsLanguage = i18n.language;

      const req = await fetch(`${baseURL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brands: fieldsData.brands,
          gender: fieldsData.gender,
          firstName: fieldsData.firstName.trim(),
          lastName: fieldsData.lastName.trim(),
          dateOfBirth: formattedBirthDate,
          country: getCountryName(countries, fieldsData.country, "en"),
          city: getCountryName(regions, fieldsData.city, "en"),
          email: fieldsData.email.trim() || null,
          prefix: fieldsData.prefix,
          phoneNumber: formattedPhone.replace(
            fieldsData.prefix.replace(/\D/g, ""),
            ""
          ),
          promotionChannelSms: fieldsData.promotionChannelSms,
          promotionChannelEmail: fieldsData.promotionChannelEmail,
          termsAccepted: fieldsData.termsAccepted,
          branch: fieldsData.branch,
          termsText,
          termsLanguage,
        }),
      });

      const resData = await req.json();

      if (resData.success) {
        handleClear();
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    } catch (err) {
      console.log(err.message);
      setErrorMessage(err.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };
  const GLOBAL_MAX_DIGITS = 15;

  const getCursorPosFromDigits = (digitsLength, mask) => {
    let pos = 0;
    let digitsSeen = 0;

    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === "X") {
        if (digitsSeen === digitsLength) break;
        digitsSeen++;
      }
      pos++;
    }

    return pos;
  };

  const getPhoneMaskByPrefix = (prefix) => {
    switch (prefix) {
      case "+995":
        return {
          mask: "XXX XX XX XX",
          maxDigits: 9, // local Georgian number
        };

      default:
        return {
          mask: "XXXXXXXXXXXXXXX",
          maxDigits: GLOBAL_MAX_DIGITS,
        };
    }
  };

  const maskNumber = (digits = "", mask = "") => {
    let result = "";
    let i = 0;

    for (const char of mask) {
      if (char === "X") {
        result += digits[i] ?? "X";
        i++;
      } else {
        result += char;
      }
    }

    return result;
  };
  const { mask, maxDigits } = getPhoneMaskByPrefix(fieldsData.prefix);

  useEffect(() => {
    const el = phoneInputRef.current;
    if (!el) return;

    const cursorPos = getCursorPosFromDigits(
      fieldsData.phoneNumber.length,
      mask
    );

    requestAnimationFrame(() => {
      el.setSelectionRange(cursorPos, cursorPos);
    });
  }, [fieldsData.phoneNumber]);

  useEffect(() => {
    setFieldsData((prev) => {
      // 🇬🇪 Georgia: enforce leading 5
      if (fieldsData.prefix === "+995") {
        if (!prev.phoneNumber.startsWith("5")) {
          return { ...prev, phoneNumber: "5" + prev.phoneNumber };
        }
        return prev;
      }

      // 🌍 Other countries: remove forced Georgian 5
      if (prev.phoneNumber.startsWith("5")) {
        return { ...prev, phoneNumber: prev.phoneNumber.slice(1) };
      }

      return prev;
    });
  }, [fieldsData.prefix]);

  useEffect(() => {
    resetOtpState();
  }, [fieldsData.phoneNumber, fieldsData.prefix]);

  useEffect(() => {
    if (!otpBrandsSnapshot.length) return;

    const same =
      otpBrandsSnapshot.length === fieldsData.brands.length &&
      otpBrandsSnapshot.every((b) => fieldsData.brands.includes(b));

    if (!same) {
      resetOtpState();
      setOtpBrandsSnapshot([]);
      setErrors((prev) => ({
        ...prev,
        verificationCode: t("pleaseVerifyCode"),
      }));
    }
  }, [fieldsData.brands]);

  useEffect(() => {
    const { birthDay, birthMonth, birthYear } = fieldsData;

    if (!birthDay || !birthMonth || !birthYear) return;

    const maxDay = getDaysInMonth(birthMonth, birthYear);

    if (birthDay > maxDay) {
      setFieldsData((prev) => ({
        ...prev,
        birthDay: maxDay,
      }));
    }
  }, [fieldsData.birthMonth, fieldsData.birthYear]);

  return (
    <div className="relative ">
      {/* <LanguageButton /> */}
      {showErrorModal && (
        <ErrorModel
          errorMessage={errorMessage}
          setShowErrorModal={setShowErrorModal}
        />
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-sm w-full">
            <div className="text-green-600 text-5xl mb-3">✔</div>
            <h3 className="text-xl  font-semibold mb-2">
              {t("successVerification")}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {t("dataSubmittedSuccessfully")}
            </p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => {
                setShowSuccessModal(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showTerms && (
       <TermsCOmponent handleShowTerms={handleShowTerms} brands={fieldsData.brands}/>
      )}
      <div className="w-full bg-[#f8f9fa] py-4 sm:py-10 px-3">
        <div className="flex flex-col items-center ">
          <div className="flex flex-col gap-5 md:gap-10 bg-cyan-100/10 rounded p-3 md:p-5 sm:p-7  xl:p-10 border border-slate-300 rounded shadow-2xl">
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
                className="flex flex-col gap-4 bg-[#fff] font-Roboto w-full max-w-[800px] p-3 md:p-5 sm:p-7 xl:p-10 shadow-xl shadow-slate-900/30 border border-neutral-200 rounded "
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
                    lockedBrand={lockedBrand}
                    onToggleBrand={toggleBrandFromNetwork}
                    onToggleAll={toggleAllFromNetwork}
                  />
                </div>
                
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
                  <p className="text-[#242223] font-bold">{t("birthDate")} *</p>

                  {errors.dateOfBirth && (
                    <p className="text-red-600 text-sm">{errors.dateOfBirth}</p>
                  )}

                  <div className="flex gap-3">
                    {/* Day */}
                    <select
                      name="day-selection"
                      value={fieldsData.birthDay}
                      onChange={(e) =>
                        setFieldsData((p) => ({
                          ...p,
                          birthDay: e.target.value,
                        }))
                      }
                      className="border px-2 max-h-60 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                    >
                      <option value="">{t("day")}</option>
                      {Array.from(
                        {
                          length: getDaysInMonth(
                            fieldsData.birthMonth,
                            fieldsData.birthYear
                          ),
                        },
                        (_, i) => i + 1
                      ).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    {/* Month */}
                    <select
                      name="month-selection"
                      value={fieldsData.birthMonth}
                      onChange={(e) =>
                        setFieldsData((p) => ({
                          ...p,
                          birthMonth: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                    >
                      <option value="">{t("month")}</option>
                      {MONTHS[i18n.language].map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    {/* Year */}
                    <select
                      name="year-selection"
                      value={fieldsData.birthYear}
                      onChange={(e) =>
                        setFieldsData((p) => ({
                          ...p,
                          birthYear: e.target.value,
                        }))
                      }
                      className="border px-2 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                    >
                      <option value="">{t("year")}</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    autoComplete="off"
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
                    <PhonePrefixSelect
                      value={fieldsData.prefix}
                      onChange={(code) => {
                        setFieldsData((prev) => ({ ...prev, prefix: code }));
                      }}
                    />

                    <input
                      ref={phoneInputRef}
                      id="phoneNumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      spellCheck={false}
                      className="border w-full px-2 py-1 rounded flex-1 border-gray-400 text-[#242223]"
                      value={maskNumber(fieldsData.phoneNumber, mask)}
                      onChange={() => {}}
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Delete",
                        ];

                        // BACKSPACE (single source of truth)
                        if (e.key === "Backspace") {
                          e.preventDefault();
                          setFieldsData((prev) => {
                            // 🇬🇪 Protect mandatory leading 5
                            if (
                              prev.prefix === "+995" &&
                              prev.phoneNumber.length <= 1
                            ) {
                              return prev;
                            }
                            return {
                              ...prev,
                              phoneNumber: prev.phoneNumber.slice(0, -1),
                            };
                          });
                          return;
                        }

                        // Other control keys
                        if (allowedKeys.includes(e.key)) {
                          return;
                        }

                        // Digits only
                        if (!/^[0-9]$/.test(e.key)) {
                          e.preventDefault();
                          return;
                        }

                        // Add digit
                        e.preventDefault();
                        setFieldsData((prev) => {
                          if (prev.phoneNumber.length >= maxDigits) return prev;
                          return {
                            ...prev,
                            phoneNumber: prev.phoneNumber + e.key,
                          };
                        });
                      }}
                      onFocus={(e) => {
                        requestAnimationFrame(() => {
                          const cursorPos = getCursorPosFromDigits(
                            fieldsData.phoneNumber.length,
                            mask
                          );
                          e.target.setSelectionRange(cursorPos, cursorPos);
                        });
                      }}
                      onClick={(e) => {
                        requestAnimationFrame(() => {
                          const cursorPos = getCursorPosFromDigits(
                            fieldsData.phoneNumber.length,
                            mask
                          );
                          e.target.setSelectionRange(cursorPos, cursorPos);
                        });
                      }}
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
                      name="terms-accepted"
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
