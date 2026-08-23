import { Suspense } from "react";
import LoginForm from "./login-form";

// useSearchParams (for the ?next= redirect) forces this page out of the
// static prerender, so the form sits behind a Suspense boundary and the page
// is rendered per request.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
