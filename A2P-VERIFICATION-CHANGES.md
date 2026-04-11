# A2P 10DLC Verification — Temporary Changes & Revert Plan

> **Purpose**: This file documents EVERY change made to pass the Twilio/TCR A2P 10DLC verification through GoHighLevel (GHL).
>
> **Once verification is approved**, follow the "REVERT PLAN" section to restore the site to its original state and remove the GHL chat widget entirely.

---

## Background — Why these changes were made

Twilio rejected the A2P 10DLC registration with two errors:
- **30891** — Invalid website URL
- **30909** — CTA verification issue

Root cause: GHL requires the **chat widget to be the ONLY method of SMS opt-in** on the site. Any other form with an SMS consent checkbox is treated as a competing/unverified opt-in and triggers automatic rejection.

The site had THREE conflicting opt-in points:
1. SMS consent checkboxes in the contact form (`ContactPage.jsx`)
2. SMS consent checkbox in the checkout/reservation form (`CheckoutForm.jsx`)
3. The GHL chat widget itself was **excluded from `/contact`**, creating an additional mismatch

To pass verification, all SMS-consent UI was temporarily removed from the public forms, the chat widget was extended to cover `/contact`, and a clean GHL submission was made.

---

## CHANGES MADE — file by file

### 1. `src/components/ContactPage.jsx`

**Removed:**
- Two SMS consent checkboxes (`consent1` for transactional, `consent2` for marketing)
- The Privacy Policy / Terms of Service disclosure paragraph below the checkboxes
- `consent1` and `consent2` from the `formData` state and `setFormData` reset
- `consent1` / `consent2` from the POST payload to `/api/contact`
- The `import Link from 'next/link'` import (no longer used after removing the disclosure paragraph)
- Checkbox handling logic in `handleChange` (simplified to only handle text inputs)

**Original state (to restore later):**

```jsx
// imports
import Link from 'next/link';

// formData state
const [formData, setFormData] = useState({
  fullName: '',
  phone: '',
  email: '',
  package: '',
  message: '',
  consent1: false,
  consent2: false
});

// POST body
body: JSON.stringify({
  fullName: formData.fullName,
  phone: formData.phone,
  email: formData.email,
  package: formData.package,
  message: formData.message,
  consent1: formData.consent1,
  consent2: formData.consent2,
}),

// reset after success
setFormData({
  fullName: '',
  phone: '',
  email: '',
  package: '',
  message: '',
  consent1: false,
  consent2: false
});

// handleChange (with checkbox support)
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// JSX block — placed between the <textarea name="message"/> and the submit <Button>
<div className="mb-4">
  <label className="flex gap-2 text-sm text-white/80">
    <input
      type="checkbox"
      name="consent1"
      checked={formData.consent1}
      onChange={handleChange}
      className="mt-1 accent-[#C9A84C]"
    />
    <span>{t.consent1}</span>
  </label>
</div>
<div className="mb-4">
  <label className="flex gap-2 text-sm text-white/80">
    <input
      type="checkbox"
      name="consent2"
      checked={formData.consent2}
      onChange={handleChange}
      className="mt-1 accent-[#C9A84C]"
    />
    <span>{t.consent2}</span>
  </label>
</div>
<p className="text-xs text-white/50 mb-6">
  {language === 'en' ? 'View our ' : 'Consulta nuestra '}
  <Link href={`/${language}/privacy-policy`} className="underline hover:text-primary transition-colors">
    {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
  </Link>
  {language === 'en' ? ' and ' : ' y '}
  <Link href={`/${language}/terms-of-service`} className="underline hover:text-primary transition-colors">
    {language === 'en' ? 'Terms of Service' : 'Términos de Servicio'}
  </Link>.
</p>

// The submit button originally had no `mt-2` class — that was added when we removed the disclosure spacing.
```

---

### 2. `src/app/api/contact/route.js`

**Removed:**
- `const smsConsentTransactional = body.consent1 === true;`
- `const smsConsentMarketing = body.consent2 === true;`
- The "SMS Consent" `<tr>` row from the email HTML template

**Original state (to restore later):**

```js
// After: const trafficSource = sanitizeField(body.trafficSource, 200) || 'Direct';
const smsConsentTransactional = body.consent1 === true;
const smsConsentMarketing = body.consent2 === true;

// Email HTML template — add this <tr> AFTER the Traffic Source row
<tr style="background-color: #f9f9f9;">
  <td style="padding: 8px 12px; font-weight: bold; color: #333;">SMS Consent:</td>
  <td style="padding: 8px 12px; color: #555;">
    Transactional: ${smsConsentTransactional ? '✅ Yes' : '❌ No'} |
    Marketing: ${smsConsentMarketing ? '✅ Yes' : '❌ No'}
  </td>
</tr>
```

