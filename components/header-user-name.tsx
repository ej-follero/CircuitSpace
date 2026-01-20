"use client";

import { useUser } from "@clerk/nextjs";

export function HeaderUserName() {
  const { user } = useUser();

  if (!user) return null;

  const displayName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "User";

  return (
    <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
      {displayName}
    </span>
  );
}
