export class GoogleAuthService {
  private static CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private static SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  private tokenClient: any = null;
  private accessToken: string | null = null;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Current origin:', window.location.origin);

    await new Promise<void>((resolve) => {
      const checkAPIs = () => {
        if (window.gapi && window.google?.accounts) {
          console.log('APIs loaded successfully');
          resolve();
        } else {
          console.log('Waiting for APIs...');
          setTimeout(checkAPIs, 100);
        }
      };
      checkAPIs();
    });

    await new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        try {
          console.log('Initializing gapi client...');
          await gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          });
          console.log('Gapi client initialized');
          resolve();
        } catch (error) {
          console.error('Error initializing gapi client:', error);
          throw error;
        }
      });
    });

    try {
      console.log('Initializing token client...');
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GoogleAuthService.CLIENT_ID,
        scope: GoogleAuthService.SCOPES.join(' '),
        callback: (response: any) => {
          console.log('Token client callback received:', response.error || 'success');
          if (response.error !== undefined) {
            throw new Error(response.error);
          }
          this.accessToken = response.access_token;
        },
      });
      console.log('Token client initialized');
    } catch (error) {
      console.error('Error initializing token client:', error);
      throw error;
    }

    this.initialized = true;
  }

  async signIn(): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.accessToken) {
      return this.accessToken;
    }

    return new Promise<string>((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          reject(new Error('Token client not initialized'));
          return;
        }

        this.tokenClient.callback = (response: any) => {
          if (response.error !== undefined) {
            reject(new Error(response.error));
            return;
          }
          this.accessToken = response.access_token;
          resolve(response.access_token);
        };

        this.tokenClient.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  async signOut() {
    if (this.accessToken) {
      this.accessToken = null;
      if (this.tokenClient) {
        this.tokenClient.callback = null;
      }
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().startsWith('GAPI')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const googleAuthService = new GoogleAuthService();

export const initializeGoogleCalendarAPI = async () => {
  try {
    console.log('Initializing Google Calendar API...');
    await gapi.client.load('calendar', 'v3');
    console.log('Google Calendar API initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Calendar API:', error);
    throw error;
  }
};