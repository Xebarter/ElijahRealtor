@echo off
echo ========================================
echo PesaPal Integration Setup Script
echo ========================================
echo.

echo Step 1: Installing server dependencies...
npm install express cors node-fetch dotenv
npm install -D nodemon

echo.
echo Step 2: Creating .env file template...
if not exist .env (
    echo # PesaPal Configuration > .env
    echo VITE_PESAPAL_CONSUMER_KEY=your_consumer_key_here >> .env
    echo VITE_PESAPAL_CONSUMER_SECRET=your_consumer_secret_here >> .env
    echo VITE_PESAPAL_IPN_ID=your_ipn_id_here >> .env
    echo VITE_PESAPAL_CALLBACK_URL=http://localhost:5173/visit-confirmation >> .env
    echo VITE_PESAPAL_ENVIRONMENT=sandbox >> .env
    echo. >> .env
    echo # Supabase Configuration >> .env
    echo VITE_SUPABASE_URL=your_supabase_url_here >> .env
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here >> .env
    echo Created .env file template
) else (
    echo .env file already exists
)

echo.
echo Step 3: Starting proxy server...
echo Starting PesaPal proxy server on port 3001...
start "PesaPal Proxy Server" cmd /k "node server.cjs"

echo.
echo Step 4: Starting frontend application...
echo Starting frontend on port 5173...
start "Frontend App" cmd /k "npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get your PesaPal credentials from https://developer.pesapal.com/
echo 2. Update the .env file with your real credentials
echo 3. Test the integration at http://localhost:5173/pesapal-config
echo 4. Try booking a visit to test the payment flow
echo.
echo Press any key to exit...
pause > nul 