import { auth, currentUser } from "@clerk/nextjs/server";
import { AppHeaderClient } from "./AppHeaderClient";

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const f = firstName?.trim()?.[0]?.toUpperCase() ?? "";
  const l = lastName?.trim()?.[0]?.toUpperCase() ?? "";
  if (f || l) return f + l;
  // Fall back to first letter of email prefix
  const emailPrefix = email?.split("@")[0]?.[0]?.toUpperCase() ?? "";
  return emailPrefix || "?";
}

export async function AppHeader() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  // Greeting name: firstName → first word of fullName → email prefix → "there"
  const rawFirst =
    user?.firstName?.trim() ||
    user?.fullName?.trim().split(" ")[0] ||
    email.split("@")[0] ||
    "there";
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || email.split("@")[0] || "User";
  const initials = getInitials(user?.firstName, user?.lastName, email);
  const imageUrl = user?.imageUrl ?? "";

  return <AppHeaderClient initials={initials} firstName={firstName} fullName={fullName} email={email} imageUrl={imageUrl} />;
}