---

### 3. `src/components/CheckoutForm.jsx`

**Removed:**
- `smsConsent: false` from the `form` state initialization
- `sms_consent: form.smsConsent` from the POST payload to `/api/reservations`
- The entire SMS Consent checkbox JSX block (between `Special Notes` and `Order Summary`)
- The `import Link from 'next/link'` import (only used for the disclosure paragraph)

**Backend impact**: NONE. The `sms_consent` field was never read by `/api/reservations/route.js` and is not present in the Supabase schema. Verified before removal.

**Original state (to restore later):**

```jsx
// imports
import Link from 'next/link';

// form state — add at the end of the initial useState object
smsConsent: false,

// POST payload — add as the last field before the closing
sms_consent: form.smsConsent,

// JSX block — between Special Notes and Order Summary
{/* SMS Consent */}
<div>
  <label className="flex gap-2 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
    <input
      type="checkbox"
      name="smsConsent"
      checked={form.smsConsent}
      onChange={handleChange}
      className="mt-1 accent-[#C9A84C] shrink-0"
    />
    <span className="text-xs text-white/70">{tr.smsConsent}</span>
  </label>
  <p className="text-xs text-white/40 mt-1 ml-1">
    {language === 'en' ? 'View our ' : 'Consulta nuestra '}
    <Link href={`/${language}/privacy-policy`} className="underline hover:text-primary transition-colors">
      {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
    </Link>
    {language === 'en' ? ' and ' : ' y '}
    <Link href={`/${language}/terms-of-service`} className="underline hover:text-primary transition-colors">
      {language === 'en' ? 'Terms of Service' : 'Términos de Servicio'}
    </Link>.
  </p>
</div>
```

---

### 4. `src/translations/index.js`

**Removed:**
- `en.contact.consent1`
- `en.contact.consent2`
- `en.reservation.smsConsent`
- `es.contact.consent1`
- `es.contact.consent2`
- `es.reservation.smsConsent`

**Original state (to restore later):**

```js
// en.contact (between `message` and `language`)
consent1: 'I consent to receive transactional SMS messages from Star Event Rental related to my account, orders, or services (e.g., booking confirmations, delivery updates, payment reminders). Message frequency varies, up to 10 msgs/month. Msg & Data rates may apply. Reply HELP for help or STOP to opt-out. Consent is not required to purchase goods or services.',
consent2: 'I consent to receive marketing and promotional SMS messages from Star Event Rental including special offers, discounts, and new product updates. Message frequency varies, up to 10 msgs/month. Msg & Data rates may apply. Reply HELP for help or STOP to opt-out. Consent is not required to purchase goods or services.',

// en.reservation (between `specialNotes` and `// Payment split` comment)
smsConsent: 'By submitting this form, you agree to receive text messages from Star Event Rental (e.g., booking confirmations, delivery updates, payment reminders). Message frequency varies, up to 10 msgs/month. Msg & Data rates may apply. Reply STOP to opt out. Reply HELP for help. Consent is not required to purchase goods or services.',

// es.contact (between `message` and `language`)
consent1: 'Consiento recibir mensajes SMS transaccionales de Star Event Rental relacionados con mi cuenta, pedidos o servicios (ej: confirmaciones de reserva, actualizaciones de entrega, recordatorios de pago). La frecuencia varía, hasta 10 msgs/mes. Pueden aplicarse tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar. El consentimiento no es requisito para comprar bienes o servicios.',
consent2: 'Consiento recibir mensajes SMS de marketing y promocionales de Star Event Rental, incluyendo ofertas especiales, descuentos y actualizaciones de nuevos productos. La frecuencia varía, hasta 10 msgs/mes. Pueden aplicarse tarifas de mensajes y datos. Responde HELP para ayuda o STOP para cancelar. El consentimiento no es requisito para comprar bienes o servicios.',

