import type { Metadata } from "next";
import { Suspense } from "react";
import SignIn from "@/components/stories/SignIn";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
