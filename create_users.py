from modules.user_auth import UserAuthenticator
import getpass

def create_user():
    auth = UserAuthenticator()

    print("\n=== Create New User ===")

    username = input("Enter username: ").strip()
    password = getpass.getpass("Enter password: ").strip()
    confirm_password = getpass.getpass("Confirm password: ").strip()

    if not username or not password:
        print("[!] Username and password cannot be empty")
        return

    if password != confirm_password:
        print("[!] Passwords do not match")
        return

    success = auth.create_user(username, password)

    if success:
        print(f"[+] User '{username}' created successfully")
    else:
        print("[!] Failed to create user")


if __name__ == "__main__":
    create_user()