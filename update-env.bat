@echo off
echo Updating .env file to use live PesaPal environment...
echo.

if exist .env (
    echo Current .env file found. Updating environment to 'live'...
    powershell -Command "(Get-Content .env) -replace 'VITE_PESAPAL_ENVIRONMENT=sandbox', 'VITE_PESAPAL_ENVIRONMENT=live' | Set-Content .env"
    echo Environment updated to 'live'
) else (
    echo No .env file found. Please create one with your live PesaPal credentials:
    echo.
    echo VITE_PESAPAL_CONSUMER_KEY=your_live_consumer_key
    echo VITE_PESAPAL_CONSUMER_SECRET=your_live_consumer_secret
    echo VITE_PESAPAL_IPN_ID=your_live_ipn_id
    echo VITE_PESAPAL_CALLBACK_URL=http://localhost:5173/visit-confirmation
    echo VITE_PESAPAL_ENVIRONMENT=live
    echo.
    echo VITE_SUPABASE_URL=your_supabase_url
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
)

echo.
echo Please restart your server after updating the .env file.
pause 