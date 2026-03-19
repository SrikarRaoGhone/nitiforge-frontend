const ADMIN_ROLES = new Set(["admin", "superadmin", "super_admin"]);
const MANAGER_ROLES = new Set(["manager"]);
const SALES_ROLES = new Set(["sales"]);

export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const isAdminRole = (role) => ADMIN_ROLES.has(normalizeRole(role));

export const isManagerRole = (role) => MANAGER_ROLES.has(normalizeRole(role));

export const isSalesRole = (role) => SALES_ROLES.has(normalizeRole(role));

export const canManageTeam = (role) => isAdminRole(role) || isManagerRole(role);

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const fallbackLeadName = (lead) =>
  [lead?.first_name, lead?.last_name].filter(Boolean).join(" ").trim() ||
  lead?.name ||
  "Unnamed Lead";

export const normalizeUser = (user) => {
  const id = toNumber(user?.id);
  const managerId = toNumber(user?.manager_id ?? user?.managerId);
  const role = normalizeRole(user?.role);

  return {
    ...user,
    id,
    role,
    manager_id: managerId,
    manager_name:
      user?.manager_name ||
      user?.managerName ||
      user?.manager?.name ||
      "",
    name:
      user?.name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
      user?.email ||
      "Unnamed User",
  };
};

export const normalizeUsers = (users) =>
  (Array.isArray(users) ? users : [])
    .map(normalizeUser)
    .filter((user) => user.id !== null);

export const getUserMap = (users) =>
  normalizeUsers(users).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

export const getDirectReports = (users, managerId) => {
  const normalizedManagerId = toNumber(managerId);
  return normalizeUsers(users).filter((user) => user.manager_id === normalizedManagerId);
};

export const getVisibleUsers = (users, currentUser) => {
  const normalizedUsers = normalizeUsers(users);
  const me = normalizeUser(currentUser || {});

  if (isAdminRole(me.role)) {
    return normalizedUsers;
  }

  if (isManagerRole(me.role)) {
    return normalizedUsers.filter(
      (user) => user.id === me.id || user.manager_id === me.id,
    );
  }

  return normalizedUsers.filter((user) => user.id === me.id);
};

export const getAssignableUsers = (users, currentUser) => {
  const me = normalizeUser(currentUser || {});
  const visibleUsers = getVisibleUsers(users, currentUser);

  if (isAdminRole(me.role)) {
    return visibleUsers.filter((user) => !isAdminRole(user.role));
  }

  if (isManagerRole(me.role)) {
    return visibleUsers.filter(
      (user) => user.id === me.id || isSalesRole(user.role),
    );
  }

  return [];
};

export const normalizeLead = (lead, userMap = {}) => {
  const assignedTo = toNumber(
    lead?.assigned_to ??
      lead?.assignedTo ??
      lead?.owner_id ??
      lead?.ownerId ??
      lead?.user_id ??
      lead?.userId,
  );
  const owner = assignedTo !== null ? userMap[assignedTo] : null;

  return {
    ...lead,
    id: toNumber(lead?.id) ?? lead?.id,
    assigned_to: assignedTo,
    assigned_to_name:
      lead?.assigned_to_name ||
      lead?.assignedToName ||
      lead?.owner_name ||
      lead?.ownerName ||
      owner?.name ||
      "",
    name: fallbackLeadName(lead),
  };
};

export const normalizeLeads = (leads, users = []) => {
  const userMap = getUserMap(users);
  return (Array.isArray(leads) ? leads : []).map((lead) => normalizeLead(lead, userMap));
};

export const filterLeadsByHierarchy = (leads, currentUser, users = []) => {
  const normalizedLeads = normalizeLeads(leads, users);
  const me = normalizeUser(currentUser || {});

  if (isAdminRole(me.role)) {
    return normalizedLeads;
  }

  if (isManagerRole(me.role)) {
    const teamIds = new Set(
      [me.id, ...getDirectReports(users, me.id).map((user) => user.id)].filter(Boolean),
    );
    return normalizedLeads.filter((lead) => teamIds.has(lead.assigned_to));
  }

  return normalizedLeads.filter((lead) => lead.assigned_to === me.id);
};

const parseCurrency = (value) => {
  if (typeof value === "number") return value;
  const cleaned = String(value || "").replace(/[^\d.-]/g, "");
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const buildLeadSummary = (leads) => {
  const today = new Date().toISOString().slice(0, 10);
  const activeLeads = leads.filter((lead) => {
    const stage = normalizeRole(lead?.stage || lead?.status);
    return !["closed", "won", "lost"].includes(stage);
  });
  const highRiskDeals = leads.filter((lead) => Number(lead?.ai_score || 0) >= 75);

  return {
    total_leads: leads.length,
    today_leads: leads.filter((lead) => String(lead?.created_at || lead?.createdAt || "").slice(0, 10) === today).length,
    hot_leads: leads.filter((lead) => normalizeRole(lead?.ai_priority) === "high").length,
    pending_followups: activeLeads.length,
    active_leads: activeLeads.length,
    high_risk_deals: highRiskDeals.length,
    team_revenue: leads.reduce((sum, lead) => sum + parseCurrency(lead?.budget), 0),
  };
};

export const buildPipelineData = (leads) => {
  const counts = leads.reduce((acc, lead) => {
    const stage = lead?.stage || lead?.status || "New";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([stage, count]) => ({ stage, count }));
};

export const buildLeadSourceData = (leads) => {
  const counts = leads.reduce((acc, lead) => {
    const source = lead?.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([source, count]) => ({ source, count }));
};

export const buildSalesPerformance = (leads, users = []) => {
  const userMap = getUserMap(users);
  const grouped = leads.reduce((acc, lead) => {
    const ownerId = lead.assigned_to;
    if (!ownerId) return acc;
    const item = acc[ownerId] || {
      user_id: ownerId,
      agent: userMap[ownerId]?.name || lead.assigned_to_name || "Unassigned",
      closed_deals: 0,
      total_leads: 0,
      pipeline_value: 0,
    };

    item.total_leads += 1;
    item.pipeline_value += parseCurrency(lead?.budget);
    if (["closed", "won"].includes(normalizeRole(lead?.stage || lead?.status))) {
      item.closed_deals += 1;
    }

    acc[ownerId] = item;
    return acc;
  }, {});

  return Object.values(grouped).sort((left, right) => {
    if (right.closed_deals !== left.closed_deals) {
      return right.closed_deals - left.closed_deals;
    }
    return right.pipeline_value - left.pipeline_value;
  });
};

export const buildManagerInsights = (leads, users = [], currentUser) => {
  const me = normalizeUser(currentUser || {});
  const directReports = getDirectReports(users, me.id);
  const performance = buildSalesPerformance(
    leads.filter((lead) => directReports.some((user) => user.id === lead.assigned_to)),
    directReports,
  );
  const topPerformer = performance[0] || null;

  return {
    team_size: directReports.length,
    top_performer: topPerformer,
    high_risk_deals: leads.filter((lead) => Number(lead?.ai_score || 0) >= 75).length,
    active_leads: leads.filter((lead) => !["closed", "won", "lost"].includes(normalizeRole(lead?.stage || lead?.status))).length,
    team_revenue: leads.reduce((sum, lead) => sum + parseCurrency(lead?.budget), 0),
  };
};

export const getScopeLabel = (role) => {
  if (isAdminRole(role)) return "All company leads";
  if (isManagerRole(role)) return "All team leads ranked";
  return "Your leads only";
};
