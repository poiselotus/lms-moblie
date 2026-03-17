# Google Sign-In Implementation TODO

## Plan Breakdown (Approved by User)

✅ Google provider enabled in Firebase Console

## Steps:

- [x] 1. Create TODO.md
- [x] 2. Update src/context/AuthContext.tsx: Add GoogleAuthProvider import, signInWithGoogle function, expose in context
- [ ] 3. Update app/login.tsx: Add useAuth hook for signInWithGoogle, handleGoogleSignIn handler, uncomment socialContainer + Google button onPress
- [ ] 4. Update app/signup.tsx: Same as login.tsx (add handler, uncomment UI)
- [ ] 5. Install additional Expo deps if needed: expo-auth-session expo-crypto (for mobile web auth flow)
- [ ] 6. Test: expo start --web, test Google popup; expo start (mobile preview)
- [ ] 7. Mark complete, attempt_completion

**Current Progress: 5/7 complete**

- [x] 5. Install additional Expo deps if needed: expo-auth-session expo-crypto (for mobile web auth flow)
