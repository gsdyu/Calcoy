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
    signIn: '/auth/login',
    error: '/auth/signup',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Check if user exists in the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);

        if (result.rows.length > 0) {
          const existingUser = result.rows[0];
          
          // Check if the user has already set a username
          if (!existingUser.username || existingUser.username === null) {
            // Redirect to the username input page if the username is not set
            return `/enter-username?email=${user.email}`;
          }
          // Proceed with the login if username is already set
          return true;
        } else {
          // If the user doesn't exist, insert them into the database without a username
          await pool.query(
            `INSERT INTO users (email, password) VALUES ($1, $2)`,
            [user.email, 'OAuth']  // Use 'OAuth' as a placeholder password
          );
          // Redirect to the username input page for new users
          return `/enter-username?email=${user.email}`;
        }
      } catch (error) {
        console.error('Error during signIn callback:', error);
        return false; // Return false to prevent login on error
      }
    },

    async redirect({ url, baseUrl }) {
      // After setting the username, redirect to the calendar
      return `${baseUrl}/calendar`;
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
