export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserInput = Omit<User, 'createdAt' | 'updatedAt'>;

// Validator function for user data
export const validateUserData = (data: CreateUserInput): string | null => {
  // Name validation
  if (!data.firstName.trim() || !data.lastName.trim()) {
    return 'First name and last name are required';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return 'Invalid email format';
  }

  // Phone validation
  const phoneRegex = /^\d{11}$/;
  if (!phoneRegex.test(data.phone)) {
    return 'Phone number must be 11 digits';
  }

  return null;
};

// Function to create a new user document
export const createUserDocument = (data: CreateUserInput): User => {
  const now = new Date().toISOString();
  
  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
};