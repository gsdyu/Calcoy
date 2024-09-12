import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { Pool } from 'pg';
require('dotenv').config({ path: '../.env.local' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,   
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_ID,  
      clientSecret: process.env.MICROSOFT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID,  
    }),
  ],
  pages: {
    signIn: '/auth/login', // Login page
    error: '/auth/signup', // Redirect to signup page if an error occurs
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // Check if the user already exists in the database
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);

          if (result.rows.length > 0) {
            // If the user exists, just return true to continue with the login
            return true;
          } else {
            // If the user does not exist, insert the new user into the database
            await pool.query(
              `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
              [user.name, user.email, 'OAuth']  // Use 'OAuth' as a placeholder password for OAuth users
            );
            return true;
          }
        } catch (error) {
          console.error('Error saving user to database:', error);
          return false; // If there's an error, don't allow sign in
        }
      }
      return true; // Return true for other providers or if no error
    },

    async redirect({ url, baseUrl }) {
      // Redirect to the calendar page after successful sign-in
      if (url === '/auth/signup?error=OAuthAccountNotLinked' || url === '/auth/error') {
        return `${baseUrl}/auth/signup`; // Redirect back to signup page if the user cancels Google sign-in or there's an error
      }
      return `${baseUrl}/calendar`; // Always redirect to the calendar page after successful sign-in
    },

    async session({ session, token }) {
       return session;
    },
  },
  events: {
    async signIn(message) {
      console.log(`User ${message.user.email} signed in`);
    },
    async error(message) {
      console.log(`Error: ${message}`);
    }
  }
};

export default NextAuth(authOptions);
