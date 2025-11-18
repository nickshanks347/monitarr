"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

export const PasswordView = () => {
  const router = useRouter();

  async function submitPassword(_: unknown, formData: FormData) {
  const password = formData.get("password")?.toString();

  if (!password) {
    return { success: false, message: "Password is required" };
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      return { success: false, message: "Incorrect password" };
    }

    return { success: true, message: "Login successful" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

  const [state, formAction, isPending] = useActionState(submitPassword, {
    success: false,
    message: ""
  })

  useEffect(() => {
    if (state.success) {
      router.push("/"); // 🔥 Change to your desired redirect
    }
  }, [state.success]);

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background text-foreground flex flex-col justify-center">
      <form
        action={formAction}
        className="flex flex-col justify-center items-center mb-6 w-full max-w-80 mx-auto gap-2"
      >
        <h1 className="text-3xl font-bold mb-6">monitarr</h1>
        <input type="password"
          name="password"
          placeholder="password"
          className='border-2 border-gray-900 rounded-lg px-4 py-2 mb-4 w-full max-w-sm bg-transparent'
          required
        />
        <Button
          disabled={isPending}
          type="submit"
          className="w-full"
        >
          {isPending ? "Submitting..." : "Submit"}
        </Button>
        {'message' in state && (
          <p className={state.success ? "text-green-600" : "text-red-600"}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  )
}
