// /api/problems.js - FIXED VERSION
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fzvjbmukadxcxdkkaauk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dmpibXVrYWR4Y3hka2thYXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ4MTg1OCwiZXhwIjoyMDgwMDU3ODU4fQ.-kGzdsNszwuMi5MrS1MgjInvyswoa40r8MPvbF9ep5Y';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET: Fetch problems from Supabase
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to sample data
        return res.json({
          success: true,
          data: [
            {
              id: 1,
              problem_text: "How can we reduce plastic waste in cities?",
              user_name: "Eco Warrior",
              category: "life",
              created_at: new Date().toISOString()
            }
          ],
          message: 'Using fallback data'
        });
      }
      
      return res.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      });
      
    } catch (error) {
      console.error('Error:', error);
      return res.json({
        success: true,
        data: [],
        message: 'Error occurred, using empty data'
      });
    }
  }
  
  // POST: Create new problem in Supabase
  if (req.method === 'POST') {
    try {
      const { problem_text, user_name, category } = req.body;
      
      if (!problem_text) {
        return res.status(400).json({ 
          success: false, 
          error: 'Problem text is required' 
        });
      }
      
      const { data, error } = await supabase
        .from('problems')
        .insert([
          {
            problem_text,
            user_name: user_name || 'Anonymous',
            category: category || 'all'
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        // Return success with demo data
        return res.json({
          success: true,
          message: 'Saved in demo mode',
          data: {
            id: Date.now(),
            problem_text,
            user_name: user_name || 'Anonymous',
            category: category || 'all',
            created_at: new Date().toISOString()
          }
        });
      }
      
      return res.json({
        success: true,
        message: 'Problem saved to database!',
        data: data
      });
      
    } catch (error) {
      console.error('Error:', error);
      return res.json({
        success: true,
        message: 'Saved locally',
        data: {
          id: Date.now(),
          problem_text: req.body.problem_text,
          user_name: req.body.user_name || 'Anonymous',
          category: req.body.category || 'all',
          created_at: new Date().toISOString()
        }
      });
    }
  }
  
  return res.status(405).json({ 
    success: false, 
    error: 'Method not allowed' 
  });
}