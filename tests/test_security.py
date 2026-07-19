from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

password = "Admin@123"

hashed = hash_password(password)

print("Hashed Password:")
print(hashed)

print()

print("Password Match:")
print(verify_password(password, hashed))

print()

print("JWT Token:")
print(create_access_token("123"))