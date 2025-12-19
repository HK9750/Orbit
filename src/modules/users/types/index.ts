export interface User {
    _id: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> { }

export interface CreateUser {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface UpdateUser {
    name?: string;
    phone?: string;
    isActive?: boolean;
}

export interface UserProfile {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
}
