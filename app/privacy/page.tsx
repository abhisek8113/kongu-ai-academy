export const metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <article className="wrap max-w-3xl py-16">
      <p className="kicker">Legal</p>
      <h1 className="mt-3 text-4xl">Privacy policy</h1>
      <p className="mt-2 text-sm text-mute">Last updated: 26 November 2026</p>
      <div className="mt-8 space-y-5 text-[16px] text-ink/90 [&_h2]:mt-8 [&_h2]:text-xl">
        <p>Kongu AI Academy ("we") runs this website from Coimbatore, Tamil Nadu. This policy explains what we collect and why.</p>
        <h2>What we collect</h2>
        <p>When you request a demo: your name, phone number, email (optional), institution, course of interest, number of participants, preferred date and message. When you create an account: your name, email, phone and institution, plus which labs you open and complete and when you log in, so we can track learning progress.</p>
        <h2>How we use it</h2>
        <p>To contact you about your demo or enquiry, to run your account and show your progress, to issue and verify certificates, and to improve our courses. We do not sell your data or share it for advertising.</p>
        <h2>Where it is stored</h2>
        <p>Data is stored with our database provider, Supabase, and the website is hosted on Vercel. Passwords are handled by Supabase Authentication and are never visible to us.</p>
        <h2>Your choices</h2>
        <p>You can ask us to correct or delete your data at any time by emailing abhisekmurugesan@gmail.com or messaging +91 95145 24599.</p>
        <h2>Certificates</h2>
        <p>Certificate verification shows only the recipient's name, programme, institution and issue date to anyone who enters a valid certificate ID.</p>
        <h2>Contact</h2>
        <p>Kongu AI Academy, Coimbatore, Tamil Nadu · abhisekmurugesan@gmail.com · +91 95145 24599</p>
      </div>
    </article>
  );
}
