import { redirect } from "next/navigation";

export default function WomenPage() {
  redirect("/catalog?gender=women");
}
