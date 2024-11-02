# ADHDHelperV2

## Setup Instructions

1. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required credentials

2. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the Google Calendar API
   - Create credentials:
     - Create API key
       - Restrict to Calendar API
       - Add application restrictions (HTTP referrers)
       - Add `http://localhost:5173/*`
     - Create OAuth 2.0 Client ID
       - Add authorized JavaScript origins
       - Add `http://localhost:5173`
   - Configure OAuth consent screen
   - Add test users if in testing mode

3. **Calendar Setup**
   - Create or select Google Calendar
   - Get Calendar ID from settings
   - Add to .env file

4. **Development**   ```bash
   npm install
   npm run dev   ```

## Troubleshooting

If you get "API key not valid" error:
1. Check API key restrictions in Google Cloud Console
2. Verify the key is properly copied to .env
3. Check browser console for detailed error messages
4. Ensure Calendar API is enabled
5. Check application restrictions match your URL