"use client";

import { useState, useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import apiClient from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  type: "login" | "register";
};

export const AuthForm = ({ type }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { t } = useLanguage();
  const { setError } = useError();
  const { login } = useAuth();

  // Password validation states
  const [passwordError, setPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Password requirements
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUpperCase: false,
  });

  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched]);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);

    setRequirements({
      minLength,
      hasNumber,
      hasSpecialChar,
      hasUpperCase,
    });

    if (type === "register") {
      if (!minLength || !hasNumber || !hasSpecialChar || !hasUpperCase) {
        setPasswordError(t("Password requirements"));
        return false;
      }
    }

    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!passwordTouched) {
      setPasswordTouched(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (type === "register" && !validatePassword(password)) {
        return;
      }

      const response = await apiClient.post(`/auth/${type}`, {
        email,
        password,
        displayName,
      });

      const data = await response.data;
      await login(data.access_token);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 space-y-5 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        {type === "login" ? t("Login") : t("Registrate")}
      </h2>

      {type === "register" ? (
        <input
          type="name"
          placeholder={t("Name")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <></>
      )}

      <input
        type="email"
        placeholder={t("Email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />

      <div className="relative">
        <input
          type="password"
          placeholder={t("Password")}
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => setPasswordTouched(true)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        {passwordError && passwordTouched && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      {type === "register" && passwordTouched && (
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium">{t("Password must contain")}:</p>
          <ul className="list-disc pl-5">
            <li
              className={
                requirements.minLength ? "text-green-500" : "text-gray-500"
              }
            >
              {t("Minimum 8 characters")}
            </li>
            <li
              className={
                requirements.hasNumber ? "text-green-500" : "text-gray-500"
              }
            >
              {t("At least one number")}
            </li>
            <li
              className={
                requirements.hasSpecialChar ? "text-green-500" : "text-gray-500"
              }
            >
              {t("At least one special character")}
            </li>
            <li
              className={
                requirements.hasUpperCase ? "text-green-500" : "text-gray-500"
              }
            >
              {t("At least one uppercase")}
            </li>
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
      >
        {type === "login" ? t("Login") : t("Registrate")}
      </button>
    </form>
  );
};
