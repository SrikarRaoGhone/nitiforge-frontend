import LeadsPageClient from "./LeadsPageClient";

export default async function LeadsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialSearchQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";

  return <LeadsPageClient initialSearchQuery={initialSearchQuery} />;
}
