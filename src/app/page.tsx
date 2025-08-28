import HomeClient from "@/app/page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filter Service",
};

export default function Home() {
  return (
    <div>
      <HomeClient />
    </div>
  );
}
