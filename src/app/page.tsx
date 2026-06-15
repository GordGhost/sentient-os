import { redirect } from "next/navigation";

// The existing landing page is preserved verbatim at /public/landing.html and
// served directly by Next. The root route forwards to it.
export default function Home() {
  redirect("/landing.html");
}
