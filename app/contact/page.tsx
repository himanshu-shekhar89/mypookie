import { LegalPage } from "../LegalPage";

export default function ContactPage(){
 return <LegalPage eyebrow="WE’RE HERE" title="Contact Us" intro="Need help with a draft, shared gift, contribution or payment issue? Send the details below.">
  <section className="contact-card"><h2>Email support</h2><a className="contact-email" href="mailto:himanshushekharr.pvt@gmail.com">himanshushekharr.pvt@gmail.com</a><p>Include the email used to sign in and, where available, the gift or order identifier. Do not send passwords, card numbers, UPI PINs or private redemption codes.</p></section>
  <section><h2>Useful subjects</h2><ul><li>Gift or draft support</li><li>Contribution-link support</li><li>Payment or duplicate-charge review</li><li>Privacy or deletion request</li><li>Copyright or safety report</li></ul></section>
  <section><h2>Response time</h2><p>We aim to respond within 2 business days. Payment investigations and privacy requests may take longer where verification is required.</p></section>
 </LegalPage>;
}
