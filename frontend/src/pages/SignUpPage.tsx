import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <SignUp routing="path" path="/sign-up" fallbackRedirectUrl="/" />
    </div>
  );
}
