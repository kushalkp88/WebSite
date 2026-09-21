import { redirect } from "next/navigation";

export default function MenPage() {
  redirect("/catalog?gender=men");
}
