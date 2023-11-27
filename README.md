# functions

hash(password: string): Promise<string>;
removeSensitiveData(body: User | Device, type: 'user' | 'device'): User | Device

# Notes

- If user gets own information we should store it in cache. We should remove it on a PATCH request

# Keyv Routes

- cache/user:${userId} - `SafeUser`
