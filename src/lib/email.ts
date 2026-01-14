import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789') // Fallback to prevent crash, will fail on send

interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return { success: false, error: { message: 'Missing API Key in server environment' } }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'MarketPulse <notifications@resend.dev>', // Use verified domain in prod
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('📧 Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

// ==========================================
// SHARED STYLES & LAYOUTS
// ==========================================
const COLORS = {
  primary: '#2563eb', // Blue
  success: '#10b981', // Green
  warning: '#f59e0b', // Amber
  danger: '#ef4444',  // Red
  dark: '#1f2937',    // Gray-800
  light: '#f9fafb',   // Gray-50
  info: '#3b82f6',    // Sky Blue
  text: '#4b5563',    // Gray-600
}

const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f3f4f6; }
  .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
  .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  .header { padding: 40px 40px 30px; text-align: center; }
  .logo { font-size: 24px; font-weight: 800; color: #1f2937; text-decoration: none; letter-spacing: -0.5px; }
  .hero-image { width: 100%; height: 6px; display: block; }
  .content { padding: 0 40px 40px; }
  .h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 20px; text-align: center; }
  .text { font-size: 16px; color: #4b5563; margin-bottom: 20px; }
  .button-container { text-align: center; margin: 30px 0; }
  .button { display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; }
  .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
  .footer { background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
  .footer-text { font-size: 12px; color: #9ca3af; margin-bottom: 10px; }
  .social-links { margin-top: 20px; }
  .social-link { color: #6b7280; text-decoration: none; margin: 0 10px; font-size: 12px; }
  
  /* Component Styles */
  .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
  .info-row:last-child { border-bottom: none; }
  .info-label { font-weight: 600; color: #64748b; }
  .info-value { font-weight: 500; color: #0f172a; }
  
  .code-block { background: #1e293b; color: #ffffff; font-family: 'Courier New', monospace; font-size: 32px; letter-spacing: 8px; padding: 24px; text-align: center; border-radius: 8px; margin: 30px 0; font-weight: 700; position: relative; overflow: hidden; }
  
  .step-list { list-style: none; padding: 0; margin: 20px 0; }
  .step-item { display: flex; align-items: flex-start; margin-bottom: 20px; }
  .step-number { width: 32px; height: 32px; background-color: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px; flex-shrink: 0; }
  .step-content { flex: 1; }
  .step-title { font-weight: 700; color: #1e293b; margin: 0 0 4px; }
  .step-desc { font-size: 14px; color: #64748b; margin: 0; }
`

// Helper to wrap content in main layout
function wrapLayout(themeColor: string, title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="wrapper">
        <div class="email-container">
          <div style="background-color: ${themeColor}; height: 8px;"></div>
          <div class="header">
            <div class="logo">Market<span style="color: ${themeColor}">Pulse</span></div>
          </div>
          <div class="content">
            <h1 class="h1">${title}</h1>
            ${content}
          </div>
          <div class="footer">
            <p class="footer-text">© ${new Date().getFullYear()} MarketPulse Inc. All rights reserved.</p>
            <p class="footer-text">123 Commerce St, Business City, BC 12345</p>
            <div class="social-links">
              <a href="#" class="social-link">Privacy Policy</a> • 
              <a href="#" class="social-link">Terms of Service</a> • 
              <a href="#" class="social-link">Support</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// ==========================================
// MODULE 1: SIGNUP & ONBOARDING TEMPLATES
// ==========================================

export function getVerificationCodeEmailHtml(name: string, code: string) {
  return wrapLayout(COLORS.primary, 'Verify Your Email Address', `
    <p class="text">Dear ${name},</p>
    <p class="text">Welcome to MarketPulse! To complete your registration and ensure the security of your account, please verify your email address by entering the code below.</p>
    
    <div class="code-block">
      ${code}
    </div>
    
    <p class="text" style="text-align: center; font-size: 14px; color: #6b7280;">This code will expire in 15 minutes.</p>
    
    <div class="info-card" style="background-color: #eff6ff; border-color: #bfdbfe;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Security Tip:</strong> MarketPulse staff will never ask for this code. Please do not share it with anyone.</p>
    </div>
  `)
}

export function getSignupConfirmationEmailHtml(name: string, email: string, storeName?: string) {
  return wrapLayout(COLORS.success, 'Registration Received', `
    <p class="text">Hello ${name},</p>
    <p class="text">Thank you for choosing MarketPulse. We have successfully received your registration application.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Account Name</span>
        <span class="info-value">${name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email Address</span>
        <span class="info-value">${email}</span>
      </div>
      ${storeName ? `
      <div class="info-row">
        <span class="info-label">Store Application</span>
        <span class="info-value">${storeName}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Current Status</span>
        <span class="info-value" style="color: #f59e0b; font-weight: 700;">Pending Review</span>
      </div>
    </div>
    
    <p class="text">Our team is currently reviewing your details. This process typically takes <strong>24-48 hours</strong>. You will receive another email as soon as your account status is updated.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/login" class="button" style="background-color: ${COLORS.success}">Go to Login Page</a>
    </div>
  `)
}

export function getApprovalEmailHtml(storeName: string, ownerName: string) {
  return wrapLayout(COLORS.success, 'Registration Approved! 🎉', `
    <p class="text">Dear ${ownerName},</p>
    <p class="text">We are delighted to inform you that your registration for <strong>${storeName}</strong> has been fully approved!</p>
    <p class="text">You now have complete access to the MarketPulse platform, where you can start managing your inventory, tracking sales, and growing your business.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.success}">Access Dashboard</a>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="font-size: 18px; margin-bottom: 15px;">Your Next Steps:</h3>
    <ul class="step-list">
      <li class="step-item">
        <div class="step-number" style="background-color: #ecfdf5; color: #059669;">1</div>
        <div class="step-content">
          <p class="step-title">Set up your inventory</p>
          <p class="step-desc">Add your first products or import them in bulk.</p>
        </div>
      </li>
      <li class="step-item">
        <div class="step-number" style="background-color: #ecfdf5; color: #059669;">2</div>
        <div class="step-content">
          <p class="step-title">Configure POS</p>
          <p class="step-desc">Set up your checkout settings and add staff members.</p>
        </div>
      </li>
    </ul>
  `)
}

export function getRejectionEmailHtml(storeName: string, ownerName: string, reason?: string) {
  return wrapLayout(COLORS.danger, 'Application Status Update', `
    <p class="text">Dear ${ownerName},</p>
    <p class="text">Thank you for your interest in MarketPulse. After a careful review of your application for <strong>${storeName}</strong>, we regret to inform you that we are unable to approve your registration at this time.</p>
    
    ${reason ? `
    <div class="info-card" style="background-color: #fef2f2; border-color: #fecaca; border-left: 4px solid #ef4444;">
      <h4 style="margin: 0 0 10px; color: #b91c1c;">Reason for Rejection:</h4>
      <p style="margin: 0; color: #991b1b;">${reason}</p>
    </div>
    ` : ''}
    
    <p class="text">This decision allows you to address the issues highlighted above. Once you have made the necessary changes, you are welcome to submit a new application.</p>
    
    <div class="button-container">
      <a href="mailto:support@marketpulse.com" class="button" style="background-color: #4b5563;">Contact Support</a>
    </div>
  `)
}

export function getDocumentRequestEmailHtml(name: string, storeName: string, documents: string[]) {
  return wrapLayout(COLORS.warning, 'Action Required: Additional Documents', `
    <p class="text">Dear ${name},</p>
    <p class="text">We are currently processing your application for <strong>${storeName}</strong>. To proceed with the verification process, we require the following additional documentation:</p>
    
    <div class="info-card" style="background-color: #fffbeb; border-color: #fde68a;">
      <ul style="margin: 0; padding-left: 20px;">
        ${documents.map(doc => `<li style="margin-bottom: 8px; color: #92400e; font-weight: 600;">${doc}</li>`).join('')}
      </ul>
    </div>
    
    <p class="text">Please upload these documents clearly. Scanned copies or high-quality photos are accepted. Failure to provide these within <strong>7 days</strong> may result in the cancellation of your application.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/login" class="button" style="background-color: ${COLORS.warning}">Upload Documents</a>
    </div>
  `)
}

export function getStoreActivationEmailHtml(ownerName: string, storeName: string) {
  return wrapLayout(COLORS.primary, 'Welcome to MarketPulse!', `
    <p class="text">Hello ${ownerName},</p>
    <p class="text">Congratulations! Your store setup for <strong>${storeName}</strong> is complete.</p>
    
    <p class="text">We've prepared a personalized dashboard for you. Here are some of the powerful features you now have at your fingertips:</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <div style="font-size: 24px; margin-bottom: 5px;">📦</div>
        <div style="font-weight: 700; font-size: 14px;">Smart Inventory</div>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <div style="font-size: 24px; margin-bottom: 5px;">💳</div>
        <div style="font-weight: 700; font-size: 14px;">Fast POS</div>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <div style="font-size: 24px; margin-bottom: 5px;">📈</div>
        <div style="font-weight: 700; font-size: 14px;">Live Analytics</div>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <div style="font-size: 24px; margin-bottom: 5px;">🤖</div>
        <div style="font-weight: 700; font-size: 14px;">AI Insights</div>
      </div>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.primary}">Launch Dashboard</a>
    </div>
  `)
}

export function getOnboardingEmailHtml(ownerName: string, storeName: string) {
  return wrapLayout(COLORS.primary, 'Getting Started Guide 🚀', `
    <p class="text">Hi ${ownerName},</p>
    <p class="text">Ready to make your first sale with <strong>${storeName}</strong>? Follow this quick 5-step guide to get up and running.</p>
    
    <ul class="step-list">
      <li class="step-item">
        <div class="step-number">1</div>
        <div class="step-content">
          <p class="step-title">Add Your Products</p>
          <p class="step-desc">Go to the Products tab. You can use our AI assistant to auto-fill details!</p>
        </div>
      </li>
      <li class="step-item">
        <div class="step-number">2</div>
        <div class="step-content">
          <p class="step-title">Create Staff Accounts</p>
          <p class="step-desc">Add cashiers and managers under the Staff section.</p>
        </div>
      </li>
      <li class="step-item">
        <div class="step-number">3</div>
        <div class="step-content">
          <p class="step-title">Test the POS</p>
          <p class="step-desc">Run a test transaction to familiarize yourself with the checkout flow.</p>
        </div>
      </li>
      <li class="step-item">
        <div class="step-number">4</div>
        <div class="step-content">
          <p class="step-title">Check AI Inventory</p>
          <p class="step-desc">Review stocking recommendations to prevent stockouts.</p>
        </div>
      </li>
      <li class="step-item">
        <div class="step-number">5</div>
        <div class="step-content">
          <p class="step-title">View Reports</p>
          <p class="step-desc">Watch your daily sales tick up in real-time on the dashboard.</p>
        </div>
      </li>
    </ul>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.primary}">Start Selling</a>
    </div>
  `)
}

// ==========================================
// MODULE 2: USER ACCOUNTS & STAFF TEMPLATES
// ==========================================

export function getPasswordResetEmailHtml(name: string, resetLink: string) {
  return wrapLayout(COLORS.danger, 'Password Reset Request', `
    <p class="text">Hello ${name},</p>
    <p class="text">We received a request to reset the password for your MarketPulse account. If you made this request, please click the button below to choose a new password.</p>
    
    <div class="button-container">
      <a href="${resetLink}" class="button" style="background-color: ${COLORS.danger}">Reset Password</a>
    </div>
    
    <p class="text" style="font-size: 14px; text-align: center;">This link is valid for <strong>60 minutes</strong>.</p>
    
    <div class="divider"></div>
    
    <p class="text" style="font-size: 14px; color: #6b7280;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `)
}

export function getPasswordChangedEmailHtml(name: string) {
  return wrapLayout(COLORS.dark, 'Security Alert: Password Changed', `
    <p class="text">Hello ${name},</p>
    <p class="text">This email is to confirm that the password for your MarketPulse account was recently changed.</p>
    
    <div class="info-card" style="background-color: #f0fdf4; border-color: #86efac; border-left: 4px solid #10b981;">
      <h4 style="margin: 0 0 5px; color: #15803d;">Was this you?</h4>
      <p style="margin: 0; font-size: 14px; color: #166534;">If you changed your password, no further action is required.</p>
    </div>
    
    <p class="text">If you did <strong>NOT</strong> make this change, please contact our support team immediately to secure your account.</p>
  `)
}

export function getStaffInvitationEmailHtml(staffName: string, storeName: string, role: string, inviteLink: string, tempPassword: string) {
  return wrapLayout(COLORS.primary, 'You\'ve Been Invited!', `
    <p class="text">Hi ${staffName},</p>
    <p class="text">You have been invited to join the <strong>${storeName}</strong> team on MarketPulse.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Role</span>
        <span class="info-value" style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${role}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Store</span>
        <span class="info-value">${storeName}</span>
      </div>
    </div>
    
    <p class="text">Here are your temporary credentials. You will be asked to set a new password upon logging in.</p>
    
    <div class="code-block" style="font-size: 24px;">
      ${tempPassword}
    </div>
    
    <div class="button-container">
      <a href="${inviteLink}" class="button" style="background-color: ${COLORS.primary}">Accept Invitation</a>
    </div>
  `)
}

export function getStaffAccountCreatedEmailHtml(staffName: string, storeName: string, role: string, email: string) {
  return wrapLayout(COLORS.success, 'Staff Account Active', `
    <p class="text">Hello ${staffName},</p>
    <p class="text">Your staff account for <strong>${storeName}</strong> has been successfully created and verified.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Assigned Role</span>
        <span class="info-value">${role}</span>
      </div>
    </div>
    
    <p class="text">You can now access the internal tools and POS system based on your permissions.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/login" class="button" style="background-color: ${COLORS.success}">Login to Staff Portal</a>
    </div>
  `)
}

export function getSuspiciousLoginEmailHtml(name: string, loginDetails: { ip: string, location: string, device: string, time: string }) {
  return wrapLayout(COLORS.warning, 'Unusual Login Detected', `
    <p class="text">Hello ${name},</p>
    <p class="text">We noticed a login to your account from a new device or location.</p>
    
    <div class="info-card" style="background-color: #fffbeb; border-color: #fcd34d;">
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${loginDetails.time}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Device</span>
        <span class="info-value">${loginDetails.device}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Location</span>
        <span class="info-value">${loginDetails.location}</span>
      </div>
      <div class="info-row">
        <span class="info-label">IP Address</span>
        <span class="info-value">${loginDetails.ip}</span>
      </div>
    </div>
    
    <p class="text"><strong>If this was you</strong>, you can safely ignore this email.</p>
    <p class="text" style="color: #b91c1c;"><strong>If this wasn't you</strong>, your password may be compromised. Please secure your account immediately.</p>
    
    <div class="button-container">
      <a href="#" class="button" style="background-color: ${COLORS.danger}">Secure My Account</a>
    </div>
  `)
}

export function getAccountDeactivatedEmailHtml(name: string, reason?: string) {
  return wrapLayout(COLORS.dark, 'Account Deactivation Notice', `
    <p class="text">Dear ${name},</p>
    <p class="text">We are writing to inform you that your MarketPulse account has been deactivated.</p>
    
    ${reason ? `
    <div class="info-card" style="background-color: #f3f4f6; border-color: #cbd5e1;">
      <h4 style="margin: 0 0 5px; color: #1f2937;">Reason:</h4>
      <p style="margin: 0; color: #4b5563;">${reason}</p>
    </div>
    ` : ''}
    
    <p class="text">If you believe this action was taken in error, or if you wish to appeal this decision, please contact our support team.</p>
  `)
}

export function getRoleChangeEmailHtml(name: string, oldRole: string, newRole: string, storeName: string) {
  return wrapLayout(COLORS.primary, 'Permissions Updated', `
    <p class="text">Hello ${name},</p>
    <p class="text">Your access permissions for <strong>${storeName}</strong> have been modified by an administrator.</p>
    
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <div style="text-align: center;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Previous Role</div>
        <div style="font-weight: 700; color: #ef4444; margin-top: 4px;">${oldRole}</div>
      </div>
      <div style="font-size: 24px; color: #d1d5db;">→</div>
      <div style="text-align: center;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">New Role</div>
        <div style="font-weight: 700; color: #10b981; margin-top: 4px;">${newRole}</div>
      </div>
    </div>
    
    <p class="text">Please log out and log back in for these changes to take full effect.</p>
    <div class="button-container">
      <a href="http://localhost:3000/login" class="button" style="background-color: ${COLORS.primary}">Login Again</a>
    </div>
  `)
}
// ==========================================
// MODULE 3: LOYALTY PROGRAM TEMPLATES
// ==========================================

export function getLoyaltyEnrollmentEmailHtml(name: string, programName: string, initialPoints: number, tierName: string) {
  return wrapLayout(COLORS.success, `Welcome to ${programName}!`, `
    <p class="text">Hi ${name},</p>
    <p class="text">You've been successfully enrolled in <strong>${programName}</strong>. We're excited to have you as a valued member of our community!</p>
    
    <div class="info-card" style="background-color: #ecfdf5; border-color: #10b981;">
      <div class="info-row">
        <span class="info-label">Membership Status</span>
        <span class="info-value" style="color: #059669; font-weight: 700;">ACTIVE</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Tier</span>
        <span class="info-value">${tierName}</span>
      </div>
      ${initialPoints > 0 ? `
      <div class="info-row">
        <span class="info-label">Welcome Bonus</span>
        <span class="info-value">+${initialPoints} Points</span>
      </div>
      ` : ''}
    </div>
    
    <p class="text">Start earning points on every purchase and unlock exclusive rewards, birthday gifts, and early access to sales.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/loyalty" class="button" style="background-color: ${COLORS.success}">View Loyalty Dashboard</a>
    </div>
  `)
}

export function getLoyaltyPointsEarnedEmailHtml(name: string, points: number, orderTotal: number, newBalance: number, tierName: string) {
  return wrapLayout(COLORS.primary, `You Earned ${points} Points!`, `
    <p class="text">Great news, ${name}!</p>
    <p class="text">You just earned <strong>${points} points</strong> from your recent purchase of $${orderTotal.toFixed(2)}.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Points Earned</span>
        <span class="info-value" style="color: ${COLORS.primary}; font-weight: 700;">+${points}</span>
      </div>
      <div class="info-row">
        <span class="info-label">New Balance</span>
        <span class="info-value">${newBalance} Points</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Rank</span>
        <span class="info-value">${tierName}</span>
      </div>
    </div>
    
    <p class="text">You're getting closer to your next reward! Keep it up.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.primary}">Shop More Rewards</a>
    </div>
  `)
}

export function getLoyaltyTierUpgradeEmailHtml(name: string, oldTier: string, newTier: string, newMultiplier: number) {
  return wrapLayout(COLORS.warning, 'New Tier Unlocked! 🏆', `
    <p class="text">Amazing work, ${name}!</p>
    <p class="text">You've officially climbed the ranks and been upgraded from <strong>${oldTier}</strong> to <strong>${newTier}</strong>!</p>
    
    <div class="info-card" style="background-color: #fffbeb; border-color: ${COLORS.warning};">
      <h4 style="margin: 0 0 10px; color: #92400e; text-align: center;">YOUR NEW PERKS:</h4>
      <div class="info-row">
        <span class="info-label">Earning Rate</span>
        <span class="info-value">${newMultiplier}x Points</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tier Status</span>
        <span class="info-value" style="color: #b45309; font-weight: 700;">PREMIUM MEMBER</span>
      </div>
    </div>
    
    <p class="text">As a ${newTier} member, you now earn points even faster. Check out your dashboard for more exclusive benefits unlocked for you.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/loyalty" class="button" style="background-color: ${COLORS.warning}">Claim Your Benefits</a>
    </div>
  `)
}

export function getLoyaltyPointsExpiringEmailHtml(name: string, points: number, expiryDate: string, daysRemaining: number) {
  return wrapLayout(COLORS.danger, 'Action Required: Points Expiring ⚠️', `
    <p class="text">Hi ${name},</p>
    <p class="text">Don't let your hard-earned rewards go to waste! You have <strong>${points} points</strong> set to expire in ${daysRemaining} days.</p>
    
    <div class="info-card" style="background-color: #fef2f2; border-color: ${COLORS.danger}; border-left: 5px solid ${COLORS.danger};">
      <div class="info-row">
        <span class="info-label">Points at Risk</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">${points}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Expiry Date</span>
        <span class="info-value">${expiryDate}</span>
      </div>
    </div>
    
    <p class="text">Redeem them now for discounts on your next purchase or check out our reward shop for exciting offers.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/rewards" class="button" style="background-color: ${COLORS.danger}">Use Points Now</a>
    </div>
  `)
}

export function getLoyaltyReferralRewardEmailHtml(name: string, points: number, referredName: string, referralCode: string, totalReferrals: number) {
  return wrapLayout(COLORS.success, 'Referral Bonus Received! 🎁', `
    <p class="text">Hi ${name},</p>
    <p class="text">Thanks for spreading the word! Your friend <strong>${referredName}</strong> just joined using your referral code <code>${referralCode}</code>.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Referral Reward</span>
        <span class="info-value" style="color: ${COLORS.success}; font-weight: 700;">+${points} Points</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Referrals</span>
        <span class="info-value">${totalReferrals}</span>
      </div>
    </div>
    
    <p class="text">Know anyone else who would love MarketPulse? Keep sharing and keep earning!</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/loyalty/referrals" class="button" style="background-color: ${COLORS.success}">Invite More Friends</a>
    </div>
  `)
}

export function getLoyaltyCouponIssuedEmailHtml(name: string, couponCode: string, discountDesc: string, expiryDate: string) {
  return wrapLayout(COLORS.primary, 'A New Reward Just For You! 🎫', `
    <p class="text">Hi ${name},</p>
    <p class="text">Congratulations! We've added a new personalized reward to your account.</p>
    
    <div class="code-block">
      ${couponCode}
    </div>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Offer</span>
        <span class="info-value" style="font-weight: 800;">${discountDesc}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Valid Until</span>
        <span class="info-value">${expiryDate}</span>
      </div>
    </div>
    
    <p class="text">Apply this code at checkout to claim your discount. Enjoy your shopping!</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.primary}">Go Shopping</a>
    </div>
  `)
}

// ==========================================
// MODULE 4: OWNER & EXECUTIVE ALERTS
// ==========================================

export function getOwnerCriticalAlertEmailHtml(storeName: string, alertType: string, message: string, details: any) {
  return wrapLayout(COLORS.danger, 'CRITICAL SYSTEM ALERT', `
    <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
      <h2 style="margin: 0; font-size: 24px;">🚨 ${alertType}</h2>
    </div>
    
    <p class="text">A critical event has been detected in <strong>${storeName}</strong> that requires your immediate attention.</p>
    
    <div class="info-card" style="border-left: 5px solid #ef4444;">
      <p style="margin: 0 0 10px; font-weight: 800;">ISSUE DESCRIPTION:</p>
      <p style="margin: 0; color: #b91c1c; font-size: 18px;">${message}</p>
    </div>
    
    <div class="info-card">
      <p style="margin: 0 0 10px; font-weight: 800; color: #64748b;">INCIDENT DETAILS:</p>
      ${Object.entries(details).map(([key, value]) => `
        <div class="info-row">
          <span class="info-label" style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}</span>
          <span class="info-value">${value}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/owner-pos" class="button" style="background-color: ${COLORS.danger}">Access Executive Terminal</a>
    </div>
    
    <div class="divider"></div>
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated security alert. If you are already aware of this action, no further steps are required.</p>
  `)
}

export function getDailyDigestEmailHtml(storeName: string, date: string, stats: any) {
  return wrapLayout(COLORS.dark, `Daily Performance Digest: ${date}`, `
    <p class="text">Here is your daily overview for <strong>${storeName}</strong>.</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
        <div style="font-size: 12px; color: #64748b; font-weight: 800; text-transform: uppercase;">Total Revenue</div>
        <div style="font-size: 28px; font-weight: 800; color: #1e293b;">$${stats.revenue.toFixed(2)}</div>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
        <div style="font-size: 12px; color: #64748b; font-weight: 800; text-transform: uppercase;">Transactions</div>
        <div style="font-size: 28px; font-weight: 800; color: #1e293b;">${stats.transactions}</div>
      </div>
    </div>
    
    <div class="info-card">
      <h4 style="margin: 0 0 15px; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">INSIGHTS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        ${stats.insights.map((insight: string) => `<li style="margin-bottom: 8px;">${insight}</li>`).join('')}
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store" class="button" style="background-color: ${COLORS.dark}">View Full Report</a>
    </div>
  `)
}
// ==========================================
// SYSTEM OWNER ONLY EMAILS
// ==========================================

export function getPlatformUsageSpikeAlertHtml(
  metric: string,
  currentValue: string,
  threshold: string,
  percentageIncrease: string,
  timestamp: string,
  affectedStores?: string[]
) {
  return wrapLayout(COLORS.danger, `⚠️ Platform Usage Spike Detected`, `
    <div style="background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">⚠️</div>
        <div>
          <h2 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Critical Usage Alert</h2>
          <p style="margin: 4px 0 0; color: #7f1d1d; font-size: 14px;">Immediate attention required</p>
        </div>
      </div>
    </div>
    
    <p class="text">A significant spike in platform usage has been detected. This may indicate unusual activity or require infrastructure scaling.</p>
    
    <div class="info-card" style="background: #fef2f2; border-color: #fecaca;">
      <h4 style="margin: 0 0 15px; color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">SPIKE DETAILS:</h4>
      <div class="info-row">
        <span class="info-label">Metric:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">${metric}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Value:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">${currentValue}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Threshold:</span>
        <span class="info-value">${threshold}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Increase:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">+${percentageIncrease}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">Detected At:</span>
        <span class="info-value">${timestamp}</span>
      </div>
    </div>
    
    ${affectedStores && affectedStores.length > 0 ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 700;">AFFECTED STORES (${affectedStores.length}):</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${affectedStores.map(store => `
            <span style="background: #fef3c7; color: #78350f; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">${store}</span>
          `).join('')}
        </div>
      </div>
    ` : ''}
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 700;">RECOMMENDED ACTIONS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #166534;">
        <li style="margin-bottom: 8px;">Review system logs for unusual patterns</li>
        <li style="margin-bottom: 8px;">Check database performance metrics</li>
        <li style="margin-bottom: 8px;">Verify API rate limits and quotas</li>
        <li style="margin-bottom: 8px;">Consider scaling infrastructure if sustained</li>
        <li style="margin-bottom: 8px;">Monitor for potential security threats</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/system-monitor" class="button" style="background-color: ${COLORS.danger}">View System Dashboard</a>
    </div>
    
    <div class="divider"></div>
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">
      This is a System Owner-only alert. Automated monitoring detected this anomaly at ${timestamp}.
    </p>
  `)
}


export function getPlatformPerformanceDegradationHtml(
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  affectedServices: string[],
  avgResponseTime: string,
  normalResponseTime: string,
  errorRate: string,
  detectedAt: string,
  estimatedResolution?: string
) {
  const severityColors = {
    LOW: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    MEDIUM: { bg: '#fed7aa', border: '#fb923c', text: '#7c2d12' },
    HIGH: { bg: '#fecaca', border: '#f87171', text: '#991b1b' },
    CRITICAL: { bg: '#fee2e2', border: '#ef4444', text: '#7f1d1d' }
  }

  const colors = severityColors[severity]

  return wrapLayout(COLORS.warning, `? Platform Performance Alert - ${severity} Severity`, `
    <div style="background: linear-gradient(135deg, ${colors.bg} 0%, #fefce8 100%); border-left: 4px solid ${colors.border}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="background: ${colors.border}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">?</div>
        <div>
          <h2 style="margin: 0; color: ${colors.text}; font-size: 18px; font-weight: 700;">Performance Degradation Detected</h2>
          <p style="margin: 4px 0 0; color: ${colors.text}; font-size: 14px;">Severity: <strong>${severity}</strong></p>
        </div>
      </div>
    </div>
    
    <p class="text">We have detected performance degradation across the MarketPulse platform. Our team is actively investigating and working to restore optimal performance.</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">PERFORMANCE METRICS:</h4>
      <div class="info-row">
        <span class="info-label">Severity Level:</span>
        <span class="info-value" style="color: ${colors.border}; font-weight: 700;">${severity}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Avg Response Time:</span>
        <span class="info-value" style="color: ${colors.border}; font-weight: 700;">${avgResponseTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Normal Response Time:</span>
        <span class="info-value">${normalResponseTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Error Rate:</span>
        <span class="info-value" style="color: ${colors.border}; font-weight: 700;">${errorRate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Detected At:</span>
        <span class="info-value">${detectedAt}</span>
      </div>
      ${estimatedResolution ? `
        <div class="info-row">
          <span class="info-label">Est. Resolution:</span>
          <span class="info-value" style="color: #059669; font-weight: 700;">${estimatedResolution}</span>
        </div>
      ` : ''}
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">AFFECTED SERVICES (${affectedServices.length}):</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
        ${affectedServices.map(service => `<li style="margin-bottom: 8px; font-weight: 600;">${service}</li>`).join('')}
      </ul>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 700;">CURRENT STATUS:</h4>
      <p style="margin: 0; color: #1e3a8a; line-height: 1.6;">
        Our engineering team has been notified and is actively working to identify the root cause. 
        We are monitoring all systems closely and will provide updates as the situation progresses.
      </p>
    </div>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 700;">RECOMMENDED ACTIONS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #166534;">
        <li style="margin-bottom: 8px;">Inform store managers about potential delays</li>
        <li style="margin-bottom: 8px;">Monitor critical operations closely</li>
        <li style="margin-bottom: 8px;">Have backup processes ready if needed</li>
        <li style="margin-bottom: 8px;">Check status page for real-time updates</li>
        <li style="margin-bottom: 8px;">Contact support if issues persist</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/status" class="button" style="background-color: ${COLORS.warning}">View Status Page</a>
    </div>
    
    <div class="divider"></div>
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">
      This is a System Owner-only notification. We apologize for any inconvenience and appreciate your patience.
    </p>
  `)
}

export function getStorePerformanceNoticeHtml(
  storeName: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH',
  affectedAreas: string[],
  expectedDuration: string,
  detectedAt: string,
  workarounds?: string[]
) {
  const severityInfo = {
    LOW: {
      color: '#f59e0b',
      bg: '#fef3c7',
      label: 'Minor Impact',
      icon: 'ℹ️'
    },
    MEDIUM: {
      color: '#fb923c',
      bg: '#fed7aa',
      label: 'Moderate Impact',
      icon: '⚠️'
    },
    HIGH: {
      color: '#ef4444',
      bg: '#fecaca',
      label: 'Significant Impact',
      icon: '🚨'
    }
  }

  const info = severityInfo[severity]

  return wrapLayout(info.color, `${info.icon} System Performance Notice`, `
    <div style="background: linear-gradient(135deg, ${info.bg} 0%, #fefce8 100%); border-left: 4px solid ${info.color}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${info.color}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">${info.icon}</div>
        <div>
          <h2 style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">Temporary System Slowdown</h2>
          <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">${info.label} - ${storeName}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Dear Store Manager,</p>
    
    <p class="text">We're experiencing temporary performance issues with the MarketPulse system. Our technical team is actively working to resolve this. Here's what you need to know:</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">WHAT'S AFFECTED:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #78350f;">
        ${affectedAreas.map(area => `<li style="margin-bottom: 8px; font-weight: 600;">${area}</li>`).join('')}
      </ul>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 700;">WHAT TO EXPECT:</h4>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #2563eb; font-size: 20px; line-height: 1;">⏱️</span>
          <div>
            <strong style="color: #1e40af;">Slower Response Times</strong>
            <p style="margin: 4px 0 0; color: #1e3a8a; font-size: 14px;">Screens may take longer to load than usual</p>
          </div>
        </div>
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #2563eb; font-size: 20px; line-height: 1;">🔄</span>
          <div>
            <strong style="color: #1e40af;">Occasional Delays</strong>
            <p style="margin: 4px 0 0; color: #1e3a8a; font-size: 14px;">Transactions and reports may process more slowly</p>
          </div>
        </div>
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #10b981; font-size: 20px; line-height: 1;">✅</span>
          <div>
            <strong style="color: #1e40af;">Expected Resolution</strong>
            <p style="margin: 4px 0 0; color: #1e3a8a; font-size: 14px;">${expectedDuration}</p>
          </div>
        </div>
      </div>
    </div>
    
    ${workarounds && workarounds.length > 0 ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 700;">💡 TEMPORARY WORKAROUNDS:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #166534;">
          ${workarounds.map(tip => `<li style="margin-bottom: 8px;">${tip}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">📢 WHAT TO TELL YOUR TEAM:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
        <li style="margin-bottom: 8px;">The system is running slower than normal - this is temporary</li>
        <li style="margin-bottom: 8px;">Be patient with screen loading times</li>
        <li style="margin-bottom: 8px;">If something doesn't work, wait a moment and try again</li>
        <li style="margin-bottom: 8px;">Inform customers there may be slight delays at checkout</li>
        <li style="margin-bottom: 8px;">Contact you immediately if they see any errors</li>
      </ul>
    </div>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #475569; font-size: 14px; text-align: center;">
        <strong>Need Help?</strong> Contact support at <a href="mailto:support@marketpulse.com" style="color: ${COLORS.primary};">support@marketpulse.com</a> or call our hotline.
      </p>
    </div>
    
    <div class="divider"></div>
    
    <p class="text" style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
      We apologize for any inconvenience. Our team is working hard to restore full performance as quickly as possible.
    </p>
    
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 10px;">
      Detected at ${detectedAt} • This notification was sent to all store managers and supervisors
    </p>
  `)
}

export function getStoreUsageSpikeAlertHtml(
  storeName: string,
  metric: string,
  currentValue: string,
  normalValue: string,
  percentageIncrease: string,
  detectedAt: string,
  possibleCauses: string[],
  immediateActions: string[]
) {
  return wrapLayout(COLORS.danger, `?? Unusual Activity Alert - ${storeName}`, `
    <div style="background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">??</div>
        <div>
          <h2 style="margin: 0; color: #991b1b; font-size: 18px; font-weight: 700;">Unusual Activity Detected</h2>
          <p style="margin: 4px 0 0; color: #7f1d1d; font-size: 14px;">Your store requires immediate attention</p>
        </div>
      </div>
    </div>
    
    <p class="text">Dear Store Manager,</p>
    
    <p class="text">We've detected unusual activity at <strong>${storeName}</strong> that requires your immediate attention. Our automated monitoring system has flagged this for review.</p>
    
    <div class="info-card" style="background: #fef2f2; border-color: #fecaca;">
      <h4 style="margin: 0 0 15px; color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">WHAT WE DETECTED:</h4>
      <div class="info-row">
        <span class="info-label">Activity Type:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">${metric}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Level:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">${currentValue}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Normal Level:</span>
        <span class="info-value">${normalValue}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Increase:</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 700;">+${percentageIncrease}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">Detected At:</span>
        <span class="info-value">${detectedAt}</span>
      </div>
    </div>
    
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">

    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">Immediate Actions Required:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
        ${immediateActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
      </ul>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 700;">What This Means:</h4>
      <p style="margin: 0; color: #1e3a8a; line-height: 1.6;">
        This alert doesn't necessarily indicate a problem, but it's important to verify that all activity is legitimate. 
        Unusual patterns could indicate:
      </p>
      <ul style="margin: 12px 0 0; padding-left: 20px; color: #1e3a8a;">
        <li style="margin-bottom: 6px;">A busy sales period (which is good!)</li>
        <li style="margin-bottom: 6px;">Staff training or testing</li>
        <li style="margin-bottom: 6px;">System errors that need correction</li>
        <li style="margin-bottom: 6px;">Unauthorized access (rare, but important to rule out)</li>
      </ul>
    </div>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 700;">✅ NEXT STEPS:</h4>
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #10b981; font-size: 20px; line-height: 1;">1️⃣</span>
          <div>
            <strong style="color: #166534;">Review Recent Activity</strong>
            <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">Check your dashboard for recent transactions and user actions</p>
          </div>
        </div>
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #10b981; font-size: 20px; line-height: 1;">2️⃣</span>
          <div>
            <strong style="color: #166534;">Verify with Staff</strong>
            <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">Confirm if any team members are conducting tests or training</p>
          </div>
        </div>
        <div style="display: flex; align-items: start; gap: 10px;">
          <span style="color: #10b981; font-size: 20px; line-height: 1;">3️⃣</span>
          <div>
            <strong style="color: #166534;">Contact Support if Needed</strong>
            <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">If you can't explain the activity, reach out to our team immediately</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/analytics" class="button" style="background-color: ${COLORS.danger}">View Store Activity</a>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #475569; font-size: 14px; text-align: center;">
        <strong>Need Immediate Help?</strong> Call our 24/7 support hotline or email <a href="mailto:security@marketpulse.com" style="color: ${COLORS.danger};">security@marketpulse.com</a>
      </p>
    </div>

    <div class="divider"></div>

    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">
      This is an automated security alert sent to store managers and supervisors. Detected at ${detectedAt}
    </p>
  `)
}

export function getDataSyncDelayHtml(
  storeName: string,
  syncType: string,
  lastSuccessfulSync: string,
  delayDuration: string,
  itemsPending: number,
  impact: string[],
  estimatedResolution: string
) {
  return wrapLayout(COLORS.warning, '⚠️ Data Sync Delay Alert', `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%); border-left: 4px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.warning}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔄</div>
        <div>
          <h2 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 700;">Data Sync Delayed</h2>
          <p style="margin: 4px 0 0; color: #b45309; font-size: 14px;">${storeName} - ${syncType}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello,</p>
    
    <p class="text">We've detected a delay in data synchronization for your store. While the system is still operational, some data may not be up-to-date across all devices.</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">SYNC STATUS:</h4>
      <div class="info-row">
        <span class="info-label">Sync Type:</span>
        <span class="info-value" style="font-weight: 600;">${syncType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Last Success:</span>
        <span class="info-value">${lastSuccessfulSync}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Delay:</span>
        <span class="info-value" style="color: ${COLORS.warning}; font-weight: 700;">${delayDuration}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pending Items:</span>
        <span class="info-value">${itemsPending} records</span>
      </div>
      <div class="info-row">
         <span class="info-label">Est. Resolution:</span>
         <span class="info-value" style="font-weight: 600;">${estimatedResolution}</span>
      </div>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 700;">📉 OPERATIONAL IMPACT:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
        ${impact.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">⚡ RECOMMENDED ACTIONS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
        <li style="margin-bottom: 8px;">Avoid major inventory updates until resolved</li>
        <li style="margin-bottom: 8px;">Check internet connectivity on all POS terminals</li>
        <li style="margin-bottom: 8px;">Continue sales operations as normal (offline mode active)</li>
        <li style="margin-bottom: 8px;">Wait for "Sync Complete" notification before running EOD reports</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/settings/sync" class="button" style="background-color: ${COLORS.warning}">Check Sync Status</a>
    </div>
    
    <div class="divider"></div>
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">
      Notification sent to Store Leaders & System Admins.
    </p>
  `)
}

export function getStoreDataSyncDelayHtml(
  storeName: string,
  syncType: string,
  timeSinceLastSync: string,
  affectedServices: string[],
  actionItems: string[]
) {
  return wrapLayout(COLORS.warning, '⏳ Sync Delay Notice', `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%); border-left: 4px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.warning}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔄</div>
        <div>
          <h2 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 700;">Sync Delay Notice</h2>
          <p style="margin: 4px 0 0; color: #b45309; font-size: 14px;">${storeName}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hi Team,</p>
    
    <p class="text">We noticed a slight delay in syncing data for your store. Don't worry—your sales and operations can continue as normal!</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">WHAT YOU SHOULD KNOW:</h4>
      <div class="info-row">
        <span class="info-label">Affected Area:</span>
        <span class="info-value" style="font-weight: 600;">${syncType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Last Updated:</span>
        <span class="info-value">${timeSinceLastSync}</span>
      </div>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 700;">ℹ️ WHAT MIGHT BE SLOW:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
        ${affectedServices.map(service => `<li style="margin-bottom: 8px;">${service}</li>`).join('')}
      </ul>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">✅ STORE TEAM ACTION LIST:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
        ${actionItems.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/system-status" class="button" style="background-color: ${COLORS.warning}">View System Status</a>
    </div>
    
    <div class="divider"></div>
    <p class="text" style="font-size: 12px; color: #9ca3af; text-align: center;">
      Operational notice for Store Managers & Supervisors.
    </p>
  `)
}

export function getDataInconsistencyAlertHtml(
  storeName: string,
  inconsistencyType: string,
  affectedRecords: number,
  detectionTime: string,
  technicalDetails: string
) {
  return wrapLayout(COLORS.danger, '⚠️ Data Inconsistency Alert', `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🛑</div>
        <div>
          <h2 style="margin: 0; color: #7f1d1d; font-size: 18px; font-weight: 700;">Data Inconsistency Detected</h2>
          <p style="margin: 4px 0 0; color: #991b1b; font-size: 14px;">${storeName} - CRITICAL</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    
    <p class="text">The automated integrity checker has flagged inconsistent data patterns that require immediate investigation.</p>
    
    <div class="info-card" style="background: #fff1f2; border-color: #fecaca;">
      <h4 style="margin: 0 0 15px; color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">DETECTION DETAILS:</h4>
      <div class="info-row">
        <span class="info-label">Type:</span>
        <span class="info-value" style="font-weight: 600;">${inconsistencyType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Affected Records:</span>
        <span class="info-value text-red-600 font-bold">${affectedRecords}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Detected At:</span>
        <span class="info-value">${detectionTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tech Details:</span>
        <span class="info-value font-mono text-xs">${technicalDetails}</span>
      </div>
    </div>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #475569; font-size: 14px; font-weight: 700;">🤖 SYSTEM ACTIONS TAKEN:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        <li style="margin-bottom: 8px;">Sync temporarily paused for affected tables</li>
        <li style="margin-bottom: 8px;">Audit log entry created (#INC-${Date.now().toString().slice(-4)})</li>
        <li style="margin-bottom: 8px;">Store manager notified to verify physical records</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/audit" class="button" style="background-color: ${COLORS.danger}">View Audit Logs</a>
    </div>
  `)
}

export function getStoreDataInconsistencyAlertHtml(
  storeName: string,
  issueArea: string,
  actionRequired: string
) {
  return wrapLayout('#f97316', '⚠️ Action Required: Data Check', `
    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-left: 4px solid #f97316; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: #f97316; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔧</div>
        <div>
          <h2 style="margin: 0; color: #7c2d12; font-size: 18px; font-weight: 700;">Data Verification Needed</h2>
          <p style="margin: 4px 0 0; color: #9a3412; font-size: 14px;">${issueArea}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello Team,</p>
    
    <p class="text">We noticed a mismatch in the system numbers for <strong>${issueArea}</strong>. To ensure everything is accurate, please perform a quick check.</p>
    
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #ea580c; font-size: 14px; font-weight: 700;">📋 WHAT TO DO:</h4>
      <p style="color: #c2410c; font-weight: 600; font-size: 16px; margin: 0 0 12px;">${actionRequired}</p>
      <p style="color: #7c2d12; font-size: 14px; margin: 0;">Please report your findings to the system admin or support team.</p>
    </div>
    
    <p class="text" style="font-size: 13px; color: #64748b;">
      Note: You can continue selling, but please verify this as soon as possible to keep inventory correct.
    </p>

    <div class="button-container">
        <a href="http://localhost:3000/store/inventory" class="button" style="background-color: #f97316">Go to Inventory</a>
    </div>
  `)
}

export function getBackupSuccessEmailHtml(
  backupId: string,
  backupSize: string,
  duration: string,
  location: string
) {
  return wrapLayout(COLORS.success, '✅ Backup Successful', `
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid ${COLORS.success}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.success}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">💾</div>
        <div>
          <h2 style="margin: 0; color: #14532d; font-size: 18px; font-weight: 700;">System Backup Completed</h2>
          <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">Platform Data Secured</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    <p class="text">The automated system backup has completed successfully without errors.</p>
    
    <div class="info-card" style="background: #f0fdf4; border-color: #bbf7d0;">
      <h4 style="margin: 0 0 15px; color: #166534; border-bottom: 2px solid #bbf7d0; padding-bottom: 8px;">BACKUP SUMMARY:</h4>
      <div class="info-row"><span class="info-label">Backup ID:</span><span class="info-value font-mono">${backupId}</span></div>
      <div class="info-row"><span class="info-label">Total Size:</span><span class="info-value">${backupSize}</span></div>
      <div class="info-row"><span class="info-label">Duration:</span><span class="info-value">${duration}</span></div>
      <div class="info-row"><span class="info-label">Storage:</span><span class="info-value">${location}</span></div>
    </div>
    
    <p class="text" style="font-size: 13px; color: #64748b;">Next scheduled backup: Tomorrow at 03:00 UTC</p>
  `)
}

export function getBackupFailedEmailHtml(
  backupId: string,
  errorDetails: string,
  retryAttempt: number
) {
  return wrapLayout(COLORS.danger, '❌ Backup Failed', `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🚫</div>
        <div>
          <h2 style="margin: 0; color: #7f1d1d; font-size: 18px; font-weight: 700;">Backup Operation Failed</h2>
          <p style="margin: 4px 0 0; color: #991b1b; font-size: 14px;">Attention Required</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    <p class="text">The automated system backup failed to complete. Data since the last successful backup may be at risk.</p>
    
    <div class="info-card" style="background: #fff1f2; border-color: #fecaca;">
      <h4 style="margin: 0 0 15px; color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">FAILURE DETAILS:</h4>
      <div class="info-row"><span class="info-label">Backup ID:</span><span class="info-value font-mono">${backupId}</span></div>
      <div class="info-row"><span class="info-label">Error:</span><span class="info-value text-red-600 font-bold">${errorDetails}</span></div>
      <div class="info-row"><span class="info-label">Retry #:</span><span class="info-value">${retryAttempt} / 3</span></div>
    </div>

    <div class="button-container">
      <a href="http://localhost:3000/admin/settings/backup" class="button" style="background-color: ${COLORS.danger}">Retry Backup Manually</a>
    </div>
  `)
}

export function getStoreBackupSuccessEmailHtml(
  storeName: string,
  dataTypes: string[]
) {
  return wrapLayout(COLORS.success, '☁️ Cloud Sync Complete', `
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid ${COLORS.success}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.success}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">✅</div>
        <div>
          <h2 style="margin: 0; color: #14532d; font-size: 18px; font-weight: 700;">Store Data Secured</h2>
          <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">${storeName}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Store Manager,</p>
    <p class="text">Your local store data has been successfully synchronized and backed up to the cloud.</p>
    
    <ul style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px 15px 15px 35px; color: #166534;">
      ${dataTypes.map(type => `<li style="margin-bottom: 5px;">${type}</li>`).join('')}
    </ul>
  `)
}

export function getStoreBackupFailedEmailHtml(
  storeName: string,
  lastSuccessfulBackup: string
) {
  return wrapLayout(COLORS.danger, '⚠️ Sync Failure', `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">☁️</div>
        <div>
          <h2 style="margin: 0; color: #7f1d1d; font-size: 18px; font-weight: 700;">Cloud Backup Failed</h2>
          <p style="margin: 4px 0 0; color: #991b1b; font-size: 14px;">${storeName}</p>
        </div>
      </div>
    </div>
    
    <p class="text">Store Manager,</p>
    <p class="text">We couldn't back up your latest sales data to the cloud. Your local data is safe, but it's not yet secured online.</p>
    
    <div class="info-card" style="background: #fff1f2; border-color: #fecaca;">
      <div class="info-row"><span class="info-label">Last Success:</span><span class="info-value font-mono">${lastSuccessfulBackup}</span></div>
      <div class="info-row"><span class="info-label">Action:</span><span class="info-value">Check your internet connection and try again.</span></div>
    </div>

    <div class="button-container">
      <a href="http://localhost:3000/store/settings/sync" class="button" style="background-color: ${COLORS.danger}">Retry Sync</a>
    </div>
  `)
}

export function getDisasterRecoveryTestSummaryHtml(
  testId: string,
  status: 'passed' | 'failed' | 'warning',
  rtoAchieved: string,
  rpoAchieved: string,
  componentsTested: string[]
) {
  const isSuccess = status === 'passed';
  const color = isSuccess ? COLORS.success : (status === 'warning' ? COLORS.warning : COLORS.danger);
  const title = isSuccess ? 'DR Simulation Passed' : 'DR Simulation Issues';
  const icon = isSuccess ? '🛡️' : '🔥';

  return wrapLayout(color, title, `
    <div style="background: linear-gradient(135deg, ${isSuccess ? '#f0fdf4' : '#fef2f2'} 0%, ${isSuccess ? '#dcfce7' : '#fee2e2'} 100%); border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${color}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">${icon}</div>
        <div>
          <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Disaster Recovery Drill ${status === 'passed' ? 'Success' : 'Report'}</h2>
          <p style="margin: 4px 0 0; color: #475569; font-size: 14px;">Test ID: ${testId}</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    <p class="text">The scheduled disaster recovery simulation has completed. Please review the key metrics below.</p>
    
    <div class="info-card" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div style="text-align: center; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: white;">
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">RTO ACHIEVED</div>
        <div style="font-size: 24px; font-weight: 700; color: ${color};">${rtoAchieved}</div>
        <div style="font-size: 11px; color: #94a3b8;">Target: &lt; 4 hours</div>
      </div>
      <div style="text-align: center; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: white;">
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">RPO ACHIEVED</div>
        <div style="font-size: 24px; font-weight: 700; color: ${color};">${rpoAchieved}</div>
        <div style="font-size: 11px; color: #94a3b8;">Target: &lt; 15 mins</div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #475569; font-size: 14px; font-weight: 700;">TESTED COMPONENTS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        ${componentsTested.map(comp => `<li style="margin-bottom: 5px;">${comp}</li>`).join('')}
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/settings/dr-logs" class="button" style="background-color: ${COLORS.dark}">View Full Report</a>
    </div>
  `)
}

export function getSystemConfigChangeEmailHtml(
  changeId: string,
  changedBy: string,
  module: string,
  settingName: string,
  oldValue: string,
  newValue: string
) {
  return wrapLayout(COLORS.warning, '⚙️ Configuration Change Detected', `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.warning}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🔧</div>
        <div>
          <h2 style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">System Setting Modified</h2>
          <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">Module: ${module}</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Admin,</p>
    <p class="text">A core system configuration has been updated. If this was not authorized, please revert immediately.</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <div class="info-row"><span class="info-label">Change ID:</span><span class="info-value font-mono">${changeId}</span></div>
      <div class="info-row"><span class="info-label">Changed By:</span><span class="info-value font-bold">${changedBy}</span></div>
      <div class="info-row"><span class="info-label">Setting:</span><span class="info-value font-mono">${settingName}</span></div>
    </div>

    <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px; font-weight: 700; font-size: 13px; color: #64748b;">
        <div>PREVIOUS VALUE</div>
        <div>NEW VALUE</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 15px;">
        <div style="color: #64748b; font-family: monospace; background: #f1f5f9; padding: 8px; border-radius: 4px; margin-right: 5px; word-break: break-all;">${oldValue}</div>
        <div style="color: #0f172a; font-family: monospace; background: #dcfce7; padding: 8px; border-radius: 4px; border: 1px solid #86efac; word-break: break-all;">${newValue}</div>
      </div>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/audit?id=${changeId}" class="button" style="background-color: ${COLORS.primary}">View in Audit Log</a>
      <div style="margin-top: 10px; font-size: 12px;">
         <a href="http://localhost:3000/admin/settings/revert/${changeId}" style="color: ${COLORS.danger}; text-decoration: underline;">Revert Change</a>
      </div>
    </div>
  `)
}

export function getCriticalSystemSettingAlertHtml(
  settingName: string,
  modifiedBy: string,
  timestamp: string,
  riskLevel: 'HIGH' | 'CRITICAL'
) {
  return wrapLayout(COLORS.danger, '🚨 Critical Setting Modified', `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">⛔</div>
        <div>
          <h2 style="margin: 0; color: #7f1d1d; font-size: 18px; font-weight: 700;">Critical Security Alert</h2>
          <p style="margin: 4px 0 0; color: #991b1b; font-size: 14px;">Risk Level: ${riskLevel}</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    <p class="text">A <strong>critical system configuration</strong> has been modified. This action bypasses standard safety checks and requires immediate verification.</p>
    
    <div class="code-block" style="font-size: 16px; letter-spacing: 0; text-align: left; color: #fca5a5; line-height: 1.5;">
      TARGET: ${settingName}<br/>
      ACTOR: ${modifiedBy}<br/>
      TIME: ${timestamp}
    </div>

    <div style="background: #fff1f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 700;">IMPACT ANALYSIS:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px;">
        <li style="margin-bottom: 5px;">Potential security vulnerability exposed</li>
        <li style="margin-bottom: 5px;">Compliance violation risk detected</li>
        <li style="margin-bottom: 5px;">System stability guarantee voided</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/settings/security/logs" class="button" style="background-color: ${COLORS.danger}">Lock Down System</a>
      <div style="margin-top: 15px;">
        <a href="http://localhost:3000/admin/users/revoke/${modifiedBy}" style="color: #64748b; font-size: 12px; text-decoration: underline;">Revoke User Access</a>
      </div>
    </div>
  `)
}

export function getReportGenerationFailureAlertHtml(
  reportName: string,
  requestedBy: string,
  errorDetails: string,
  timestamp: string
) {
  return wrapLayout(COLORS.danger, '❌ Report Generation Failed', `
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-left: 4px solid ${COLORS.danger}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.danger}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">📉</div>
        <div>
          <h2 style="margin: 0; color: #7f1d1d; font-size: 18px; font-weight: 700;">Report Failed</h2>
          <p style="margin: 4px 0 0; color: #991b1b; font-size: 14px;">Automated process encountered an error</p>
        </div>
      </div>
    </div>
    
    <p class="text">System Owner,</p>
    <p class="text">The automated report generation process for <strong>${reportName}</strong> was unable to complete successfully.</p>
    
    <div class="info-card" style="background: #fff1f2; border-color: #fecaca;">
      <h4 style="margin: 0 0 15px; color: #991b1b; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">FAILURE DETAILS:</h4>
      <div class="info-row"><span class="info-label">Report:</span><span class="info-value font-bold">${reportName}</span></div>
      <div class="info-row"><span class="info-label">Requested By:</span><span class="info-value">${requestedBy}</span></div>
      <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${timestamp}</span></div>
      <div class="info-row"><span class="info-label">Error:</span><span class="info-value text-red-600 font-mono text-xs">${errorDetails}</span></div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #475569; font-size: 14px; font-weight: 700;">TROUBLESHOOTING:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px;">
        <li style="margin-bottom: 5px;">Check database connectivity status</li>
        <li style="margin-bottom: 5px;">Verify sufficient disk space for temporary files</li>
        <li style="margin-bottom: 5px;">Review system logs for timeouts</li>
      </ul>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/analytics" class="button" style="background-color: ${COLORS.danger}">Retry Data Export</a>
    </div>
  `)
}

export function getDelayedScheduledReportNoticeHtml(
  reportName: string,
  scheduledTime: string,
  expectedDelay: string,
  reason: string
) {
  return wrapLayout(COLORS.warning, '⏳ Report Generation Delayed', `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.warning}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">⏱️</div>
        <div>
          <h2 style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">Report Delivery Delayed</h2>
          <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">High system load detected</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello,</p>
    <p class="text">Your scheduled report <strong>${reportName}</strong> is currently in the queue but is taking longer than usual to process.</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">STATUS UPDATE:</h4>
      <div class="info-row"><span class="info-label">Scheduled:</span><span class="info-value">${scheduledTime}</span></div>
      <div class="info-row"><span class="info-label">Exp. Delay:</span><span class="info-value font-bold">${expectedDelay}</span></div>
      <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${reason}</span></div>
    </div>

    <p class="text" style="font-size: 14px; color: #64748b;">
      You don't need to take any action. We will email you the report as soon as it is ready.
    </p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/analytics/reports" class="button" style="background-color: ${COLORS.warning}; color: #78350f;">View Queue Status</a>
    </div>
  `)
}

export function getReportDataCompletenessWarningHtml(
  reportName: string,
  generatedDate: string,
  missingDataPoints: string[],
  completenessPercentage: number
) {
  return wrapLayout(COLORS.warning, '⚠️ Report Data Incomplete', `
    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.warning}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">📉</div>
        <div>
          <h2 style="margin: 0; color: #78350f; font-size: 18px; font-weight: 700;">Data Completeness Warning</h2>
          <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">Some data sources were unavailable</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello,</p>
    <p class="text">The <strong>${reportName}</strong> generated on ${generatedDate} contains partial data. Please interpret the results with caution.</p>
    
    <div class="info-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="margin: 0 0 15px; color: #92400e; border-bottom: 2px solid #fde68a; padding-bottom: 8px;">COMPLETENESS SUMMARY:</h4>
      <div class="info-row"><span class="info-label">Overall Score:</span><span class="info-value font-bold">${completenessPercentage}%</span></div>
      <div class="info-row"><span class="info-label">Missing Sources:</span>
        <ul style="margin: 5px 0 0 0; padding-left: 15px; list-style-type: none;">
          ${missingDataPoints.map(point => `<li style="margin-bottom: 3px; color: #b45309;">• ${point}</li>`).join('')}
        </ul>
      </div>
    </div>

    <p class="text" style="font-size: 14px; color: #64748b;">
      The missing data may be due to temporary connectivity issues or maintenance windows. The system will attempt to backfill this data automatically.
    </p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/analytics/reports" class="button" style="background-color: ${COLORS.warning}; color: #78350f;">Review Report</a>
      <div style="margin-top: 10px; font-size: 12px;">
         <a href="http://localhost:3000/admin/settings/sync" style="color: #64748b; text-decoration: underline;">Check Data Sync Status</a>
      </div>
    </div>
  `)
}

export function getReportDefinitionChangedNotificationHtml(
  reportName: string,
  modifiedBy: string,
  changeDescription: string,
  timestamp: string
) {
  return wrapLayout(COLORS.info, '📝 Report Definition Updated', `
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid ${COLORS.info}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.info}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">📋</div>
        <div>
          <h2 style="margin: 0; color: #1e3a8a; font-size: 18px; font-weight: 700;">Report Structure Modified</h2>
          <p style="margin: 4px 0 0; color: #1e40af; font-size: 14px;">Configuration update detected</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello,</p>
    <p class="text">The definition for the report <strong>${reportName}</strong> has been updated by <strong>${modifiedBy}</strong>.</p>
    
    <div class="info-card" style="background: #eff6ff; border-color: #bfdbfe;">
      <h4 style="margin: 0 0 15px; color: #1e40af; border-bottom: 2px solid #bfdbfe; padding-bottom: 8px;">CHANGE DETAILS:</h4>
      <div class="info-row"><span class="info-label">Report:</span><span class="info-value font-bold">${reportName}</span></div>
      <div class="info-row"><span class="info-label">Modified By:</span><span class="info-value">${modifiedBy}</span></div>
      <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${timestamp}</span></div>
      <div class="info-row"><span class="info-label">Description:</span><span class="info-value" style="font-style: italic;">${changeDescription}</span></div>
    </div>

    <p class="text" style="font-size: 14px; color: #64748b;">
      Future generations of this report will reflect these changes. Historical instances remain unchanged.
    </p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/analytics/reports/definitions" class="button" style="background-color: ${COLORS.info};">View Definition</a>
    </div>
  `)
}

export function getReportDeprecatedNotificationHtml(
  reportName: string,
  deprecationDate: string,
  archivalDate: string,
  replacementReport?: string
) {
  return wrapLayout(COLORS.text, '📂 Report Deprecation Notice', `
    <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-left: 4px solid ${COLORS.text}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: ${COLORS.text}; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">🗄️</div>
        <div>
          <h2 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">Report Being Retired</h2>
          <p style="margin: 4px 0 0; color: #334155; font-size: 14px;">Scheduled for archival</p>
        </div>
      </div>
    </div>
    
    <p class="text">Hello,</p>
    <p class="text">The report <strong>${reportName}</strong> is scheduled to be deprecated and subsequently archived. Please export any necessary historical data before the archival date.</p>
    
    <div class="info-card" style="background: #f8fafc; border-color: #cbd5e1;">
      <h4 style="margin: 0 0 15px; color: #334155; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">TIMELINE:</h4>
      <div class="info-row"><span class="info-label">Deprecation:</span><span class="info-value">${deprecationDate}</span></div>
      <div class="info-row"><span class="info-label">Archival:</span><span class="info-value font-bold">${archivalDate}</span></div>
      ${replacementReport ? `<div class="info-row"><span class="info-label">Replacement:</span><span class="info-value" style="color: ${COLORS.primary}; text-decoration: underline;">${replacementReport}</span></div>` : ''}
    </div>

    <p class="text" style="font-size: 14px; color: #64748b;">
      After the archival date, this report will no longer be accessible for generation or viewing.
    </p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/analytics/reports/archive" class="button" style="background-color: ${COLORS.text};">View Archive Settings</a>
    </div>
  `)
}

// ==========================================
// MODULE 5: INVENTORY & OPERATIONS
// ==========================================

export function getLowStockAlertEmailHtml(productName: string, sku: string, currentStock: number, threshold: number) {
  return wrapLayout(COLORS.warning, '⚠️ Low Stock Warning', `
    <p class="text">The following product has fallen below its minimum stock threshold.</p>
    <div class="info-card" style="background-color: #fffbeb; border-color: #fde68a;">
      <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${productName}</span></div>
      <div class="info-row"><span class="info-label">SKU:</span><span class="info-value font-mono">${sku}</span></div>
      <div class="info-row"><span class="info-label">Current Stock:</span><span class="info-value font-bold text-amber-600">${currentStock}</span></div>
      <div class="info-row"><span class="info-label">Threshold:</span><span class="info-value">${threshold}</span></div>
    </div>
    <div class="button-container">
      <a href="http://localhost:3000/store/inventory" class="button" style="background-color: ${COLORS.warning}">Order Restock</a>
    </div>
  `)
}

export function getOutOfStockAlertEmailHtml(productName: string, sku: string) {
  return wrapLayout(COLORS.danger, '🚨 Critical: Out of Stock', `
    <p class="text">Immediate Action Required: The following product is now completely out of stock.</p>
    <div class="info-card" style="background-color: #fef2f2; border-color: #fecaca; border-left: 5px solid ${COLORS.danger};">
      <div class="info-row"><span class="info-label">Product:</span><span class="info-value font-bold">${productName}</span></div>
      <div class="info-row"><span class="info-label">SKU:</span><span class="info-value font-mono">${sku}</span></div>
      <div class="info-row"><span class="info-label">Status:</span><span class="info-value text-red-600 font-black">SOLDOUT</span></div>
    </div>
    <div class="button-container">
       <a href="http://localhost:3000/store/inventory" class="button" style="background-color: ${COLORS.danger}">Manage Inventory</a>
    </div>
  `)
}

export function getStockRestockSuccessEmailHtml(batchId: string, itemsCount: number, receivedBy: string) {
  return wrapLayout(COLORS.success, '📦 Restock Successful', `
    <p class="text">New inventory has been successfully logged and added to the system.</p>
    <div class="info-card" style="background-color: #f0fdf4; border-color: #bbf7d0;">
      <div class="info-row"><span class="info-label">Batch ID:</span><span class="info-value font-mono">${batchId}</span></div>
      <div class="info-row"><span class="info-label">Items Received:</span><span class="info-value">${itemsCount}</span></div>
      <div class="info-row"><span class="info-label">Logged By:</span><span class="info-value">${receivedBy}</span></div>
    </div>
  `)
}

export function getInventoryAuditRequestEmailHtml(areaName: string, deadline: string) {
  return wrapLayout(COLORS.primary, '📋 Inventory Audit Requested', `
    <p class="text">An inventory audit has been scheduled for the <strong>${areaName}</strong> section.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Section:</span><span class="info-value">${areaName}</span></div>
      <div class="info-row"><span class="info-label">Deadline:</span><span class="info-value font-bold">${deadline}</span></div>
    </div>
    <p class="text">Please ensure all counts are completed and verified by the deadline.</p>
    <div class="button-container">
      <a href="http://localhost:3000/store/inventory/audit" class="button" style="background-color: ${COLORS.primary}">Start Audit</a>
    </div>
  `)
}

export function getPriceChangeNoticeEmailHtml(productName: string, oldPrice: number, newPrice: number) {
  return wrapLayout(COLORS.info, '🏷️ Price Update Notification', `
    <p class="text">Please be advised that the following product pricing has been updated in the system.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${productName}</span></div>
      <div class="info-row"><span class="info-label">Old Price:</span><span class="info-value text-slate-400">$${oldPrice.toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">New Price:</span><span class="info-value font-black text-green-600">$${newPrice.toFixed(2)}</span></div>
    </div>
  `)
}

// ==========================================
// MODULE 6: ORDER & CUSTOMER EXCELLENCE
// ==========================================

export function getCustomerOrderConfirmationEmailHtml(orderId: string, total: number, items: any[]) {
  return wrapLayout(COLORS.success, 'Receipt for Your Purchase', `
    <p class="text">Thank you for shopping with us! Your order <strong>#${orderId}</strong> has been processed successfully.</p>
    <div class="info-card">
      <p style="font-weight: 800; margin-bottom: 10px; font-size: 14px; color: #64748b;">ORDER SUMMARY:</p>
      ${items.map(item => `
        <div class="info-row">
          <span class="info-label">${item.quantity}x ${item.name}</span>
          <span class="info-value">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="info-row" style="margin-top: 10px; border-top: 2px solid #e2e8f0; padding-top: 10px;">
        <span class="info-label" style="font-size: 18px; color: #0f172a;">TOTAL PAID</span>
        <span class="info-value" style="font-size: 18px; font-weight: 800; color: ${COLORS.success}">$${total.toFixed(2)}</span>
      </div>
    </div>
    <p class="text" style="text-align: center; font-size: 14px;">We hope to see you again soon!</p>
  `)
}

export function getRefundConfirmationEmailHtml(orderId: string, amount: number) {
  return wrapLayout(COLORS.info, 'Refund Processed', `
    <p class="text">This email confirms that a refund has been issued for order <strong>#${orderId}</strong>.</p>
    <div class="info-card" style="background-color: #f0fdf4; border-color: #bbf7d0;">
      <div class="info-row"><span class="info-label">Order Ref:</span><span class="info-value font-mono">${orderId}</span></div>
      <div class="info-row"><span class="info-label">Refund Amount:</span><span class="info-value font-black text-green-600">$${amount.toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">Status:</span><span class="info-value">COMPLETED</span></div>
    </div>
  `)
}

export function getCustomerLoyaltyStatementEmailHtml(name: string, points: number, tier: string) {
  return wrapLayout(COLORS.primary, 'Your Loyalty Points Summary', `
    <p class="text">Hi ${name}, here is an update on your rewards balance.</p>
    <div class="info-card" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);">
      <div class="info-row"><span class="info-label">Current Balance:</span><span class="info-value font-black text-blue-600" style="font-size: 24px;">${points} Points</span></div>
      <div class="info-row"><span class="info-label">Member Tier:</span><span class="info-value font-bold">${tier}</span></div>
    </div>
    <div class="button-container">
      <a href="http://localhost:3000/loyalty" class="button" style="background-color: ${COLORS.primary}">Redeem Points</a>
    </div>
  `)
}

export function getNewReviewNotificationEmailHtml(customerName: string, rating: number, comment: string) {
  return wrapLayout(COLORS.dark, '⭐ New Customer Feedback', `
    <p class="text">A new customer review has been submitted.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Customer:</span><span class="info-value font-bold">${customerName}</span></div>
      <div class="info-row"><span class="info-label">Rating:</span><span class="info-value" style="color: #f59e0b; font-size: 18px;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span></div>
      <p style="margin-top: 15px; font-style: italic; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 10px;">"${comment}"</p>
    </div>
  `)
}

// ==========================================
// MODULE 7: EXECUTIVE & STAFF MANAGEMENT
// ==========================================

export function getShiftStartEmailHtml(staffName: string, terminalId: string, startTime: string) {
  return wrapLayout(COLORS.info, '🔓 Shift Started', `
    <p class="text">A new operational shift has been initiated.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Staff Member:</span><span class="info-value">${staffName}</span></div>
      <div class="info-row"><span class="info-label">Terminal ID:</span><span class="info-value font-mono">${terminalId}</span></div>
      <div class="info-row"><span class="info-label">Start Time:</span><span class="info-value">${startTime}</span></div>
    </div>
  `)
}

export function getShiftEndSummaryEmailHtml(staffName: string, terminalId: string, totalSales: number, txCount: number) {
  return wrapLayout(COLORS.dark, '📊 Shift Summary Report', `
    <p class="text">A shift has been closed. Here is the final summary for <strong>${staffName}</strong>.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Terminal:</span><span class="info-value font-mono">${terminalId}</span></div>
      <div class="info-row"><span class="info-label">Total Volume:</span><span class="info-value font-black text-slate-900">$${totalSales.toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">Transactions:</span><span class="info-value">${txCount}</span></div>
    </div>
    <div class="button-container">
      <a href="http://localhost:3000/store/owner-pos" class="button" style="background-color: ${COLORS.dark}">View Reconciliation</a>
    </div>
  `)
}

export function getStaffPerformanceMilestoneEmailHtml(staffName: string, milestone: string) {
  return wrapLayout(COLORS.success, '🎉 Achievement Unlocked!', `
    <p class="text">Dear ${staffName},</p>
    <p class="text">Congratulations on reaching a major performance milestone: <strong>${milestone}</strong>!</p>
    <div class="info-card" style="text-align: center; py-8; background-color: #f0fdf4;">
      <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
      <p style="font-weight: 800; font-size: 18px; color: #15803d; margin: 0;">TOP PERFORMER</p>
    </div>
    <p class="text">Thank you for your hard work and dedication to the team.</p>
  `)
}

export function getAccessRevokedNoticeEmailHtml(staffName: string, reason: string) {
  return wrapLayout(COLORS.danger, '⛔ Access Revoked', `
    <p class="text">Security Notice: Access for <strong>${staffName}</strong> has been officially revoked.</p>
    <div class="info-card" style="background-color: #fef2f2; border-color: #fecaca;">
      <div class="info-row"><span class="info-label">Action:</span><span class="info-value font-bold text-red-600">UNAUTHORIZED</span></div>
      <div class="info-row"><span class="info-label">Reason:</span><span class="info-value">${reason}</span></div>
    </div>
  `)
}

// ==========================================
// MODULE 8: SECURITY & SYSTEM HEALTH
// ==========================================

export function getUnauthorizedAccessAttemptHtml(user: string, action: string, ip: string) {
  return wrapLayout(COLORS.danger, '🚨 SECURITY ALERT: Unauthorized Override', `
    <p class="text">A user attempted to perform a privileged action without sufficient permissions.</p>
    <div class="info-card" style="background-color: #fee2e2; border-color: #ef4444; border-left: 5px solid ${COLORS.danger};">
      <div class="info-row"><span class="info-label">User:</span><span class="info-value font-bold">${user}</span></div>
      <div class="info-row"><span class="info-label">Action Attempted:</span><span class="info-value font-mono">${action}</span></div>
      <div class="info-row"><span class="info-label">IP Address:</span><span class="info-value">${ip}</span></div>
    </div>
    <div class="button-container">
       <a href="http://localhost:3000/admin/security/logs" class="button" style="background-color: ${COLORS.danger}">Investigate Incident</a>
    </div>
  `)
}

export function getSystemDowntimeNoticeHtml(startTime: string, expectedDuration: string) {
  return wrapLayout(COLORS.warning, '⚡ Scheduled Maintenance Notice', `
    <p class="text">The MarketPulse platform will undergo scheduled maintenance to improve system performance.</p>
    <div class="info-card">
      <div class="info-row"><span class="info-label">Maintenance Start:</span><span class="info-value font-bold">${startTime}</span></div>
      <div class="info-row"><span class="info-label">Expected Duration:</span><span class="info-value">${expectedDuration}</span></div>
    </div>
    <p class="text" style="font-size: 14px; color: #64748b;">During this window, some services may be temporarily unavailable. Thank you for your patience.</p>
  `)
}

export function getHighValueReturnAlertHtml(orderId: string, amount: number, processedBy: string) {
  return wrapLayout(COLORS.danger, '🚨 Executive Alert: High-Value Return', `
    <p class="text">A significant return has just been processed and requires owner verification.</p>
    <div class="info-card" style="border-left: 5px solid ${COLORS.danger};">
      <div class="info-row"><span class="info-label">Order Ref:</span><span class="info-value font-mono">${orderId}</span></div>
      <div class="info-row"><span class="info-label">Return Amount:</span><span class="info-value font-black text-red-600" style="font-size: 20px;">$${amount.toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">Processed By:</span><span class="info-value">${processedBy}</span></div>
    </div>
  `)
}

export function getPlatformStatusEmailHtml(status: 'ENABLED' | 'DISABLED', changedBy: string) {
  const isEnabled = status === 'ENABLED'
  return wrapLayout(isEnabled ? COLORS.success : COLORS.danger, `Platform ${status}`, `
        <p class="text">Hello Administrator,</p>
        <p class="text">This is a critical security notification regarding the <strong>MarketPulse Platform</strong> status.</p>
        
        <div class="info-card" style="border-left: 4px solid ${isEnabled ? COLORS.success : COLORS.danger};">
            <div class="info-row"><span class="info-label">New Status:</span><span class="info-value" style="color: ${isEnabled ? COLORS.success : COLORS.danger}; font-weight: bold;">${status}</span></div>
            <div class="info-row"><span class="info-label">Changed by:</span><span class="info-value">${changedBy}</span></div>
            <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${new Date().toLocaleString()}</span></div>
        </div>
        
        <p class="text">If this was not authorized, please immediately rotate your system owner credentials and check the audit logs.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/audit" class="button" style="background-color: ${COLORS.dark}">Review Audit Logs</a>
        </div>
    `)
}

export function getMaintenanceModeEmailHtml(isActive: boolean, changedBy: string) {
  return wrapLayout(isActive ? COLORS.warning : COLORS.success, `Maintenance Mode: ${isActive ? 'ON' : 'OFF'}`, `
        <p class="text">Hello Team,</p>
        <p class="text">The platform's <strong>Maintenance Mode</strong> has been ${isActive ? 'activated' : 'deactivated'}.</p>
        
        <div class="info-card" style="border-left: 4px solid ${isActive ? COLORS.warning : COLORS.success};">
            <div class="info-row"><span class="info-label">Status:</span><span class="info-value" style="font-weight: bold;">${isActive ? 'MAINTENANCE ACTIVE' : 'SYSTEM OPERATIONAL'}</span></div>
            <div class="info-row"><span class="info-label">Action by:</span><span class="info-value">${changedBy}</span></div>
            <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${new Date().toLocaleString()}</span></div>
        </div>
        
        <p class="text">${isActive
      ? 'Public access is now restricted. Only authorized administrators can access the system.'
      : 'The system is now back online for all users and stores.'}</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/status" class="button" style="background-color: ${isActive ? COLORS.warning : COLORS.success}">View System Status</a>
        </div>
    `)
}

export function getStoreGovernanceEmailHtml(action: 'ACTIVATED' | 'SUSPENDED' | 'ARCHIVED', storeName: string, reason: string, changedBy: string) {
  const isDanger = action === 'SUSPENDED' || action === 'ARCHIVED'
  return wrapLayout(isDanger ? COLORS.danger : COLORS.success, `Store Governance: ${action}`, `
        <p class="text">Administrative action has been taken on a store profile within the platform.</p>
        
        <div class="info-card" style="border-left: 4px solid ${isDanger ? COLORS.danger : COLORS.success};">
            <div class="info-row"><span class="info-label">Action:</span><span class="info-value" style="font-weight: bold; color: ${isDanger ? COLORS.danger : COLORS.success}; text-transform: uppercase;">${action}</span></div>
            <div class="info-row"><span class="info-label">Store Name:</span><span class="info-value">${storeName}</span></div>
            <div class="info-row"><span class="info-label">Reason:</span><span class="info-value italic">${reason}</span></div>
            <div class="info-row"><span class="info-label">Changed by:</span><span class="info-value">${changedBy}</span></div>
        </div>
        
        <p class="text">This action affects the store's ability to process transactions and access dashboard features immediately.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/stores" class="button" style="background-color: ${isDanger ? COLORS.danger : COLORS.success}">Manage Store Profile</a>
        </div>
    `)
}

export function getStoreLimitAlertEmailHtml(storeName: string, limitType: string, currentVal: number, maxVal: number) {
  return wrapLayout(COLORS.warning, '⚠️ Store Resource Limit Warning', `
        <p class="text">A store has reached or is approaching its allocated resource limit.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.warning};">
            <div class="info-row"><span class="info-label">Store:</span><span class="info-value">${storeName}</span></div>
            <div class="info-row"><span class="info-label">Limit Type:</span><span class="info-value">${limitType}</span></div>
            <div class="info-row"><span class="info-label">Current Usage:</span><span class="info-value font-bold">${currentVal}</span></div>
            <div class="info-row"><span class="info-label">Maximum Allowed:</span><span class="info-value">${maxVal}</span></div>
        </div>
        
        <p class="text">Resources are governed by the <strong>Tenant Governance</strong> global settings. Exceeding these limits will block further creation of resources in this category.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/settings" class="button" style="background-color: ${COLORS.warning}">Review Global Limits</a>
        </div>
    `)
}

export function getRoleEscalationEmailHtml(userEmail: string, oldRole: string, newRole: string, approvedBy: string) {
  return wrapLayout(COLORS.warning, '🛡️ Security Alert: Role Escalation', `
        <p class="text">A user's account permissions have been escalated to a higher privilege tier.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.warning};">
            <div class="info-row"><span class="info-label">User Email:</span><span class="info-value font-bold">${userEmail}</span></div>
            <div class="info-row"><span class="info-label">Previous Role:</span><span class="info-value">${oldRole}</span></div>
            <div class="info-row"><span class="info-label">New Role:</span><span class="info-value text-amber-600 font-bold">${newRole}</span></div>
            <div class="info-row"><span class="info-label">Approved By:</span><span class="info-value">${approvedBy}</span></div>
        </div>
        
        <p class="text">Role escalations are governed by the <strong>User & Role Settings</strong> and require immediate verification if not explicitly authorized.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/users" class="button" style="background-color: ${COLORS.warning}">Review User Permissions</a>
        </div>
    `)
}

export function getPrivilegedAccessEmailHtml(adminEmail: string, action: string, reason: string) {
  return wrapLayout(COLORS.danger, '🚨 CRITICAL: Privileged Access Used', `
        <p class="text">A high-privilege administrative action has been performed on the platform.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.danger};">
            <div class="info-row"><span class="info-label">Administrator:</span><span class="info-value font-bold">${adminEmail}</span></div>
            <div class="info-row"><span class="info-label">Action:</span><span class="info-value font-mono">${action}</span></div>
            <div class="info-row"><span class="info-label">Provided Reason:</span><span class="info-value italic">"${reason}"</span></div>
            <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${new Date().toLocaleString()}</span></div>
        </div>
        
        <p class="text">This action was authorized under the <strong>Privileged Access Rules</strong>. All sessions using these credentials are being monitored.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/audit" class="button" style="background-color: ${COLORS.danger}">View Live Audit Log</a>
        </div>
    `)
}

export function getMfaSetupEmailHtml(userEmail: string, method: string) {
  return wrapLayout(COLORS.success, '🔐 MFA Successfully Configured', `
        <p class="text">Multi-factor authentication has been successfully enabled for your account.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.success};">
            <div class="info-row"><span class="info-label">Account:</span><span class="info-value font-bold">${userEmail}</span></div>
            <div class="info-row"><span class="info-label">MFA Method:</span><span class="info-value">${method}</span></div>
            <div class="info-row"><span class="info-label">Status:</span><span class="info-value text-green-600 font-bold">ACTIVE</span></div>
        </div>
        
        <p class="text">Your account is now protected by an additional layer of security. This configuration is mandated by the <strong>Authentication & Security</strong> global policies.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/profile/security" class="button" style="background-color: ${COLORS.success}">Manage Security Settings</a>
        </div>
    `)
}

export function getSecurityAlertEmailHtml(userEmail: string, event: string, location: string, ip: string) {
  return wrapLayout(COLORS.danger, '🚨 SECURITY ALERT: Suspicious Activity', `
        <p class="text">A suspicious security event was detected on your account.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.danger};">
            <div class="info-row"><span class="info-label">Event Type:</span><span class="info-value font-bold text-red-600">${event}</span></div>
            <div class="info-row"><span class="info-label">Account:</span><span class="info-value">${userEmail}</span></div>
            <div class="info-row"><span class="info-label">Location:</span><span class="info-value">${location}</span></div>
            <div class="info-row"><span class="info-label">IP Address:</span><span class="info-value font-mono">${ip}</span></div>
        </div>
        
        <p class="text">If this was not you, please immediately lock your account and contact the platform System Owner.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/auth/lock-account" class="button" style="background-color: ${COLORS.danger}">Secure My Account</a>
        </div>
    `)
}

export function getNewDeviceLoginEmailHtml(userEmail: string, device: string, time: string) {
  return wrapLayout(COLORS.primary, '📱 New Device Login', `
        <p class="text">Your account was just logged into from a new device.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.primary};">
            <div class="info-row"><span class="info-label">Account:</span><span class="info-value font-bold">${userEmail}</span></div>
            <div class="info-row"><span class="info-label">Device Info:</span><span class="info-value">${device}</span></div>
            <div class="info-row"><span class="info-label">Time:</span><span class="info-value">${time}</span></div>
        </div>
        
        <p class="text">This notification is sent as part of the <strong>New Device Verification</strong> policy. No action is needed if this was you.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/profile/sessions" class="button" style="background-color: ${COLORS.primary}">View Active Sessions</a>
        </div>
    `)
}

export function getPriceOverrideAlertEmailHtml(staffName: string, product: string, originalPrice: number, newPrice: number, reason: string) {
  const diff = originalPrice - newPrice
  const diffPercent = ((diff / originalPrice) * 100).toFixed(1)

  return wrapLayout(COLORS.warning, '⚠️ Price Override Alert', `
        <p class="text">A manual price override has been performed during a POS transaction.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.warning};">
            <div class="info-row"><span class="info-label">Staff Member:</span><span class="info-value font-bold">${staffName}</span></div>
            <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${product}</span></div>
            <div class="info-row"><span class="info-label">Original Price:</span><span class="info-value text-slate-500 line-through">$${originalPrice.toFixed(2)}</span></div>
            <div class="info-row"><span class="info-label">New Price:</span><span class="info-value text-red-600 font-bold">$${newPrice.toFixed(2)}</span></div>
            <div class="info-row"><span class="info-label">Reduction:</span><span class="info-value">-$${diff.toFixed(2)} (${diffPercent}%)</span></div>
            <div class="info-row"><span class="info-label">Reason:</span><span class="info-value italic">"${reason}"</span></div>
        </div>
        
        <p class="text">Overrides above the system threshold are logged under the <strong>POS & Billing Global Rules</strong> for audit purposes.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/audit" class="button" style="background-color: ${COLORS.warning}">Review Audit Logs</a>
        </div>
    `)
}

export function getRefundLimitAlertEmailHtml(storeName: string, amount: number, threshold: number, requestedBy: string) {
  return wrapLayout(COLORS.danger, '🚨 High-Value Refund Warning', `
        <p class="text">A refund request has exceeded the global limit or is approaching the daily threshold.</p>
        
        <div class="info-card" style="border-left: 4px solid ${COLORS.danger};">
            <div class="info-row"><span class="info-label">Store:</span><span class="info-value">${storeName}</span></div>
            <div class="info-row"><span class="info-label">Refund Amount:</span><span class="info-value font-bold text-red-600">$${amount.toFixed(2)}</span></div>
            <div class="info-row"><span class="info-label">Value Threshold:</span><span class="info-value">$${threshold.toFixed(2)}</span></div>
            <div class="info-row"><span class="info-label">Requested By:</span><span class="info-value">${requestedBy}</span></div>
        </div>
        
        <p class="text">This event was flagged according to <strong>Financial Governance</strong> limits. High-value refunds may require additional secondary verification from the System Owner.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/settings" class="button" style="background-color: ${COLORS.danger}">Manage Refund Rules</a>
        </div>
    `)
}

export function getStockDiscrepancyEmailHtml(storeName: string, product: string, systemStock: number, physicalStock: number, staffName: string) {
  const diff = physicalStock - systemStock
  const status = diff < 0 ? 'Shortage' : 'Overage'
  const color = diff < 0 ? COLORS.danger : COLORS.primary

  return wrapLayout(color, `📊 Stock Audit Discrepancy: ${status}`, `
        <p class="text">A discrepancy has been detected during a physical stock audit.</p>
        
        <div class="info-card" style="border-left: 4px solid ${color};">
            <div class="info-row"><span class="info-label">Store:</span><span class="info-value font-bold">${storeName}</span></div>
            <div class="info-row"><span class="info-label">Product:</span><span class="info-value">${product}</span></div>
            <div class="info-row"><span class="info-label">System Stock:</span><span class="info-value">${systemStock}</span></div>
            <div class="info-row"><span class="info-label">Physical Stock:</span><span class="info-value font-bold">${physicalStock}</span></div>
            <div class="info-row"><span class="info-label">Variance:</span><span class="info-value" style="color: ${color}">${diff > 0 ? '+' : ''}${diff} units</span></div>
            <div class="info-row"><span class="info-label">Audited By:</span><span class="info-value">${staffName}</span></div>
        </div>
        
        <p class="text">Discrepancy reports are mandatory under the <strong>Inventory & Stock Governance</strong> policies. Inventory records have been adjusted and logged.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/inventory/audits" class="button" style="background-color: ${color}">Review Audit Details</a>
        </div>
    `)
}

export function getExpiryWarningEmailHtml(storeName: string, items: Array<{ name: string, expiry: string, batch: string }>) {
  return wrapLayout(COLORS.warning, '🍎 Urgent: Stock Expiry Warning', `
        <p class="text">The following items are approaching their expiration date according to the <strong>Expiry Tracking Enforcement</strong> policy.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background-color: #f8fafc; text-align: left;">
                    <th style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase;">Product</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase;">Batch</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-transform: uppercase;">Expiry Date</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${item.name}</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b; font-family: monospace;">${item.batch}</td>
                        <td style="padding: 12px; border: 1px solid #e2e8f0; color: #ef4444; font-weight: bold;">${item.expiry}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <p class="text" style="margin-top: 20px;">Please take immediate action to mark these items for clearance or disposal to comply with health and safety governance.</p>
        
        <div class="button-container">
            <a href="http://localhost:3000/admin/inventory/expiry" class="button" style="background-color: ${COLORS.warning}">Manage Expiring Stock</a>
        </div>
    `)
}
// ==========================================
// MODULE 5: INVENTORY & RETURNS TEMPLATES
// ==========================================

export function getPurchaseOrderGeneratedEmailHtml(storeName: string, poId: string, itemsCount: number, totalAmount: number) {
  return wrapLayout(COLORS.primary, 'New Purchase Order Generated', `
    <p class="text">A new purchase order has been automatically generated for <strong>${storeName}</strong> due to low stock levels.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Order ID</span>
        <span class="info-value font-mono">${poId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Items Count</span>
        <span class="info-value">${itemsCount} products</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estimated Total</span>
        <span class="info-value">$${totalAmount.toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value" style="color: #f59e0b; font-weight: 700;">PENDING</span>
      </div>
    </div>
    
    <p class="text">Please review the order details and update the status once the order has been sent to the vendor.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/inventory/purchase-orders" class="button" style="background-color: ${COLORS.primary}">Review Purchase Order</a>
    </div>
  `)
}

export function getPurchaseOrderStatusUpdateEmailHtml(storeName: string, poId: string, oldStatus: string, newStatus: string) {
  return wrapLayout(COLORS.info, 'Purchase Order Status Updated', `
    <p class="text">The status of Purchase Order <strong>${poId}</strong> for <strong>${storeName}</strong> has been updated.</p>
    
    <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <div style="text-align: center;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Previous Status</div>
        <div style="font-weight: 700; color: #6b7280; margin-top: 4px;">${oldStatus}</div>
      </div>
      <div style="font-size: 24px; color: #d1d5db;">→</div>
      <div style="text-align: center;">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">New Status</div>
        <div style="font-weight: 700; color: ${newStatus === 'RECEIVED' ? COLORS.success : COLORS.info}; margin-top: 4px;">${newStatus}</div>
      </div>
    </div>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/inventory/purchase-orders" class="button" style="background-color: ${COLORS.info}">View Order Details</a>
    </div>
  `)
}

export function getReturnProcessedEmailHtml(storeName: string, orderId: string, itemsCount: number, reason: string) {
  return wrapLayout(COLORS.warning, 'Return Processed & Inventory Adjusted', `
    <p class="text">A return has been processed for <strong>${storeName}</strong>. Inventory levels have been automatically adjusted for the returned items.</p>
    
    <div class="info-card" style="border-left: 4px solid ${COLORS.warning};">
      <div class="info-row">
        <span class="info-label">Source Order</span>
        <span class="info-value">${orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Items Returned</span>
        <span class="info-value">${itemsCount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Primary Reason</span>
        <span class="info-value">${reason}</span>
      </div>
    </div>
    
    <p class="text">Stock levels have been incremented by the returned quantities. Please ensure these items are inspected before being put back on the shelves.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/store/inventory" class="button" style="background-color: ${COLORS.warning}">Check Inventory</a>
    </div>
  `)
}

export function getRefundRequestAlertEmailHtml(storeName: string, orderId: string, amount: string, reason: string, requestedBy: string) {
  return wrapLayout(COLORS.danger, '🔴 URGENT: Refund Authorization Required', `
    <p class="text">A high-priority refund request has been initiated at <strong>${storeName}</strong> and requires your authorization.</p>
    
    <div class="info-card" style="border-left: 4px solid ${COLORS.danger}; background-color: #fef2f2;">
      <div class="info-row">
        <span class="info-label">Order Reference</span>
        <span class="info-value">${orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Refund Amount</span>
        <span class="info-value" style="color: ${COLORS.danger}; font-weight: 800;">${amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reason</span>
        <span class="info-value">${reason}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Requested By</span>
        <span class="info-value">${requestedBy}</span>
      </div>
    </div>
    
    <p class="text">This request has been logged as a support ticket for tracking and compliance.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/support" class="button" style="background-color: ${COLORS.danger}">Review & Authorize</a>
    </div>
  `)
}

export function getSystemOwnerRefundAlertEmailHtml(storeName: string, orderId: string, amount: string, reason: string) {
  return wrapLayout(COLORS.dark, 'System Notification: Refund Request Logged', `
    <p class="text">As System Owner, you are being notified of a refund request that exceeded the store-level authorization threshold for <strong>${storeName}</strong>.</p>
    
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Store</span>
        <span class="info-value">${storeName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Order ID</span>
        <span class="info-value">${orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount</span>
        <span class="info-value" style="font-weight: 700;">${amount}</span>
      </div>
    </div>
    
    <p class="text">This is for audit purposes. You do not need to take action unless abnormal patterns are detected across the platform.</p>
    
    <div class="button-container">
      <a href="http://localhost:3000/admin/audit" class="button" style="background-color: ${COLORS.dark}">View Audit Trail</a>
    </div>
  `)
}
