"use client";

import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupWithFallbacks = async (payload) => {
    const endpoints = [
      "/companies/signup",
      "/companies/signup/",
      "/companies/register",
      "/companies/register/",
      "/auth/companies/signup",
      "/auth/companies/signup/",
    ];

    let lastError;
    for (const endpoint of endpoints) {
      try {
        const res = await API.post(endpoint, payload);
        return res.data;
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        if (status === 404 || status === 405) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Signup endpoint not available.");
  };

  const autoLogin = async (identifier, rawPassword) => {
    const form = new URLSearchParams();
    form.append("username", identifier);
    form.append("password", rawPassword);

    const res = await API.post("/auth/login", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signupWithFallbacks({
        company_name: company,
        company,
        name,
        email,
        password,
        role: "admin",
      });
      localStorage.setItem("company_name", company);

      try {
        const loginData = await autoLogin(email, password);
        if (loginData?.access_token) {
          localStorage.setItem("token", loginData.access_token);
          const companyName =
            loginData?.company_name ||
            loginData?.company?.name ||
            loginData?.user?.company_name ||
            loginData?.user?.company?.name ||
            company;
          if (companyName) {
            localStorage.setItem("company_name", companyName);
          }
          router.push("/dashboard");
          return;
        }
      } catch {
        // If auto-login fails, user can still login manually.
      }

      router.push("/login");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to create company account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded shadow w-96"
      >
        <h2 className="text-xl font-bold mb-4">
          Create Company
        </h2>

        <input
          placeholder="Company Name"
          className="border p-2 w-full mb-3"
          value={company}
          onChange={(e)=>setCompany(e.target.value)}
          required
        />

        <input
          placeholder="Admin Name"
          className="border p-2 w-full mb-3"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
        />

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        {error ? (
          <p className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          disabled={isSubmitting}
          className="bg-blue-600 text-white w-full p-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create Company"}
        </button>

        <Link href="/login" className="mt-3 block text-center text-sm text-blue-600">
          Back to login
        </Link>
      </form>
    </div>
  );
}
