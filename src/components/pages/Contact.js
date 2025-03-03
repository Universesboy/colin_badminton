import React from 'react';
import './Contact.css';
import wechatQR from '../assets/wechat-qr.png'; // Make sure this path is correct

function Contact() {
  return (
    <>
      <div className="contact-container">
        <h1 className="contact-heading">Get In Touch</h1>
        
        <div className="contact-content">
          <div className="contact-info-card">
            <h2>Contact Information</h2>
            <div className="contact-info-item">
              <i className="fas fa-phone-alt"></i>
              <p>+647 655 6636</p>
            </div>
            <div className="contact-info-item">
              <i className="fas fa-envelope"></i>
              <p>zhoukeyu123456@gmail.com</p>
            </div>
            <div className="contact-info-item">
              <i className="fab fa-whatsapp"></i>
              <p>WhatsApp: +647 655 6636</p>
            </div>
            <div className="contact-info-item">
              <i className="fab fa-weixin"></i>
              <p>WeChat: ColinZhouzky</p>
            </div>
          </div>
          
          <div className="contact-qr-card">
            <h2>Scan to Connect on WeChat</h2>
            <div className="qr-container">
              <img src={wechatQR} alt="WeChat QR Code" className="qr-code" />
              <p className="qr-caption">Scan the QR code to add me on WeChat</p>
            </div>
          </div>
        </div>
        
        <div className="social-connect-section">
          <h2>Connect With Me</h2>
          <div className="social-icons-container">
            <a 
              href="https://www.instagram.com/zhou.keyu.5?igsh=MWxtMnkwaTQ2bHRlZQ%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a 
              href="https://www.youtube.com/@zhoukeyu9105" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link youtube"
            >
              <i className="fab fa-youtube"></i>
            </a>
            <a 
              href="https://x.com/Colin_Tesla999T/likes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link x"
            >
              <i className="fab fa-x-twitter"></i>
            </a>
            <a 
              href="https://wa.me/6476556636" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link whatsapp"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a 
              href="weixin://dl/chat?ColinZhouzky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link wechat"
            >
              <i className="fab fa-weixin"></i>
            </a>
          </div>
        </div>
        
        <div className="contact-form-card">
          <h2>Send a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Your name"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Your email address"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                placeholder="Message subject"
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows="5" 
                placeholder="Your message"
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              Send Message <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;
