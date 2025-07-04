
/**
 * 
 * 
 */
export interface IMomoMethod {
    uid: string;
    phone: string;
    provider: string;
    otp?: string;
    otpCount?: number;
    otpExpiresAt?: Date;
    verified: boolean;
}