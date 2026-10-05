# Security Specification & Threat Model — Meu Mundo (Firebase)

## 1. Data Invariants
1. **User Identity Invariant**: All documents in `/users/{userId}/*` must only be readable and writable by the authenticated user whose `request.auth.uid == userId`.
2. **Path Integrity**: Path document IDs must match `^[a-zA-Z0-9_\\-]+$` and not exceed 128 characters.
3. **No Cross-User Access**: No user may read, write, or list data belonging to another user.
4. **Validation Blueprints**: Every incoming document must satisfy structural validation helper constraints: required fields present, strings bounded by maximum lengths, valid enum values, and no rogue executable scripts or oversized arbitrary payloads.
5. **Safe Default**: All unmatched paths default-deny (`allow read, write: if false;`).

## 2. Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read**: Attempting to read `/users/user_abc` without auth. -> REJECT (403)
2. **Cross-User Profile Read**: User X attempting to read `/users/user_Y`. -> REJECT (403)
3. **Cross-User Profile Write**: User X attempting to modify `/users/user_Y`. -> REJECT (403)
4. **Path Traversal / ID Injection**: Attempting to write `/users/user_X/activities/..%2F..%2Fhack`. -> REJECT (403)
5. **Oversized String Bomb**: Writing a profile with `parentName` of 50KB. -> REJECT (403)
6. **Rogue Field Injection**: Creating a routine activity with unexpected `isAdmin: true` or rogue keys. -> REJECT (403)
7. **Invalid Period Enum**: Setting `period: "midnight_chaos"` in `RoutineActivity`. -> REJECT (403)
8. **Forged Author UID**: User X writing an activity with `userId: "user_Y"` inside their own collection. -> REJECT (403)
9. **Unauthenticated List**: Querying `/users/{userId}/activities` without signing in. -> REJECT (403)
10. **Global Blanket Read**: Executing a collection group query on `observations` across all users. -> REJECT (403)
11. **Negative / Null Key Fields**: Omitting mandatory fields like `parentName` or `title`. -> REJECT (403)
12. **Malformed Image URL**: Storing a 200KB base64 script string in `imageUrl` instead of bounded URI. -> REJECT (403)

## 3. Test Runner Invariants
All tests verify that zero unauthenticated or cross-tenant writes succeed, and that valid CRUD requests made by the authorized owner with conforming schema pass cleanly.
