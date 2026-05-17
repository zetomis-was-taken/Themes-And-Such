import AuthTabs from "./auth-tabs";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const defaultTab =
    resolvedSearchParams.tab === "register" ? "register" : "login";

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthTabs defaultTab={defaultTab} />
    </div>
  );
}
