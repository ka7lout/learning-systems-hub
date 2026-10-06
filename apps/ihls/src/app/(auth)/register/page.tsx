import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { registerAction } from "@/app/actions/auth";
import { getSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");
  return <AuthForm mode="register" action={registerAction} />;
}
