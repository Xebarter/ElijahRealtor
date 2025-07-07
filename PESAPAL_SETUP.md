# PesaPal Integration Setup Guide

## Current Status

The application is now configured to use **Real PesaPal Integration** with a backend proxy server to handle CORS issues.

## Real PesaPal Integration Setup

### Step 1: Get PesaPal Credentials

1. Sign up for a PesaPal developer account at https://developer.pesapal.com/
2. Create a new application
3. Get your Consumer Key and Consumer Secret
4. Set up an IPN (Instant Payment Notification) URL

### Step 2: Create Environment Variables

Create a `.env` file in your project root:

```env
# PesaPal Configuration
VITE_PESAPAL_CONSUMER_KEY=your_consumer_key_here
VITE_PESAPAL_CONSUMER_SECRET=your_consumer_secret_here
VITE_PESAPAL_IPN_ID=your_ipn_id_here
VITE_PESAPAL_CALLBACK_URL=http://localhost:5173/visit-confirmation
VITE_PESAPAL_ENVIRONMENT=sandbox

# Supabase Configuration (if not already configured)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Set Up Backend Proxy Server

The application includes a backend proxy server to handle PesaPal API calls and avoid CORS issues.

1. **Install server dependencies:**
   ```bash
   npm install express cors node-fetch dotenv
   npm install -D nodemon
   ```

2. **Start the proxy server:**
   ```bash
   node server.js
   ```
   
   Or for development with auto-restart:
   ```bash
   npx nodemon server.js
   ```

3. **Verify the server is running:**
   - Visit: http://localhost:3001/api/health
   - You should see: `{"status":"ok","message":"PesaPal proxy server is running"}`

### Step 4: Start Your Frontend Application

```bash
npm run dev
```

### Step 5: Test the Integration

1. Navigate to `/pesapal-config` to check your configuration
2. Try booking a visit on any property
3. The payment should now use real PesaPal integration

## How It Works

1. **Frontend** → Makes requests to your proxy server (`http://localhost:3001/api/pesapal-proxy`)
2. **Proxy Server** → Forwards requests to PesaPal API with proper authentication
3. **PesaPal** → Processes payment and returns response
4. **Proxy Server** → Returns response to frontend

## Development vs Production

### Development (Current Setup)
- Uses sandbox environment
- Proxy server runs on localhost:3001
- Frontend runs on localhost:5173

### Production
- Update environment variables:
  ```env
  VITE_PESAPAL_ENVIRONMENT=live
  VITE_PESAPAL_CALLBACK_URL=https://yourdomain.com/visit-confirmation
  ```
- Deploy proxy server to your hosting platform
- Update frontend to use production proxy URL

## Troubleshooting

### If you see "CORS Error":
- Make sure the proxy server is running on port 3001
- Check that the proxy server is accessible at http://localhost:3001/api/health

### If you see "Credentials not configured":
- Check your `.env` file has the correct PesaPal credentials
- Restart both frontend and backend servers after updating `.env`

### If proxy server fails to start:
- Check that port 3001 is not in use
- Verify all dependencies are installed
- Check the console for error messages

## Files Created/Modified

- `server.js` - Backend proxy server for PesaPal API calls
- `server-package.json` - Dependencies for the proxy server
- `src/lib/payment.ts` - Updated to use proxy server
- `src/lib/mockPesaPal.ts` - Fallback mock service
- `src/pages/MockPayment.tsx` - Mock payment page (for testing)
- `src/components/common/PesaPalConfigChecker.tsx` - Configuration checker
- `src/pages/PesaPalConfig.tsx` - Configuration page

## Next Steps

1. Get real PesaPal credentials from the developer portal
2. Update your `.env` file with the credentials
3. Start the proxy server: `node server.js`
4. Start your frontend: `npm run dev`
5. Test the payment flow
6. For production, deploy both frontend and proxy server 