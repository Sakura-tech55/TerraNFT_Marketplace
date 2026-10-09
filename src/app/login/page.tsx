import { LoginForm } from "@/components/LoginForm";

/* `next` is where a members-only page sent the visitor from; LoginForm checks it
   with safeNext before following it. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : null} />;
}
