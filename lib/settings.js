import API from "./api";
import { getCompany } from "./company";

const normalizeSettings = (source) => ({
  name: source?.name || source?.company_name || "",
  email: source?.email || "",
  phone: source?.phone || "",
  sms_api_key: source?.sms_api_key || source?.smsApiKey || "",
  whatsapp_api_key: source?.whatsapp_api_key || source?.whatsappApiKey || "",
  email_api_key: source?.email_api_key || source?.emailApiKey || "",
  openai_api_key: source?.openai_api_key || source?.openaiApiKey || "",
  use_own_openai: Boolean(source?.use_own_openai ?? source?.useOwnOpenai),
  ai_usage: Number(source?.ai_usage ?? source?.aiUsage ?? 0),
});

export const getCompanySettings = async () => {
  const endpoints = ["/settings/company", "/settings/company/"];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const res = await API.get(endpoint);
      return normalizeSettings(res.data);
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) continue;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load company settings",
      );
    }
  }

  const fallbackCompany = await getCompany();
  if (fallbackCompany) {
    return normalizeSettings(fallbackCompany);
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "Settings endpoint not available. Backend must expose /settings/company.",
  );
};

export const updateCompanySettings = async (data) => {
  const endpoints = ["/settings/company", "/settings/company/"];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const res = await API.put(endpoint, data);
      return {
        ...res.data,
        company: res.data?.company ? normalizeSettings(res.data.company) : undefined,
      };
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 404 || status === 405) continue;
      if (status === 401 || status === 403) {
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to update company settings",
      );
    }
  }

  throw new Error(
    lastError?.response?.data?.detail ||
      "Settings update endpoint not available. Backend must expose PUT /settings/company.",
  );
};
