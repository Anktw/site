import { Metadata } from "next";
import Contact from "./contact";

export const metadata: Metadata = {
  title: "Contact | Ankit Tiwari",
  description: "Get in touch with us"
};

export default function ContactPage() {
  return (
    <Contact />
  )
}