import { redirect } from "next/navigation";

export default function AuthorRootPage() {
  redirect("/author/dashboard");
}
