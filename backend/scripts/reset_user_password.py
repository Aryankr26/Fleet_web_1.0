from __future__ import annotations

import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset a user's password in the local SQLite store.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    # Ensure 'app' package can be imported when running from repo root.
    if "backend" not in sys.path:
        sys.path.insert(0, "backend")

    from app.security import hash_password
    from app.settings import settings

    store = settings.get_store()
    user = store.get_user_by_username(args.username)
    if not user:
        print(f"User not found: {args.username}")
        return 2

    store.set_user_password_hash(int(user["id"]), hash_password(args.password))
    print(f"Password reset ok for {args.username} (id={user['id']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
