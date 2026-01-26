# Backend Implementation Guide - Password Recovery

## Overview
This guide outlines the implementation of a secure password recovery system using tokens with expiration, external SMTP services, and rate limiting to prevent server overload.

## Architecture

### 1. Token Generation & Storage

**Requirements:**
- Generate cryptographically secure random tokens
- Store tokens with expiration timestamps
- Associate tokens with user emails

**Implementation (Node.js/Express example):**

```javascript
const crypto = require('crypto');

// Generate secure token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Store in database (example schema)
const passwordResetTokenSchema = {
  email: String,
  token: String,
  expiresAt: Date, // 30 minutes from creation
  used: Boolean,
  createdAt: Date
};
```

### 2. Email Service Integration

**Recommended Services:**
- **Resend** - Modern, developer-friendly
- **SendGrid** - Enterprise-grade
- **Mailgun** - Reliable and scalable

**Why external SMTP?**
- Offloads email queue processing
- Better deliverability rates
- Handles bounces and retries
- Doesn't consume your server resources

**Implementation (Resend example):**

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: 'noreply@tuweb.com',
    to: email,
    subject: 'Recupera tu contraseña - Perú Shop',
    html: `
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">Restablecer contraseña</a>
      <p>Este enlace expirará en 30 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `
  });
}
```

### 3. Rate Limiting

**Library:** `express-rate-limit`

```javascript
const rateLimit = require('express-rate-limit');

// Limit by IP
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Demasiados intentos. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit by email (store in Redis/Memory)
const emailResetAttempts = new Map();

function checkEmailRateLimit(email) {
  const now = Date.now();
  const attempts = emailResetAttempts.get(email) || [];
  
  // Remove attempts older than 1 hour
  const recentAttempts = attempts.filter(time => now - time < 60 * 60 * 1000);
  
  if (recentAttempts.length >= 3) {
    throw new Error('Demasiados intentos para este correo');
  }
  
  recentAttempts.push(now);
  emailResetAttempts.set(email, recentAttempts);
}
```

### 4. API Endpoints

#### POST /api/auth/forgot-password

```javascript
app.post('/api/auth/forgot-password', resetPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check email rate limit
    checkEmailRateLimit(email);
    
    // ALWAYS return success message (security best practice)
    const successMessage = 'Si el correo existe, recibirás un enlace de recuperación';
    
    // Check if user exists (don't reveal if they don't)
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: successMessage });
    }
    
    // Generate token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    // Save token
    await PasswordResetToken.create({
      email,
      token,
      expiresAt,
      used: false
    });
    
    // Send email
    await sendPasswordResetEmail(email, token);
    
    res.json({ message: successMessage });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

#### POST /api/auth/reset-password

```javascript
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    
    // Find token
    const resetToken = await PasswordResetToken.findOne({ token, used: false });
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido' });
    }
    
    // Check if expired
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ error: 'El enlace ha expirado' });
    }
    
    // Update password
    const user = await User.findOne({ email: resetToken.email });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    
    // Mark token as used
    resetToken.used = true;
    await resetToken.save();
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

## Security Checklist

- [ ] Tokens are cryptographically secure (32+ bytes)
- [ ] Tokens expire after 30 minutes
- [ ] Tokens can only be used once
- [ ] Rate limiting by IP (3 requests/hour)
- [ ] Rate limiting by email (3 requests/hour)
- [ ] Generic success messages (don't reveal if email exists)
- [ ] HTTPS only for reset links
- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] Email service credentials in environment variables
- [ ] Cleanup expired tokens periodically

## Environment Variables

```env
# SMTP Service
RESEND_API_KEY=your_api_key_here

# Frontend
FRONTEND_URL=https://tuweb.com

# Database
DATABASE_URL=your_database_url

# Security
JWT_SECRET=your_jwt_secret_here
```

## Database Cleanup (Optional Cron Job)

```javascript
// Run daily to remove expired tokens
async function cleanupExpiredTokens() {
  const now = new Date();
  await PasswordResetToken.deleteMany({
    $or: [
      { expiresAt: { $lt: now } },
      { used: true, createdAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) } }
    ]
  });
}

// Schedule with node-cron
const cron = require('node-cron');
cron.schedule('0 0 * * *', cleanupExpiredTokens); // Daily at midnight
```

## Testing

### Test Scenarios
1. Valid email - should receive email
2. Invalid email - should return success (but not send email)
3. Rate limiting - 4th request should fail
4. Expired token - should reject reset
5. Used token - should reject second use
6. Valid reset - password should update

## Frontend Integration

The frontend components are already prepared:
- `ForgotPasswordModal.tsx` - Email input form
- `ResetPasswordPage.tsx` - New password form

Update the TODO comments in these files with your actual API calls once the backend is ready.
