import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signupAction } from "@/app/actions";
import { AuthForm } from "@/components/AuthForm";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <AuthForm mode="signup" action={signupAction} />;
}
