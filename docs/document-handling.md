
Root Cause
Race Condition / Timing Issue:

If two users (or the same user, e.g., via double-click or network retry) submit at nearly the same time, both may pass the checkExistingExpense check before either document is written.
Both then proceed to create a new document with their own set of items, resulting in duplicates.
No Unique Constraint at the Item Level:

The merging logic only deduplicates by expenseItemId, but if two submissions generate different IDs for the same logical item, both are saved.
No Transaction/Atomicity:

The check and write are not wrapped in a Firestore transaction, so atomicity is not guaranteed.
How to Fix

A. Use Firestore Transactions for Atomicity

Wrap the check and write in a transaction to ensure only one document is created for a given branch/date/type.

B. Add a Unique Constraint/Key

Generate a deterministic key for each expense item (e.g., hash of branchCode+date+expenseType+expenseName+total) and deduplicate based on this.

C. Prevent Double Submission in UI

Disable the submit button after the first click until the operation completes.

1. Impact Analysis
_onConfirmOrder is used as the onConfirm prop for all expense components:
DailyChange
HeadOfficeTransfer
ExecutiveExpenses
Your duplication issue only affects dailyChange (per your report and schema).
Other expense types (headOfficeTransfer, executive) do not have the same race/duplication risk, as their creation logic and user flows are different (and likely not subject to the same concurrent creation scenario).
Conclusion:
You can safely add deduplication and transaction logic only for dailyChange inside _onConfirmOrder without impacting other components.

2. Patch for _onConfirmOrder
Add the following logic before saving to Firestore, and only for category === 'dailyChange' && !mProps.isEdit:

Use a Firestore transaction to check for existing docs for the same branch/date/type.
If found, merge and deduplicate items by a deterministic uniqueKey.
Otherwise, proceed as normal.