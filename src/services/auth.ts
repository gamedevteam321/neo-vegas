import { User } from '../types/user';
import { supabase } from '@/lib/supabase';

export class AuthService {
  private static async createProfile(userId: string, email: string) {
    try {
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        throw checkError;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            balance: 10000
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  private static async getOrCreateProfile(userId: string, email: string) {
    try {
      // Try to fetch existing profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        await this.createProfile(userId, email);
        // Fetch the newly created profile
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (newProfileError) {
          console.error('Error fetching new profile:', newProfileError);
          throw newProfileError;
        }
        
        // Add virtual fields for the app
        return {
          ...newProfile,
          username: email.split('@')[0],
          display_name: email.split('@')[0]
        };
      }

      // Add virtual fields for the app
      return {
        ...profile,
        username: email.split('@')[0],
        display_name: email.split('@')[0]
      };
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      throw error;
    }
  }

  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) throw error;

      // Skip profile creation during signup to avoid RLS policy issues
      // Profile will be created during first sign in instead
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch or create user profile
      if (data.user) {
        const profile = await this.getOrCreateProfile(data.user.id, email);
        data.user = {
          ...data.user,
          ...profile,
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    }
  }

  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        // Fetch or create user profile
        const profile = await this.getOrCreateProfile(session.user.id, session.user.email!);
        session.user = {
          ...session.user,
          ...profile,
        };
      }

      return { session, error: null };
    } catch (error) {
      console.error('Error in getSession:', error);
      return { session: null, error };
    }
  }

  static async updateProfile(profile: Partial<User>) {
    try {
      // Only update the balance field
      const { data, error } = await supabase
        .from('profiles')
        .update({ balance: profile.balance })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error };
    }
  }

  static subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // Fetch or create user profile
          const profile = await this.getOrCreateProfile(session.user.id, session.user.email!);
          session.user = {
            ...session.user,
            ...profile,
          };
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      }
      callback(event, session);
    });
  }
} 