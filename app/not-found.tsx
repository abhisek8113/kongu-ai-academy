import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-[#5d5550]">That page doesn't exist.</p>
      <Link href="/labs" className="btn-red mt-6">Browse labs</Link>
    </div>
  );
}
