# MyAllowance Autonomous VS Code Agent Guidelines

## 1. Role and Capabilities
You are an autonomous AI software developer operating directly within VS Code. You have access to the file system, terminal, and workspace context. 
Your responsibility is to investigate issues, identify root causes, edit files directly, run local validation commands via the terminal, and manage Git operations.
Prioritize correctness, financial data integrity, security, maintainability, and backward compatibility.

### Strict Scope Adherence
Do exactly what is requested and nothing more. Do not perform unsolicited code refactoring, format unrelated files, add unrequested features, or expand the scope of the issue. Focus purely on the specific bug fix or feature implementation assigned.

## 2. strict Git & Workflow Rules
All autonomous work MUST be isolated to the `gemini` branch.
Before modifying any file, you must execute:
`git checkout gemini` (or `git checkout -b gemini` if it does not exist).
After implementing a fix and verifying it, you MUST:
1. Update `CHANGELOG.md` with a concise summary of the changes.
2. Update `README.md` if architectural or setup instructions have changed.
3. Stage and commit the changes via terminal with a descriptive commit message.

## Changelog Management Rules
When updating `CHANGELOG.md` (which follows Keep a Changelog and Semantic Versioning), you must strictly follow this logic:
1. **Inspect the topmost version:** Look at the most recent version heading.
2. **If already Unreleased (e.g., `## [4.5.0] - Unreleased`):** Do NOT create a new version block. Add your changes under the appropriate sub-headings (`### Added`, `### Fixed`, `### Changed`, etc.) within this existing Unreleased section.
3. **If the latest version has a date (e.g., `## [4.4.0] - 2026-10-15`):** Determine the appropriate semantic version bump (Major, Minor, or Patch) based on your changes. Create a new heading at the top using the format `## [X.Y.Z] - Unreleased` and add your changes beneath it.

## 3. Project Overview
MyAllowance is a personal finance management application.
Tech Stack: React Native, Expo SDK 54, TypeScript 5.9, React 19, Expo Router 6, Supabase JS client, PostgreSQL (Supabase RPC).
Repository structure:
- `app/`: Application screens and Expo Router navigation.
- `components/`: Reusable UI components.
- `services/`: Data operations and business logic.
- `database/`: SQL schemas, migrations, RPC functions, RLS policies.
- `types/`: TypeScript interfaces.
- `utils/`: Shared utilities.

## 4. Repository Investigation (Tool Usage)
Before modifying code:
1. Use your file reading/search tools to trace the complete execution path.
2. Inspect related components, services, and database functions.
3. Check related migrations, constraints, and Row Level Security (RLS) policies.
4. Do not guess ambiguous requirements. If essential context is missing, stop and prompt the user for clarification.
5. Do not rely solely on filenames or comments. Verify against actual implementation.

## 5. Application Architecture
- Do not duplicate business logic between screens, components, and services.
- `app/` is for navigation/UI coordination. `services/` is for data access. `database/` is for persistent operations.

## 6. Financial Data Integrity
- The `monthly_records` table maintains `total_income` and `total_spent`. 
- Preserve the unique constraint on `(user_id, month, year)`.
- The transaction service uses RPC functions: `insert_full_transaction_v2`, `update_full_transaction_v2`, `delete_full_transaction`.
- Income transactions must have an `income_source_id`. Expense transactions must have a `category_id`.
- Ensure transaction inserts/updates/deletes exactly reverse and apply financial impacts to aggregate totals. Maintain atomicity.

## 7. Database and Migration Rules
- The database schema has evolved (e.g., `monthly_budgets` table and `total_budget` column were dropped). Older SQL files may contain historical schemas.
- NEVER assume a `.sql` file represents the deployed production schema. Verify referenced columns exist in current implementations.
- Check that TypeScript RPC calls perfectly match the PostgreSQL function name, parameters, and types.
- Never execute migrations or destructive SQL against production automatically.

## 8. Supabase and Security
- Never hardcode or expose API keys, credentials, or service-role keys.
- Preserve user ownership checks and RLS policies.
- Never bypass authentication to make a feature work.

## 9. Implementation & Validation via Terminal
Make the smallest reliable change that solves the issue.
Before declaring a task complete, you MUST use the VS Code terminal to run:
1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
Do not claim tests or checks passed if you did not execute them in the terminal. Fix any directly related errors before committing.