import React, { useState } from 'react';
import PageHeader, { usePageMeta } from '../PageHeader';
import AnimatedSection from '../AnimatedSection';
import Icon from '../Icon';
import { contact, socials } from '../../data/site';
import './Contact.css';

const methods = [
  { icon: 'whatsapp', label: 'WhatsApp', value: contact.phoneDisplay, href: contact.whatsapp, external: true },
  { icon: 'mail', label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
  { icon: 'phone', label: 'Phone', value: contact.phoneDisplay, href: contact.phoneHref },
  { icon: 'wechat', label: 'WeChat', value: contact.wechatId },
];

// The site has no backend, so the form composes an email in the visitor's
// own mail app instead of pretending to send.
function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const update = (e) => setFields({ ...fields, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const body = `${fields.message}\n\n— ${fields.name}${fields.email ? ` (${fields.email})` : ''}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(fields.subject || 'Badminton coaching enquiry')}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form__row">
        <label className="field">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required value={fields.name} onChange={update} />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required value={fields.email} onChange={update} />
        </label>
      </div>
      <label className="field">
        <span>Subject</span>
        <input name="subject" type="text" placeholder="e.g. Coaching enquiry"value={fields.subject} onChange={update} />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" rows="5" required value={fields.message} onChange={update} />
      </label>
      <div className="contact-form__foot">
        <button type="submit" className="btn">
          Send message <Icon name="arrow" />
        </button>
        <p className="muted contact-form__note" role="status">
          {sent ? 'Your email app should now be open with this message ready to send.' : 'Opens your email app with the message ready to send.'}
        </p>
      </div>
    </form>
  );
}

function Contact() {
  usePageMeta('Contact', 'Contact badminton coach Colin Zhou by WhatsApp, WeChat, email or phone. Coaching in English and Chinese.');

  return (
    <>
      <PageHeader eyebrow="Contact" title="Get In Touch" lead="Questions about coaching, training or competition — reach out on whichever app you use." />

      <section className="section" aria-label="Contact methods">
        <div className="container contact-grid">
          <div className="contact-methods">
            {methods.map((m, i) => {
              const content = (
                <>
                  <span className="contact-method__icon">
                    <Icon name={m.icon} size={22} />
                  </span>
                  <span className="contact-method__text">
                    <span className="contact-method__label">{m.label}</span>
                    <span className="contact-method__value">{m.value}</span>
                  </span>
                  {m.href && <Icon name="arrow" className="contact-method__arrow" size={18} />}
                </>
              );
              return (
                <AnimatedSection key={m.label} delay={i * 70}>
                  {m.href ? (
                    <a className="contact-method" href={m.href} {...(m.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {content}
                    </a>
                  ) : (
                    <div className="contact-method">{content}</div>
                  )}
                </AnimatedSection>
              );
            })}

            <AnimatedSection className="contact-socials" delay={300}>
              <h2 className="eyebrow">Connect With Me</h2>
              <div className="contact-socials__row">
                {socials.map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="chip">
                    <Icon name={s.icon} /> {s.name}
                  </a>
                ))}
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection className="contact-qr" delay={120}>
            <img src="/media/wechat-qr.webp" width="664" height="900" alt={`WeChat QR code for ${contact.wechatId}`} loading="lazy" />
            <div>
              <h2 className="h3">Scan to Connect on WeChat</h2>
              <p className="muted">Scan the QR code to add me on WeChat</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="section section--sunken" aria-labelledby="form-title">
        <div className="container contact-form-wrap">
          <AnimatedSection>
            <p className="eyebrow">Message</p>
            <h2 id="form-title" className="h2">
              Send a Message
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

export default Contact;
