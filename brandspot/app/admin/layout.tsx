export const metadata = { title: "brand.spot — admin" };

/** Bare shell: the login page renders inside this, the guarded pages add their own. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div dir="ltr">{children}</div>;
}
