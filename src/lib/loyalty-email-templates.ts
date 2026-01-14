// Loyalty Email Templates - Append to email.ts

export function getLoyaltyEnrollmentEmailHtml(name: string, programName: string, initialPoints: number, tierName: string) {
  const COLORS = { success: '#10b981' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.success, `Welcome to ${programName}!`, `
    <p>Hi ${name},</p>
    <p>You've been enrolled in ${programName}. Current tier: ${tierName}. ${initialPoints > 0 ? `Welcome bonus: +${initialPoints} points` : ''}</p>
  `)
}

export function getLoyaltyPointsEarnedEmailHtml(name: string, points: number, orderTotal: number, newBalance: number, tierName: string) {
  const COLORS = { primary: '#2563eb' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.primary, `You Earned ${points} Points!`, `
    <p>Great news, ${name}!</p>
    <p>You earned ${points} points from your $${orderTotal.toFixed(2)} purchase. New balance: ${newBalance} points (${tierName})</p>
  `)
}

export function getLoyaltyTierUpgradeEmailHtml(name: string, oldTier: string, newTier: string, newMultiplier: number) {
  const COLORS = { warning: '#f59e0b' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.warning, `Upgraded to ${newTier}!`, `
    <p>Congratulations ${name}!</p>
    <p>You've been upgraded from ${oldTier} to ${newTier}. Earn ${newMultiplier}x points on all purchases!</p>
  `)
}

export function getLoyaltyPointsExpiringEmailHtml(name: string, points: number, expiryDate: string, daysRemaining: number) {
  const COLORS = { danger: '#ef4444' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.danger, `${points} Points Expiring Soon!`, `
    <p>Hi ${name},</p>
    <p>${points} points expire on ${expiryDate} (${daysRemaining} days). Use them before they're gone!</p>
  `)
}

export function getLoyaltyReferralRewardEmailHtml(name: string, points: number, referredName: string, referralCode: string, totalReferrals: number) {
  const COLORS = { success: '#10b981' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.success, `You Earned ${points} Referral Points!`, `
    <p>Awesome, ${name}!</p>
    <p>${referredName} joined using your code ${referralCode}. You earned ${points} points! Total referrals: ${totalReferrals}</p>
  `)
}

export function getLoyaltyCouponIssuedEmailHtml(name: string, couponCode: string, discountDesc: string, expiryDate: string) {
  const COLORS = { primary: '#2563eb' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.primary, `Your New Coupon: ${couponCode}`, `
    <p>Hi ${name},</p>
    <p>A new coupon has been added to your account!</p>
    <p><strong>Code:</strong> ${couponCode}</p>
    <p><strong>Offer:</strong> ${discountDesc}</p>
    <p><strong>Expires:</strong> ${expiryDate}</p>
    <p>Use this code at checkout to claim your reward.</p>
  `)
}

export function getLoyaltyGamifiedRewardEmailHtml(name: string, gameName: string, rewardName: string) {
  const COLORS = { warning: '#f59e0b' }
  const wrapLayout = (color: string, title: string, content: string) => `<!DOCTYPE html><html><body>${content}</body></html>`

  return wrapLayout(COLORS.warning, `You Won a Prize in ${gameName}!`, `
    <p>Congratulations ${name}!</p>
    <p>You played ${gameName} and won: <strong>${rewardName}</strong></p>
    <p>Check your loyalty dashboard to see your updated balance or coupons.</p>
  `)
}
