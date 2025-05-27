"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useError } from "@/contexts/ErrorContext";
import apiClient from "@/lib/apiClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function PsychologistRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const router = useRouter();
  const { t } = useLanguage();
  const { setError } = useError();

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

    if (!minLength || !hasNumber || !hasSpecialChar || !hasUpperCase) {
      setPasswordError(t("Password requirements"));
      return false;
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
    e.preventDefault();

    if (!validatePassword(password)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/auth/register-psychologist", {
        email,
        password,
        displayName,
      });
      const data = await response.data;
      await login(data.access_token);

      // Redirect to profile completion with the new user ID
      router.push("/psychologist/complete-profile");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {t("Psychologist Registration")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            {t("Full Name")}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            {t("Email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">
            {t("Password")}
          </label>
          <div className="relative">
            <input
              type="password"
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

          {passwordTouched && (
            <div className="text-sm text-gray-600 space-y-1 mt-2">
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
                    requirements.hasSpecialChar
                      ? "text-green-500"
                      : "text-gray-500"
                  }
                >
                  {t("At least one special character")}
                </li>
                <li
                  className={
                    requirements.hasUpperCase
                      ? "text-green-500"
                      : "text-gray-500"
                  }
                >
                  {t("At least one uppercase")}
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting || ((passwordTouched && passwordError) as boolean)
          }
          className="w-full bg-blue-600 text-white cursor-pointer p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-md"
        >
          {isSubmitting ? t("Registering...") : t("Register as Psychologist")}
        </button>
      </form>
    </div>
  );
}
