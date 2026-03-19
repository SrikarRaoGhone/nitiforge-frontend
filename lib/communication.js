import API from "./api";

export const sendSMS = async (leadId, message) => {
  const res = await API.post(`/communication/sms/${leadId}`, { message });
  return res.data;
};

export const sendEmail = async (leadId, subject, message) => {
  const res = await API.post(`/communication/email/${leadId}`, { subject, message });
  return res.data;
};

export const createWhatsAppLink = async (leadId, message) => {
  const res = await API.post(`/communication/whatsapp/${leadId}`, { message });
  return res.data;
};

export const getCommunicationLogs = async (leadId) => {
  const res = await API.get(`/communication/logs/${leadId}`);
  return res.data;
};
