# Implementation Plan - Current Month Orders and Revenue on Admin Dashboard

Make the Admin Panel Dashboard display real, dynamic current-month Orders count and Revenue, automatically updating as the month changes, backed by an Admin-protected API and database aggregation.

## User Review Required

> [!IMPORTANT]
> - **Qualifying Orders Logic**: In alignment with the existing project logic in [`admin-panel/src/App.jsx`](file:///c:/Users/SHARMISTHA%20DAS/OneDrive/Desktop/grocery_app/admin-panel/src/App.jsx#L1140-L1146), orders with `order_status != 'cancelled'` are treated as qualifying orders for revenue and count calculations.
> - **API Endpoints**: To support both the prompt's suggested path (`/api/admin/dashboard/stats`) and the project's existing order-admin naming convention (`/api/orders/admin/...`), both endpoints will be supported on the backend.

## Proposed Changes

---

### Backend API

#### [MODIFY] [orders.js](file:///c:/Users/SHARMISTHA%20DAS/OneDrive/Desktop/grocery_app/backend/routes/orders.js)
- Export or add `getDashboardStats` handler:
  - Validates Admin token using `authenticateToken` and `authorizeRoles('admin')`.
  - Determines current month boundaries dynamically (`startOfMonth`: `YYYY-MM-01 00:00:00`, `endOfMonth`: `YYYY-MM-LAST_DAY 23:59:59`) based on server time (or optional query params `year` and `month` for testing).
  - Queries `orders` table directly:
    ```sql
    SELECT
      COUNT(CASE WHEN order_status != 'cancelled' THEN 1 END) AS orders,
      COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS revenue
    FROM orders
    WHERE created_at >= ? AND created_at <= ?
    ```
  - Computes human-readable month label dynamically (e.g., `"September 2026"`).
  - Returns JSON:
    ```json
    {
      "success": true,
      "month": "September 2026",
      "orders": 2,
      "revenue": 72.46
    }
    ```
  - Mounts route at `/admin/dashboard/stats` (accessible as `/api/orders/admin/dashboard/stats`).

#### [MODIFY] [server.js](file:///c:/Users/SHARMISTHA%20DAS/OneDrive/Desktop/grocery_app/backend/server.js)
- Register route `/api/admin/dashboard/stats` using the secure admin dashboard stats handler so that requests to both `/api/admin/dashboard/stats` and `/api/orders/admin/dashboard/stats` succeed identically.

---

### Admin Panel Frontend

#### [MODIFY] [App.jsx](file:///c:/Users/SHARMISTHA%20DAS/OneDrive/Desktop/grocery_app/admin-panel/src/App.jsx)
- Add state for dashboard stats: `dashboardStatsData`, `dashboardLoading`, `dashboardError`.
- Add `loadDashboardStats` function:
  - Fetches from `${API_URL}/admin/dashboard/stats` (or `${API_URL}/orders/admin/dashboard/stats`) with Admin bearer token.
  - Safely parses `month`, `orders`, and `revenue`.
- Trigger `loadDashboardStats`:
  - When `activeTab === 'dashboard'`.
  - Inside the existing `useEffect` tab loader and refresh handlers.
- Update `dashboardStats` array:
  - **This Month's Revenue**:
    - Value: `₹` followed by formatted revenue (e.g. `₹48,750` or `₹0` if 0, using standard Indian currency format). Never `null`, `undefined`, or `NaN`.
    - Change/Subtitle: Displays current month label (e.g. `"September 2026"`).
  - **This Month's Orders**:
    - Value: `dashboardStatsData.orders` (or `0` if empty).
    - Change/Subtitle: Displays current month label (e.g. `"September 2026 Orders"`).
  - Preserve "Total Products" and "Total Categories" cards intact.
- Add current month badge/label to the Dashboard header section above the stats grid so it is immediately obvious which month is displayed.

---

## Verification Plan

### Automated / Backend Tests
- **TEST 1 & 2 (Current Month Data)**:
  - Query `/api/admin/dashboard/stats` with Admin JWT. Verify it matches the 2 September orders in DB (`orders: 2, revenue: 72.46`).
- **TEST 3 & 4 (Previous and Next Month Boundaries)**:
  - Insert a temporary order dated August 2026 and one dated October 2026 in test queries. Verify they are excluded from September 2026 stats.
- **TEST 5 (Month Transition / Dynamic Calculation)**:
  - Query stats for a different month (e.g. October 2026) using query parameters or date mocking. Verify dynamic month calculation.
- **TEST 6 (Empty Month)**:
  - Test a month with no orders (e.g. October 2026). Verify response: `orders: 0`, `revenue: 0`, and UI shows `This Month's Orders: 0` and `This Month's Revenue: ₹0`.
- **TEST 8 (Admin Authentication & Authorization)**:
  - Send request without token -> 401 Unauthorized.
  - Send request with customer or delivery token -> 403 Forbidden.
  - Send request with admin token -> 200 OK.

### Frontend Verification
- Open Admin Panel in browser or run Vite build test.
- Verify Admin Dashboard shows "This Month's Revenue" and "This Month's Orders" with "September 2026" label.
- Verify existing tabs (Products, Categories, Orders, Delivery Partners) are completely intact.
