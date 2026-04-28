<template>
  <div class="payment-container">
    <div class="payment-card">
      <!-- Header -->
      <div class="section-header">
        <h2>The Right Plan For Your Business</h2>
      </div>

      <div class="content-wrapper">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Billing Frequency -->
          <div class="billing-toggle">
            <label class="toggle-option" :class="{ active: billingFrequency === 'monthly' }">
              <input type="radio" v-model="billingFrequency" value="monthly" class="radio-input">
              <span class="radio-custom"></span>
              <span class="label-text">Monthly</span>
            </label>
            <label class="toggle-option" :class="{ active: billingFrequency === 'yearly' }">
              <input type="radio" v-model="billingFrequency" value="yearly" class="radio-input">
              <span class="radio-custom"></span>
              <span class="label-text">Yearly</span>
            </label>
          </div>

          <!-- Plan Card -->
          <div class="plan-card">
            <h3>Core Plan</h3>
            <p class="price">£5.00/screen</p>
          </div>

          <!-- Screen Licenses -->
          <div class="form-group">
            <label class="form-label">
              Screen Licenses <span class="required">*</span>
            </label>
            <input 
              type="number" 
              v-model.number="screenLicenses" 
              min="1"
              class="form-input"
              placeholder="1"
            >
          </div>

          <!-- Payment Method -->
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <div class="dropdown-wrapper">
              <select v-model="paymentMethod" class="form-select">
                <option value="card">Card Payment</option>
                <option value="paypal">Paypal</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Plan Details -->
          <div class="details-section">
            <h4 class="section-title">PLAN DETAILS</h4>
            <div class="detail-item">
              <h3>Core Plan</h3>
              <p class="detail-price">£5.00/screen/month</p>
            </div>
            <div class="detail-item">
              <p class="detail-text">
                Billed: <span class="highlight">{{ billingFrequency === 'monthly' ? 'Monthly' : 'Yearly' }}(GBP)</span>
              </p>
            </div>
            <div class="detail-item">
              <p class="detail-text">Next billing on: <span class="billing-date">{{ nextBillingDate }}</span></p>
            </div>
          </div>

          <!-- Subscription Summary -->
          <div class="summary-section">
            <h4 class="section-title">SUBSCRIPTION SUMMARY</h4>
            <div class="summary-row">
              <span>Screen licenses</span>
              <span>{{ screenLicenses }}</span>
            </div>
            <div class="summary-row">
              <span>{{ screenLicenses }} license{{ screenLicenses !== 1 ? 's' : '' }} - £5.00/screen/{{ billingFrequency === 'monthly' ? 'Month' : 'Year' }}</span>
              <span>£{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>Ttotal</span>
              <span>£{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Terms -->
          <div class="terms-text">
            By continuing this process, you are accepting our term of service and privacy policy
          </div>

          <!-- Buy Button -->
          <button class="buy-button" @click="handlePurchase">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── Replace these with your actual Stripe Payment Link URLs ──────────────
const STRIPE_MONTHLY_LINK = 'https://buy.stripe.com/test_8x23cx55DbuegiTbfn6Ri00';
const STRIPE_YEARLY_LINK = 'https://buy.stripe.com/test_8x23cx55DbuegiTbfn6Ri00';



// Reactive state
const billingFrequency = ref('monthly')
const screenLicenses = ref(1)
const paymentMethod = ref('card')

// Computed properties
const totalPrice = computed(() => {
  const pricePerScreen = 5.00
  const multiplier = billingFrequency.value === 'yearly' ? 12 : 1
  return screenLicenses.value * pricePerScreen * multiplier
})

const nextBillingDate = computed(() => {
  const date = new Date()
  if (billingFrequency.value === 'monthly') {
    date.setMonth(date.getMonth() + 1)
  } else {
    date.setFullYear(date.getFullYear() + 1)
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const handlePurchase = () => {
  const baseUrl = billingFrequency.value === 'monthly'
    ? STRIPE_MONTHLY_LINK
    : STRIPE_YEARLY_LINK

  // Pass quantity so Stripe pre-fills the number of screen licenses
  const checkoutUrl = `${baseUrl}?prefilled_quantity=${screenLicenses.value}&success_url=${encodeURIComponent(window.location.origin + '/subcriptions?payment=success')}&cancel_url=${encodeURIComponent(window.location.origin + '/Payments')}`

  window.location.href = checkoutUrl
}
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.payment-card {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  padding: 32px 40px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.left-column, .right-column {
  padding: 40px;
}

.left-column {
  border-right: 1px solid #f0f0f0;
}

/* Billing Toggle */
.billing-toggle {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
}

.radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-option.active .radio-custom {
  border-color: #fbbf24;
  background-color: #fbbf24;
}

.toggle-option.active .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.label-text {
  font-size: 16px;
  color: #4a5568;
}

.toggle-option.active .label-text {
  color: #2d3748;
  font-weight: 500;
}

/* Plan Card */
.plan-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.plan-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.price {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

/* Form Elements */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
}

.required {
  color: #e53e3e;
}

.form-input, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #fbbf24;
}

.dropdown-wrapper {
  position: relative;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a5568' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
}

/* Right Column Styles */
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.details-section, .summary-section {
  margin-bottom: 32px;
}

.detail-item h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.detail-price {
  margin: 0 0 16px 0;
  color: #718096;
  font-size: 14px;
}

.detail-text {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

.highlight {
  color: #38b2ac;
  font-weight: 500;
}

.billing-date {
  color: #2d3748;
}

/* Summary */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #718096;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row.total {
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
  border-bottom: none;
  margin-top: 8px;
  padding-top: 16px;
}

/* Terms */
.terms-text {
  font-size: 13px;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 24px;
}

/* Buy Button */
.buy-button {
  width: 100%;
  padding: 16px;
  background: #fbbf24;
  color: #2d3748;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-button:hover {
  background: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.buy-button:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .left-column {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .payment-card {
    margin: 0;
    border-radius: 0;
  }
  
  .payment-container {
    padding: 0;
  }
}
</style>