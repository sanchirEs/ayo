// Server Component - validates environment before client code loads
// This runs on every request to ensure configuration is correct
import "@/lib/env";
import RootLayoutClient from "./layout-client";

export const metadata = {
  title: "AYO E-Commerce",
  description: "Modern e-commerce platform",
};

export default function RootLayout({ children }) {
  // Environment validation happens on import above
  // If anything is wrong, the app fails immediately with clear error
  return <RootLayoutClient>{children}</RootLayoutClient>;
}

