import { LegalPage } from "../LegalPage";

export default function PrivacyPage(){
 return <LegalPage eyebrow="YOUR PRIVACY" title="Privacy Policy" intro="This policy explains what mypookie. collects and how information is used to deliver private digital gifts.">
  <section><h2>Information we collect</h2><p>We process account details such as name, email and Firebase user identifier; gift details and customization; uploaded photos, audio and video; recipient interactions and responses; contribution messages; purchase and coupon records; ratings; and basic technical logs needed for security and reliability.</p></section>
  <section><h2>How information is used</h2><p>Information is used to authenticate users, save drafts, create and deliver gifts, schedule reveals, process payments, protect private content, provide AI-assisted suggestions, show responses to the appropriate sender, prevent misuse and improve reliability.</p></section>
  <section><h2>Service providers</h2><p>We use service providers including Firebase for authentication and media storage, Railway for application and database hosting, Groq for optional AI generation, and Razorpay for payment processing when enabled. Each provider processes only the information needed for its function under its own privacy terms.</p></section>
  <section><h2>Private links and sensitive content</h2><p>Gift and contribution links should be treated as private. Gift-card redemption details are encrypted separately on the backend. PIN-protected reports store only a one-way PIN hash. Do not upload information you would not want the intended recipient to see.</p></section>
  <section><h2>Retention and deletion</h2><p>We retain account, order and gift data while needed to provide the service and meet legal, fraud-prevention and accounting requirements. You may request access, correction or deletion. Some transaction records may be retained where required by law.</p></section>
  <section><h2>Your choices</h2><p>You may choose not to enable AI suggestions, soundtrack playback, compatibility reports or optional contributions. Browser permissions control camera and microphone access and can be withdrawn in browser settings.</p></section>
  <section><h2>Contact</h2><p>For a privacy request, email <a href="mailto:himanshushekharr.pvt@gmail.com">himanshushekharr.pvt@gmail.com</a> with the subject “mypookie privacy request”.</p></section>
 </LegalPage>;
}
