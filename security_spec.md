# Security Specification — EkranTarjimon

## Data Invariants
1. A user document at `/users/{userId}` can only be read or created by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`) or the verified admin (`dsavkat771@gmail.com`).
2. Users MUST initialize their account with `plan == "free"` and either `bonusCredits == 0` (standard signup) or `bonusCredits == 5` ONLY if `referredBy` points to an existing different user and `/referrals/{userId}` is atomically created in the same batch.
3. Users can only increment `dailyUsed` and `totalTranslations` (or reset `dailyUsed` when `lastResetDate` advances), update `preferredTargetLang`/`displayName`, or atomically claim exactly `+10` `bonusCredits` and `+1` `referralCount` paired with flipping an unclaimed `/referrals/{referralId}` owned by them (`referrerId == request.auth.uid`) from `claimed == false` to `claimed == true`. Only the verified admin can modify `plan` or grant arbitrary `bonusCredits`.
4. A `/referrals/{referralId}` document MUST have `referralId == request.auth.uid`, `referredUserId == request.auth.uid`, `referrerId != request.auth.uid`, `rewardCredits == 10`, `claimed == false`, and an existing `/users/{referrerId}` document. Once `claimed` becomes `true`, it reaches a terminal state and cannot be modified again.
5. A `/paymentRequests/{requestId}` document MUST be created with `status == "pending"` and `userId == request.auth.uid`. Once `"approved"` or `"rejected"`, it reaches terminal state and cannot be modified by non-admins.
6. `/users/{userId}/translations/{translationId}` documents are strictly private to `userId` (`request.auth.uid == userId`), require parent `/users/{userId}` existence on creation, and enforce bounded string/array lengths.
7. Rewarded-ad credits on `/users/{userId}` can only add `+2` `bonusCredits` per update while incrementing `adRewardsToday` by `+1` (or resetting to `1` on a new `lastResetDate`), strictly capped at `adRewardsToday <= 5` per day.
8. `/appConfig/monetization` contains zero PII, allows single-document public `get` only on `monetization` (no `list`), restricts writes strictly to `isAdmin()`, and enforces `https://` URLs on `sponsorUrl`.

## Adversarial Payloads Tested
1. `create /users/victimUid` with `uid: "victimUid"` by `attackerUid` -> DENIED (owner check).
2. `create /users/attackerUid` with `plan: "pro"` -> DENIED (must be `"free"`).
3. `create /users/attackerUid` with `bonusCredits: 9999` or `bonusCredits: 5` without valid referral -> DENIED.
4. `update /users/attackerUid` changing `plan: "pro"` -> DENIED (only admin can change `plan`).
5. `update /users/attackerUid` with extra shadow field `isAdmin: true` -> DENIED (`affectedKeys().hasOnly(...)`).
6. `create /users/attackerUid` with `createdAt` in past/future -> DENIED (`createdAt == request.time`).
7. `create /paymentRequests/req1` with `status: "approved"` -> DENIED (must be `"pending"`).
8. `update /paymentRequests/req1` by owner changing `status: "approved"` -> DENIED (only admin can review).
9. `list /paymentRequests` by non-admin without filtering `userId == request.auth.uid` -> DENIED (`resource.data.userId == request.auth.uid || isAdmin()`).
10. `create /users/attackerUid/translations/very_long_id_over_128_chars...` -> DENIED (`isValidId`).
11. `create /users/attackerUid/translations/t1` with `previewLines` having 50 items -> DENIED (`size() <= 10`).
12. `get /users/victimUid` by unverified email token -> DENIED (`email_verified == true`).
13. `create /referrals/attackerUid` with `referrerId == "attackerUid"` (self-referral) -> DENIED (`referrerId != request.auth.uid`).
14. `create /referrals/fakeId` where `fakeId != request.auth.uid` (multiple referrals from one account) -> DENIED (`referralId == request.auth.uid`).
15. `update /users/attackerUid` adding `+10` `bonusCredits` without atomically claiming an unclaimed `/referrals/{id}` doc -> DENIED (`getAfter` atomicity gate).
16. `update /referrals/ref1` setting `claimed: true` when `existing().claimed == true` (double claim) -> DENIED (terminal state lock).
17. `update /users/attackerUid` adding `+50` `bonusCredits` via rewarded-ad action -> DENIED (`bonusCredits == existing().bonusCredits + 2`).
18. `update /users/attackerUid` setting `adRewardsToday: 6` -> DENIED (`adRewardsToday <= 5`).
19. `write /appConfig/monetization` by non-admin user -> DENIED (`isAdmin()`).
20. `write /appConfig/monetization` with `sponsorUrl: "javascript:alert(1)"` -> DENIED (`https://` check).
