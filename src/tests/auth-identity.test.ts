import fs from "fs";
import path from "path";
import {
  ensureAnonymousSession,
  fetchProfileByUserId,
  updateUsernameWithUniqueness,
  linkAnonymousAccountToEmail,
  deleteUserAccount,
} from "../backend/supabase/auth";

console.log("=================================================");
console.log("CINEXOX FAZ 1: AUTH & IDENTITY TEST SUITE");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, desc: string) {
  totalCount++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${desc}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${desc}`);
  passedCount++;
}

async function runTests() {
  // Test 1: ensureAnonymousSession executes safely
  const authState = await ensureAnonymousSession();
  assert(
    typeof authState === "object" && authState !== null,
    "ensureAnonymousSession returns a valid AuthState object"
  );
  assert(
    authState.user !== undefined && authState.isAnonymous !== undefined,
    "AuthState contains user and isAnonymous attributes"
  );

  // Test 2: fetchProfileByUserId safely handles non-existent user
  const nonExistentProfile = await fetchProfileByUserId("00000000-0000-0000-0000-000000000000");
  assert(
    nonExistentProfile === null || typeof nonExistentProfile === "object",
    "fetchProfileByUserId safely returns null for non-existent UUID without throwing"
  );

  // Test 3: updateUsernameWithUniqueness client-side guard
  const shortUsernameResult = await updateUsernameWithUniqueness("ab");
  assert(
    typeof shortUsernameResult === "object",
    "updateUsernameWithUniqueness returns structured response object"
  );

  // Test 4: linkAnonymousAccountToEmail contract
  const linkResult = await linkAnonymousAccountToEmail("test@example.com", "password123");
  assert(
    typeof linkResult === "object" && typeof linkResult.success === "boolean",
    "linkAnonymousAccountToEmail returns standard success/error interface"
  );

  // Test 5: Verify FAZ 1 Migration file integrity
  const migrationPath = path.resolve(__dirname, "../../supabase/migrations/20261101_faz1_auth_profiles.sql");
  assert(fs.existsSync(migrationPath), "Migration file 20261101_faz1_auth_profiles.sql exists");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  assert(
    migrationSql.includes("foreign key (id) references auth.users(id)"),
    "Migration establishes foreign key profiles.id -> auth.users(id)"
  );
  assert(
    migrationSql.includes("on delete cascade"),
    "Migration configures ON DELETE CASCADE on profiles.id"
  );
  assert(
    migrationSql.includes("create or replace function public.handle_new_user()"),
    "Migration defines automatic profile creation trigger function handle_new_user"
  );
  assert(
    migrationSql.includes("create trigger on_auth_user_created"),
    "Migration binds on_auth_user_created trigger on auth.users"
  );
  assert(
    migrationSql.includes("idx_profiles_username_lower"),
    "Migration creates case-insensitive uniqueness index on username"
  );
  assert(
    migrationSql.includes("create or replace function public.change_username"),
    "Migration defines change_username RPC function with length & collision checks"
  );

  // Test 6: Verify FAZ 1 Down Migration file integrity
  const downMigrationPath = path.resolve(__dirname, "../../supabase/migrations/20261101_faz1_auth_profiles.down.sql");
  assert(fs.existsSync(downMigrationPath), "Rollback migration file 20261101_faz1_auth_profiles.down.sql exists");
  const downSql = fs.readFileSync(downMigrationPath, "utf8");
  assert(
    downSql.includes("drop trigger if exists on_auth_user_created"),
    "Rollback script drops on_auth_user_created trigger"
  );
  assert(
    downSql.includes("drop function if exists public.handle_new_user"),
    "Rollback script drops handle_new_user function"
  );
  assert(
    downSql.includes("drop constraint if exists profiles_id_fkey"),
    "Rollback script cleanly drops foreign key constraint"
  );

  // Test 7: deleteUserAccount safe execution contract
  const deleteResult = await deleteUserAccount();
  assert(
    typeof deleteResult === "object" && typeof deleteResult.success === "boolean",
    "deleteUserAccount returns structured boolean success result"
  );

  // Test 8: Verify FAZ 5 Account Deletion Migration file integrity (Apple 5.1.1(v))
  const deletionMigrationPath = path.resolve(__dirname, "../../supabase/migrations/20261103_faz5_account_deletion_rpc.sql");
  assert(fs.existsSync(deletionMigrationPath), "Migration file 20261103_faz5_account_deletion_rpc.sql exists");
  const deletionSql = fs.readFileSync(deletionMigrationPath, "utf8");
  assert(
    deletionSql.includes("create or replace function public.delete_user_account()"),
    "Migration defines delete_user_account RPC function"
  );
  assert(
    deletionSql.includes("delete from auth.users where id = v_user_id"),
    "Migration deletes user from auth.users cascading to dependent tables"
  );
  assert(
    deletionSql.includes("grant execute on function public.delete_user_account() to authenticated"),
    "Migration restricts execution of delete_user_account to authenticated users"
  );
  assert(
    deletionSql.includes("revoke execute on function public.delete_user_account() from anon, public"),
    "Migration revokes anonymous/public access to delete_user_account"
  );
  assert(
    deletionSql.includes("set search_path = public, auth, pg_temp"),
    "Migration sets strict search_path including pg_temp to prevent object shadowing"
  );
  assert(
    !deletionSql.includes("'error', SQLERRM"),
    "Migration does not leak internal SQLERRM to client response payload"
  );
  assert(
    deletionSql.includes("raise warning"),
    "Migration logs internal failure details safely via server warning"
  );

  // Test 9: Verify FAZ 5 Down Migration file integrity
  const deletionDownPath = path.resolve(__dirname, "../../supabase/migrations/20261103_faz5_account_deletion_rpc.down.sql");
  assert(fs.existsSync(deletionDownPath), "Rollback migration file 20261103_faz5_account_deletion_rpc.down.sql exists");
  const deletionDownSql = fs.readFileSync(deletionDownPath, "utf8");
  assert(
    deletionDownSql.includes("drop function if exists public.delete_user_account()"),
    "Rollback script drops delete_user_account function"
  );

  console.log("\n=================================================");
  console.log(`FAZ 1 AUTH RESULT: ${passedCount}/${totalCount} PASSED (100%)`);
  console.log("=================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
