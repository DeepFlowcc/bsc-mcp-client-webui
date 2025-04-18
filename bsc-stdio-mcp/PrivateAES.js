import * as crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const saltLen = 16; // Salt length for scrypt
const keyLen = 32; // Key length for AES-256
const iterations = 16384; // Number of iterations for scrypt

/**
 * Derives a key from the password using scrypt
 * @param password User provided password
 * @param salt Salt for key derivation
 * @returns Promise resolving to the derived key
 */
function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, keyLen, { N: iterations }, (err, key) => {
            if (err) reject(err);
            else resolve(key);
        });
    });
}

/**
 * Encrypts an EVM private key using scrypt and user password
 * @param privateKey The EVM private key to encrypt
 * @param password User-provided password
 * @returns Encrypted string (Base64 encoded)
 */
export async function encryptPrivateKey(privateKey, password) {
    // Generate random salt
    const salt = crypto.randomBytes(saltLen);
    
    // Derive key using scrypt
    const key = await deriveKey(password, salt);
    
    // Generate random initialization vector
    const iv = crypto.randomBytes(12);
    
    // Create cipher object
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    // Encrypt private key
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Concatenate all necessary components and encode as Base64 string
    const result = Buffer.concat([
        salt,                         // Store salt
        iv,                           // Store IV
        authTag,                      // Store auth tag
        Buffer.from(encrypted, 'base64')  // Store encrypted data
    ]);
    
    return result.toString('base64');
}

/**
 * Decrypts an EVM private key using scrypt and user password
 * @param encryptedData Encrypted private key data (Base64 encoded)
 * @param password User-provided password
 * @returns Decrypted private key or null (if password is incorrect)
 */
export async function decryptPrivateKey(encryptedData, password) {
    try {
        // Decode Base64
        const data = Buffer.from(encryptedData, 'base64');
        
        // Extract components
        const salt = data.subarray(0, saltLen);
        const iv = data.subarray(saltLen, saltLen + 12);
        const authTag = data.subarray(saltLen + 12, saltLen + 12 + 16);
        const encrypted = data.subarray(saltLen + 12 + 16).toString('base64');
        
        // Derive key using same salt and parameters
        const key = await deriveKey(password, salt);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);
        
        // Decrypt
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    catch (error) {
        // Decryption failed (incorrect password or data corruption)
        console.error('Decryption error:', error.message);
        return null;
    }
}
