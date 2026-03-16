export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  basic_info: {
    age: number;
    height: number;
    education: string;
    occupation: string;
    income: string;
    location: string;
    gender: 'male' | 'female';
    [key: string]: any;
  };
  relationship_history: string;
  requirements: {
    min_age: number;
    max_age: number;
    min_height: number;
    education: string[];
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  sender?: User & { profile?: Profile }; // For joined queries
  receiver?: User & { profile?: Profile }; // For joined queries
}

export interface Invitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  meeting_type: string;
  proposed_time: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  match_reasons: {
    pros: string[];
    cons: string[];
    summary: string;
  };
  created_at: string;
  user?: User & { profile?: Profile }; // The other user in the match
}
