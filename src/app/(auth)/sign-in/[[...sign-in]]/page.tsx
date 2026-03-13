import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
      <SignIn forceRedirectUrl="/home" />
      <p className="text-xs text-center max-w-xs" style={{ color: "#999" }}>
        If Google sign-in isn&apos;t working on mobile, use the <strong>Continue with email</strong> option above.
      </p>
    </div>
  );
}
