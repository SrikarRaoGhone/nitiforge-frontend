import API from "./api";
import { getCurrentCompany, getCurrentUser, getTokenProfile } from "./auth";

const normalizeCompany = (source) => {
  if (!source) return null;

  const name =
    source.company_name ||
    source.companyName ||
    source.company?.name ||
    source.organization?.name ||
    source.tenant?.name ||
    source.name ||
    "";

  return name ? { ...source, name } : null;
};

export const getCompany = async () => {
  const endpoints = [
    "/companies/me",
    "/company/me",
    "/companies/current",
    "/companies/profile",
    "/auth/company",
  ];

  let lastError;
  for (const endpoint of endpoints) {
    try {
      const res = await API.get(endpoint);
      const normalized = normalizeCompany(res.data);
      if (normalized) return normalized;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        continue;
      }
      if (status === 401 || status === 403) {
        return null;
      }
      continue;
    }
  }

  try {
    const profile = await getCurrentUser();
    const normalizedProfile = normalizeCompany(profile);
    if (normalizedProfile) {
      return normalizedProfile;
    }

    const tokenProfile = getTokenProfile();
    const companyRef =
      profile?.company_id ||
      profile?.company?.id ||
      tokenProfile?.company_id ||
      tokenProfile?.company?.id;
    const companyData = await getCurrentCompany(companyRef);
    const normalizedCompany = normalizeCompany(companyData);
    if (normalizedCompany) {
      return normalizedCompany;
    }
  } catch {
    // Fall through to token/local cache below.
  }

  const tokenProfile = getTokenProfile();
  const normalizedToken = normalizeCompany(tokenProfile);
  if (normalizedToken) {
    return normalizedToken;
  }

  const cachedCompany =
    typeof window !== "undefined" ? localStorage.getItem("company_name") : "";
  if (cachedCompany) {
    return { name: cachedCompany };
  }

  if (lastError?.response?.status && lastError.response.status >= 500) {
    return null;
  }

  return null;
};
