# FUTO Scholar Security Specification

## Data Invariants
- A user can only read their own private profile data (future proofing, currently profiles are public).
- A post can only be created by an authenticated user, and `authorId` must match the sender's UID.
- An assignment can only be created by an authenticated user.
- Claiming an assignment requires the assignment to be in 'OPEN' status.
- Money transfers must be atomic: sender's balance decreases by X, receiver's balance increases by X - commission.
- Transactions are immutable after creation.
- Users cannot modify their own `walletBalance` directly except via a system-controlled transaction (this is hard in Firestore-only, but we'll use strict rules and lookups).

## The Dirty Dozen Payloads
1. **Self-Promotion**: User A tries to set their own `walletBalance` to 1,000,000. -> DENIED
2. **Identity Spoofing**: User A posts a message as User B by setting `authorId` to User B's UID. -> DENIED
3. **Status Hijacking**: User B tries to set an assignment status to 'PAID' without paying. -> DENIED
4. **Commission Bypass**: User A tries to transfer money without recording the commission or the transaction log. -> DENIED (Handled by app-side atomicity with server-side checks if possible, but rules will block direct balance updates).
5. **Overdraft**: User A tries to send more money than they have. -> DENIED
6. **Negative Transfer**: User A sends -1000 Naira to "gain" money. -> DENIED
7. **Post Tampering**: User B tries to edit User A's post content. -> DENIED
8. **Assignment Stealing**: User B tries to change the `creatorId` of an existing assignment. -> DENIED
9. **Zombie Assignment**: User B tries to claim an assignment that is already 'ASSIGNED'. -> DENIED
10. **Shadow Fields**: User A adds a `isVerified: true` field to their profile to bypass academic checks. -> DENIED (via strict key checking).
11. **ID Poisoning**: User A creates a post with a 2MB string as document ID. -> DENIED
12. **Blanket Querying**: Anonymous user tries to list all transactions. -> DENIED

## Implementation Note
Since Firestore rules cannot easily verify that a balance update is paired with a transaction creation in a single "batch" without a backend (unless using `existsAfter`), we will enforce that:
1. Balance updates are ONLY allowed if accompanied by a transaction record in the same batch (using `getAfter`).
Actually, for simplicity in this demo, I'll restrict balance updates to be VERY strict:
- Balance can only be changed if `request.auth.uid` is part of the transaction.
- More safely: Use a "Wallet" subcollection and rules. But let's stick to the blueprint.

## Security Rules Strategy
- `users`: `allow update` only if `affectedKeys().hasOnly(['bio', 'level', 'department'])`. `walletBalance` is immutable unless a transaction validates it (advanced). For this version, I'll prevent users from updating `walletBalance` via client, requiring a server-side cloud function OR just flagging it as restricted if I can't easily enforce the atomicity without a backend.
- Wait, I can use `request.resource.data.walletBalance == resource.data.walletBalance` for standard profile updates.
- Transaction updates: disallowed.
- Posts: `authorId` must match `request.auth.uid`.