// es.reservation (between `specialNotes` and `// Payment split` comment)
smsConsent: 'Al enviar este formulario, aceptas recibir mensajes de texto de Star Event Rental (ej: confirmaciones de reserva, actualizaciones de entrega, recordatorios de pago). La frecuencia varía, hasta 10 msgs/mes. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para cancelar. Responde HELP para ayuda. El consentimiento no es requisito para comprar bienes o servicios.',
```

---

### 5. `src/components/GHLChatWidget.jsx`

**Changed:**
- `EXCLUDED_PATHS` was `['/contact', '/admin']` → now `['/admin']`
- This makes the GHL chat widget appear on `/contact` (which it didn't before)
- The comment was also updated

**Original state (to restore later):**

```js
// Pages that have forms collecting phone numbers or SMS consent
const EXCLUDED_PATHS = ['/contact', '/admin'];
```

---

## REVERT PLAN — After verification is approved

### Step 1 — Restore the form UIs and translations

**Option A (recommended): use git history**
```bash
# Find the commit hash where the A2P cleanup was applied
git log --oneline | grep -i "a2p\|sms consent\|10dlc"

# Revert that single commit (creates a new commit that undoes it)
git revert <commit-hash>

# OR cherry-pick the original code from before that commit
git checkout <previous-commit-hash> -- \
  src/components/ContactPage.jsx \
  src/app/api/contact/route.js \
  src/components/CheckoutForm.jsx \
  src/translations/index.js \
  src/components/GHLChatWidget.jsx
```

**Option B: manual restore**
Use the "Original state" code blocks above for each of the 5 files. Paste each block back where it was removed.

### Step 2 — Remove the GHL chat widget completely

After SMS verification is approved, the GHL widget is no longer needed and can be removed:

1. **Delete the widget component file:**
   ```bash
   rm src/components/GHLChatWidget.jsx
   ```

2. **Remove the import and mount from `src/components/ClientProviders.jsx`:**
   ```diff
   - import GHLChatWidget from './GHLChatWidget';
   ...
             <Layout>{children}</Layout>
   -         <GHLChatWidget />
           </ConfirmProvider>
   ```

3. **Clean the GHL/LeadConnector entries from `next.config.js` CSP:**
   Remove these tokens from the `Content-Security-Policy` header value:
   - `https://widgets.leadconnectorhq.com` (from `script-src`, `style-src`, `connect-src`, `frame-src`)
   - `https://stcdn.leadconnectorhq.com` (from `script-src`, `style-src`)
   - `https://*.leadconnectorhq.com` (from `connect-src`)
   - `https://d1g145x70srn7h.cloudfront.net` (from `font-src`) — this is the GHL CDN for chat widget fonts

4. **Verify nothing else references the widget:**
   ```bash
   grep -ri "leadconnector\|ghlchat\|chat-widget" src/
   ```
   Should return zero results after the cleanup.

5. **Delete this file** (`A2P-VERIFICATION-CHANGES.md`) once everything is reverted and cleaned.

### Step 3 — Update the Twilio/GHL submission language (if needed)

If the SMS opt-in flow goes back to using the contact/checkout form checkboxes, the GHL Trust Center submission must be updated to describe THAT flow instead of the chat widget. Update these fields in GHL → Trust Center:
- "How do end-users consent to receive messages?"
- "Use case description"

Otherwise the next renewal/audit could trigger another rejection.

---

## VERIFICATION CHECKLIST — confirm before reverting

Do NOT revert until all of these are TRUE:
- [ ] A2P 10DLC Brand status in GHL = **APPROVED**
- [ ] A2P 10DLC Campaign status in GHL = **APPROVED**
- [ ] At least one successful test SMS sent and received from the registered number
- [ ] Decision made about how SMS will be collected post-revert (GHL chat widget OR forms with checkboxes — pick ONE, not both, or you'll be back to square one)

---

## FILES MODIFIED (summary)

| File | Type of change |
|------|----------------|
| `src/components/ContactPage.jsx` | Removed 2 SMS consent checkboxes + disclosure |
| `src/app/api/contact/route.js` | Removed SMS consent fields + email row |
| `src/components/CheckoutForm.jsx` | Removed 1 SMS consent checkbox + disclosure |
| `src/translations/index.js` | Removed `consent1`, `consent2`, `smsConsent` (EN + ES) |
| `src/components/GHLChatWidget.jsx` | Allowed widget on `/contact` (only `/admin` excluded) |

**NOT modified (kept as-is — these are required for legal compliance and the chat widget):**
- `src/components/PrivacyPolicyPage.jsx` — Section 3 "SMS/Text Messaging" disclosure
- `src/components/TermsOfServicePage.jsx` — SMS terms and 18+ requirement
- `next.config.js` — CSP entries for GHL widget (will be cleaned in Step 2 of revert)
