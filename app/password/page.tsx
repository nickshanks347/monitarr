import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PasswordView } from "./passwordView";

export default async function SecretPage() {
  const cookie = await cookies();
  const password = cookie.get("password")

  if (process.env.PAGE_PASSWORD && password && password.value === process.env.PAGE_PASSWORD) {
    return redirect("/");
  }

  return <PasswordView />;
}