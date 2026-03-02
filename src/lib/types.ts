









export type FinancialRecord = {
    id: string;
    userId: string;
    amount: number;
    category: 'Offerings' | 'Tithes' | '365 Offerings' | 'First Fruit Offerings' | 'Salomon Offerings' | 'Attendance' | string;
    date: any; // Can be Timestamp from Firestore
    notes?: string;
    createdAt: any; // Can be Timestamp
    reporterFullName?: string;
    campus?: string;
    serviceTime?: string;
    serviceType?: string;
};

export type Offering = {
  id: string;
  name: string;
  amount: number;
  type: 'Tithe' | 'General' | 'Missions' | 'Building Fund';
  date: Date;
};

export type KpiData = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  description: string;
  subValue?: string;
};

export type Campus = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    latlong?: string;
    country?: string;
    areaCode?: string;
    region?: string;
    image?: string;
    createdAt?: {
        seconds: number;
        nanoseconds: number;
    }
}

export type Ministry = {
    id: string;
    name: string;
    description?: string;
    createdAt?: {
        seconds: number;
        nanoseconds: number;
    }
}

export type UserProfile = {
    uid: string;
    email: string;
    name: string; // This will be derived from firstName and lastName
    firstName: string;
    lastName: string;
    photoURL: string;
    role: 'Developer' | 'Admin' | 'Tech Support' | 'Team' | 'Volunteer' | 'User' | 'Guest';
    access?: string[];
    campus?: string;
    ministry?: string;
    hpNumber?: string;
    createdAt?: {
        seconds: number;
        nanoseconds: number;
    };
    lastLoginAt?: {
        seconds: number;
        nanoseconds: number;
    };
}

export type PermissionRow = {
    feature: string;
    description: string;
    permissions: {
      [key: string]: boolean;
      Guest: boolean;
      User: boolean;
      Volunteer: boolean;
      Team: boolean;
      Admin: boolean;
      Developer: boolean;
    };
  };

export type GivingEntry = {
    userId: string;
    reporterFullName: string;
    campus: string;
    date: any; // Can be Timestamp from Firestore
    serviceTime: string;
    serviceType: string;
    offerings: number;
    tithes: number;
    offerings365: number;
    firstFruitOfferings: number;
    salomonOfferings: number;
    attendance: number;
    createdAt: any; // Can be Timestamp
};

export type Projection = {
    id: string;
    userId: string;
    year: number;
    projection: number;
    previousYearIncome: number;
    projectedState: number;
    createdAt: any;
}

export type Region = {
    id: string;
    name: string;
    order?: number;
    createdAt?: {
        seconds: number;
        nanoseconds: number;
    }
}
    
export type Resource = {
    id: string;
    userId: string;
    title: string;
    description?: string;
    type: 'Link' | 'Video' | 'Image' | 'Document' | 'Memo';
    url?: string;
    content?: string;
    createdAt: any; // Can be Timestamp
}

export type Reply = {
    userId: string;
    message: string;
    createdAt: any; // Can be Date or Firestore Timestamp
};

export type Feedback = {
    id: string;
    userId: string;
    name: string;
    email: string;
    type: string;
    message: string;
    date: any; // Can be Timestamp from Firestore
    replies?: Reply[];
};

export type OptionItem = {
    value: string;
    label: string;
};

export type FormOptions = {
    id: string;
    options: OptionItem[];
};
    



