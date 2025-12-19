import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const SALT_ROUNDS = 10;

export class CryptoHelper {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static generateRandomToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    static hashSHA256(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    static genUUID(): string {
        return crypto.randomUUID();
    }
}
