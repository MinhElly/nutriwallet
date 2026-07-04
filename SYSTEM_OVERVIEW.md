# SYSTEM_OVERVIEW - NutriWallet

> Tài liệu được lập từ mã nguồn hiện có. Không chứa secret/token/API key. Nội dung chưa đủ bằng chứng được đánh dấu **cần kiểm tra thêm**.

## 1. Tổng quan dự án

NutriWallet theo dõi dinh dưỡng và chi tiêu ăn uống. Người dùng có thể đăng nhập xã hội, tải ảnh món ăn để AI ước lượng dinh dưỡng/giá, chỉnh sửa rồi lưu bữa ăn và khoản chi, quản lý ngân sách, chat AI và liên kết Messenger.

- Backend: Java 21, Spring Boot, MVC, Security/JWT, JPA/MySQL, Flyway, RabbitMQ, Cloudinary, Gemini/OpenAI (`nutriwallet_backend/pom.xml`, `nutriwallet_backend/src/main/resources/application.yml`).
- Frontend: React 19, Vite, React Router, Axios, Tailwind, Recharts (`nutriwallet_frontend/package.json`).
- Hạ tầng container: `docker-compose.yml` và Dockerfile của hai ứng dụng.
- Package backend vẫn là `com.nutricash.api`, trong khi tên UI là NutriWallet (`NutriCashApplication.java`).

## 2. Kiến trúc hệ thống

```text
React/Vite hoặc Facebook Messenger
              |
Spring MVC Controller -> Service -> Repository/JPA -> MySQL
              |                         +-> Flyway
              +-> Cloudinary (ảnh)
              +-> RabbitMQ -> AI worker -> Gemini/OpenAI -> cache/log
              +-> Facebook Graph API
```

Backend chia theo module nghiệp vụ với controller/service/repository/entity/dto/mapper. Frontend chia page/component/hook/service; Axios interceptor gắn Bearer token và xử lý 401 (`common/dto/ApiResponse.java`, `frontend/src/services/api.js`).

## 3. Cấu trúc thư mục backend

| Đường dẫn dưới `nutriwallet_backend/` | Vai trò |
|---|---|
| `src/main/java/com/nutricash/api/NutriCashApplication.java` | Điểm khởi động |
| `admin/`, `ai/` | Quản trị; provider/queue/cache/log/chat AI |
| `auth/`, `security/` | Social auth, JWT, revoked token |
| `meal/`, `expense/`, `budget/` | Nghiệp vụ lõi |
| `messenger/` | Webhook, liên kết, hội thoại |
| `dashboard/`, `setting/`, `user/` | Tổng hợp, cấu hình, hồ sơ |
| `storage/` | Cloudinary |
| `common/`, `config/` | DTO/enum/exception/util và cấu hình Spring |
| `src/main/resources/db/migration/` | Flyway V2-V13; không thấy V1, baseline=1 |
| `src/test/` | Test admin, social auth, data deletion, chatbot rules |

## 4. Cấu trúc thư mục frontend

| Đường dẫn dưới `nutriwallet_frontend/src/` | Vai trò |
|---|---|
| `main.jsx`, `App.jsx` | Bootstrap/provider/router |
| `routes/` | Route và guard user/admin |
| `pages/`, `components/` | Màn hình và UI theo feature |
| `services/` | API adapter/mapping |
| `hooks/`, `context/` | State/auth/theme |
| `data/` | Constant và mock/fallback còn tồn tại |
| `config/env.js` | Cấu hình môi trường |
| `lib/axios.js` | Axios phụ; service chính dùng `services/api.js`, cần kiểm tra thêm |

## 5. Danh sách module backend

- Auth/Security: `auth/controller/AuthController.java`, `AuthService.java`, `security/JwtAuthenticationFilter.java`.
- User: hồ sơ và CRUD admin tại `user/controller/UserController.java`.
- Meal/Expense/Budget: `MealService.java`, `ExpenseService.java`, `BudgetService.java`, `BudgetAlertService.java`.
- Dashboard: `dashboard/service/DashboardService.java`.
- AI: `AiAnalysisService.java`, `AiAnalysisWorker.java`, `AiQueueConfig.java`, console/report/recommendation controllers.
- Web chat: `ChatController.java`, `ChatService.java`.
- Messenger: `MessengerWebhookService.java`, `MessengerAccountService.java`.
- Settings/Storage/Admin: các package tương ứng.
- Mail có hạ tầng nhưng auth hiện không gọi: `mail/service/MailService.java`.
- Nutrition chỉ là skeleton, chưa có API thật: `nutrition/`.

## 6. Page/component frontend

| Route | Page | Quyền |
|---|---|---|
| `/` | `components/LandingPage/LandingPage.jsx` | Public |
| `/login`, `/register` | LoginPage, RegisterPage | Public-only |
| `/forgot-password`, `/reset-password` | Redirect login dù page/form tồn tại | Public-only |
| `/dashboard`, `/onboarding` | Dashboard, Onboarding | User |
| `/meal-history`, `/scan-meal` | Meal history, Scan meal | User |
| `/budget`, `/expense-history` | Budget, Expense history | User |
| `/profile`, `/settings` | Profile, Settings | User |
| `/admin/dashboard` | AdminDashboardPage | ADMIN |

Nguồn route: `frontend/src/routes/router.jsx`. Component được nhóm tại `components/auth`, `dashboard`, `scanMeal`, `admin`, `LandingPage`, `layout`, `common`, `meal`.

## 7. Entity/table

| Entity | Table | Vai trò |
|---|---|---|
| User | `users` | Chủ sở hữu dữ liệu, role/status/session hash |
| MealRecord | `meal_records` | Bữa ăn, macro, ảnh, cờ AI/xác nhận |
| ExpenseRecord | `expense_records` | Chi tiêu, có thể tham chiếu meal |
| Budget / BudgetAlert | `budgets` / `budget_alerts` | Ngân sách/cảnh báo |
| AiAnalysisLog | `ai_analysis_logs` | Input, status, output, retry/error |
| NutritionAnalysisCache | `nutrition_analysis_cache` | Cache theo SHA-256 key |
| AiRecommendation / AiErrorReport | `ai_recommendations` / `ai_error_reports` | Khuyến nghị/báo lỗi |
| ChatbotProfile | `chatbot_profiles` | PSID, guest code, user liên kết |
| ChatbotMessage | `chatbot_messages` | Lịch sử Messenger |
| ChatbotPendingAction | `chatbot_pending_actions` | Thao tác chờ xác nhận |
| UserSetting / SystemSetting | `user_settings` / `system_settings` | Thiết lập |
| EmailVerificationToken | `email_verification_tokens` | Chưa nối vào auth controller |
| RevokedToken | `revoked_tokens` | Token thu hồi |
| AdminAuditLog | `admin_audit_logs` | Audit quản trị |

Nguồn: `backend/src/main/java/com/nutricash/api/**/entity/`. `MealImage`, `NutritionResult`, `MessengerAccount` không có `@Entity`, không phải table JPA.

## 8. Danh sách API endpoint

Khi `app.security.enabled=true`, endpoint cần auth trừ danh sách public trong `config/SecurityConfig.java`.

| Nhóm | Endpoint |
|---|---|
| Auth | POST `/api/auth/google`, POST `/facebook`, POST `/logout`, GET `/me` |
| Facebook deletion | POST `/api/auth/facebook/data-deletion`, GET `.../status/{confirmationCode}` |
| User | GET/PATCH `/api/users/me`; POST/GET `/api/users`; GET/PATCH/DELETE `/api/users/{id}` (admin CRUD là ADMIN) |
| Meal | POST/GET `/api/meals`; GET/PATCH/DELETE `/api/meals/{id}` |
| Expense | POST/GET `/api/expenses`; PATCH/DELETE `/api/expenses/{id}` |
| Budget | POST `/api/budgets`; GET `/current`; PATCH `/{id}` |
| Dashboard | GET `/api/dashboard/today`, GET `/month` |
| Storage | POST/DELETE `/api/storage/images` |
| AI | POST `/api/ai/analyze-meal`; GET `/analyses/{id}`; GET `/logs/errors` (ADMIN) |
| Chat/recommendation | POST `/api/chat`; GET `/api/ai/recommendations` |
| AI report | POST/GET `/api/ai/error-reports` (GET ADMIN); PATCH `/{id}/status` (ADMIN) |
| AI console | GET `/api/ai/console/stats|performance|logs`; PATCH `/logs/{id}/evaluation`; POST `/retrain` (ADMIN) |
| Settings | GET/PATCH `/api/settings/user`; GET `/system`; PATCH `/system/{key}` (PATCH ADMIN) |
| Messenger | GET/POST `/api/messenger/webhook` (public); POST `/accounts/link`; DELETE `/accounts/unlink` |
| Admin | GET `/api/admin/dashboard/overview|activities`; GET `/api/admin/users[/{id}]`; PATCH `/{id}/status` |

Nguồn: annotation trong `backend/src/main/java/com/nutricash/api/**/controller/*Controller.java`.

**Lệch contract:** frontend gọi POST `/api/auth/login` và `/api/auth/register` (`frontend/src/services/auth.service.js`) nhưng backend không khai báo. DTO `LoginRequest`/`RegisterRequest` tồn tại nhưng không được dùng.

## 9. Mapping frontend-backend

| Frontend | Service | Backend |
|---|---|---|
| Auth/context | `auth.service.js` | `/api/auth/*`, `/api/users/me`; local auth đang lệch |
| Dashboard | `dashboard.service.js` | `/api/dashboard/*`, `/api/ai/recommendations` |
| Scan meal | `scanMeal.service.js`, `storage.service.js` | upload -> analyze/poll -> meals -> expenses |
| Meal/expense/budget | Các service cùng tên | `/api/meals`, `/api/expenses`, `/api/budgets` |
| Profile/Messenger | `user.service.js`, `profile.service.js` | `/api/users/me`, `/api/messenger/accounts/*` |
| Settings/onboarding | `settings.service.js`, `onboarding.service.js` | `/api/settings/user`, `/api/users/me` |
| Admin | `user.service.js`, `dashboard.service.js`, `aiLog.service.js` | `/api/admin/*`, `/api/ai/console/*` |
| Web chat | `chat.service.js` | POST `/api/chat` |

## 10. Luồng đăng nhập/đăng ký

1. Form gọi `AuthContext.jsx`, rồi `auth.service.js`.
2. Google/Facebook token đến endpoint social; `SocialAuthService.java` xác minh, `AuthService.java` tìm/tạo User, chặn BLOCKED, phát JWT và lưu `sessionTokenHash`.
3. Backend vừa trả token vừa set cookie; frontend lưu token/user vào localStorage và Axios gắn Bearer.
4. Reload gọi `/api/auth/me` rồi fallback `/api/users/me`; 401 xóa session và redirect.
5. Logout revoke token, xóa session hash, expire cookie.

Email-password hiện chưa hoàn chỉnh: có UI/DTO/password encoder/mail/token entity nhưng thiếu endpoint/service method. **Cần kiểm tra thêm** ý định social-only hay local auth.

## 11. Luồng liên kết Messenger

Webhook tìm/tạo `ChatbotProfile` theo PSID và sinh mã `NW-xxxxxx` (`MessengerWebhookService.java`). Người dùng nhập code ở Profile; `useProfileData.js` -> `user.service.js` -> POST link. `MessengerAccountService.java` gắn User, xóa code và ghi `linkedAt`. Unlink gửi thông báo, bỏ user và sinh code mới.

Không thấy TTL, rate limit, transaction lock hay crypto-random cho code; cần tăng bảo vệ chống brute force/chiếm liên kết.

## 12. Luồng Messenger chatbot

1. GET webhook xác minh; POST chuyển payload đến `MessengerWebhookService.processWebhookRequest`.
2. Service lấy PSID, dedup MID bằng map in-memory 1.000 phần tử và lưu inbound.
3. Rule xử lý code/capability/confirm/update; trường hợp khác gọi AI với 12 message gần nhất.
4. Ảnh được phân loại MEAL/RECEIPT/TRANSFER/UNSUPPORTED. MEAL có thể tạo meal chưa xác nhận cho account đã liên kết. Receipt/transfer mới trả dữ liệu để xác nhận; persist cần kiểm tra thêm.
5. Reply gọi Graph API và lưu outbound (`MessengerReplyService.java` hoặc logic riêng trong webhook service).

Chưa thấy kiểm tra chữ ký `X-Hub-Signature-256`; dedup mất khi restart/multi-instance.

## 13. Luồng web chat

`frontend/src/services/chat.service.js` gọi POST `/api/chat`. `ChatService.java` yêu cầu authenticated user, gọi provider với prompt chat và trả text/model. Web chat không đọc meal/expense, không lưu lịch sử, không streaming. Không thấy page route chat riêng; **cần kiểm tra thêm** component sử dụng service.

## 14. Luồng AI phân tích ảnh món ăn

1. `UploadCard.jsx` gọi `analyzeMealImage`; ảnh upload Cloudinary.
2. Frontend POST URL đến `/api/ai/analyze-meal`.
3. `AiAnalysisService.java` validate, chuẩn hóa URL, tạo SHA-256 cache key và log PENDING.
4. Cache còn hạn trả ngay; miss publish job sau commit qua RabbitMQ.
5. `AiAnalysisWorker.java` gọi provider, parse JSON, kiểm tra số không âm, lưu output/cache; retry/DLQ ở `AiQueueConfig.java`.
6. Frontend poll status mỗi 1,5 giây, tối đa 25 giây.

## 15. Luồng lưu MealRecord/ExpenseRecord

Web scan dùng hai request trong `frontend/src/services/scanMeal.service.js`: tạo meal với `aiEstimated=true`, `confirmedByUser=true`, sau đó tạo expense tham chiếu meal. `ExpenseService.java` kiểm tra ownership và tính lại budget alert. Nếu expense lỗi, frontend chỉ log và vẫn coi meal thành công; không có transaction xuyên hai request nên có thể có meal không expense.

Messenger ghi trực tiếp repository trong transaction webhook; logic category/ghi chú bị lặp với web.

## 16. Luồng xác nhận/chỉnh sửa kết quả AI

- Web: `AnalysisResultCard.jsx` sửa state; `ScanMealPage.jsx` chỉ persist khi bấm lưu. Không có endpoint confirm riêng.
- Messenger: meal ảnh ban đầu `confirmedByUser=false`; pending action/rule parse xác nhận/cập nhật trong `MessengerWebhookService.java`.
- `ConfirmMealRequest.java` rỗng và không dùng. Không có quan hệ trực tiếp AiAnalysisLog -> MealRecord, làm audit khó.

## 17. Phân tích bảo mật

Điểm tốt: JWT kiểm tra chữ ký/expiry/revoked/session hash; meal/expense kiểm tra ownership; admin dùng `@PreAuthorize`; CORS allow-list; Bean Validation.

Rủi ro:

- Cookie dùng `secure(false)`, CSRF tắt dù cookie được chấp nhận (`AuthController.java`, `SecurityConfig.java`).
- Token đồng thời ở HttpOnly cookie và localStorage, làm tăng tác động XSS.
- Webhook Messenger public nhưng chưa xác thực chữ ký.
- Link code không TTL/rate-limit/crypto-random.
- Default dev config vẫn tồn tại; production nên fail-fast khi thiếu secret (không liệt kê giá trị tại đây).
- GET system settings chỉ cần authenticated; cần kiểm tra response có lộ cấu hình nội bộ không.
- AI nhận URL ngoài; nên giới hạn scheme/host để giảm SSRF/privacy risk.
- Cần kiểm tra MIME thực/magic bytes và quyền xóa trong `CloudinaryStorageService.java`.

## 18. Error handling/logging

`GlobalExceptionHandler.java` chuẩn hóa AppException/validation/unexpected error thành `ErrorResponse`; lỗi bất ngờ không trả stack trace. `ErrorCode.java` map HTTP khá rõ, nhưng `IllegalArgumentException` khi logout thiếu token có thể thành 500. AI worker có retry/DLQ và lưu error report. Frontend gom message/401 tại `services/api.js`, nhưng một số page vẫn dùng alert/console.error.

Chưa thấy correlation ID, structured logging, tracing/metrics. Webhook log raw AI response có thể chứa PII. Nhiều chuỗi Việt trong source bị mojibake; cần chuẩn hóa UTF-8.

## 19. File quan trọng nên đọc đầu tiên

1. `README.md`, `docker-compose.yml`.
2. `backend/src/main/resources/application.yml`.
3. `config/SecurityConfig.java`, `security/JwtAuthenticationFilter.java`.
4. `auth/controller/AuthController.java`, `auth/service/AuthService.java`.
5. `ai/service/AiAnalysisService.java`, `ai/config/AiQueueConfig.java`.
6. `messenger/service/MessengerWebhookService.java`.
7. `meal/service/MealService.java`, `expense/service/ExpenseService.java`.
8. `frontend/src/routes/router.jsx`, `context/AuthContext.jsx`, `services/api.js`.
9. `frontend/src/services/scanMeal.service.js`, `pages/scanMeal/ScanMealPage.jsx`.
10. `backend/src/main/resources/db/migration/`.

## 20. Code nghi ngờ thừa/duplicate

Chỉ nên xóa sau khi kiểm tra import, build và test:

- Skeleton: `MealImage*`, toàn bộ `nutrition/`, `MessengerAccount*`.
- Auth local dang dở: `LoginRequest`, `RegisterRequest`, `LinkGuestRequest`, `EmailVerificationToken*`, `MailService`.
- `ConfirmMealRequest.java` rỗng.
- Forgot/reset page/form tồn tại nhưng router redirect.
- Mock cũ: `data/scanMealData.js`, `mockBudgetDta.js`, `mockMealHistoryData.js`, `services/mock-utils.js`.
- Artifact nghi ngờ: `frontend/diff.txt`, `diff_utf8.txt`; asset scaffold React/Vite.
- Gửi/lưu Messenger outbound lặp giữa `MessengerReplyService` và `MessengerWebhookService`.
- Sinh guest code lặp ở hai service Messenger.
- Logic lưu meal/expense/category lặp giữa web scan và Messenger.
- `/api/auth/me` và `/api/users/me` gần trùng; frontend gọi fallback cả hai.
- `src/lib/axios.js` và `src/services/api.js` có thể là hai Axios setup.
- Dashboard còn trộn API với constant/mock trong `data/dashboardData.js`.

## 21. Đề xuất tối ưu hệ thống

1. Chốt social-only hay local auth; triển khai đầy đủ hoặc xóa contract/UI thừa.
2. Chọn một mô hình token: HttpOnly Secure cookie + CSRF hoặc Bearer in-memory.
3. Xác thực chữ ký Messenger; DB idempotency cho MID; TTL/rate-limit/crypto-random cho link code.
4. Tạo backend command transaction để xác nhận analysis và lưu meal + expense đồng thời.
5. Thêm quan hệ audit AiAnalysisLog -> MealRecord -> ExpenseRecord.
6. Tách `MessengerWebhookService` thành dispatcher, conversation, image/pending-action và Graph client.
7. Dùng domain service chung thay vì Messenger ghi repository trực tiếp.
8. Chuẩn hóa UTF-8 và thêm lint/check encoding.
9. Dùng Flyway làm nguồn schema duy nhất; production `ddl-auto=validate`; bổ sung tài liệu/V1 baseline.
10. Thêm integration/contract test cho auth, ownership, scan-poll-save, Messenger và rollback.
11. Thêm correlation ID, structured log, metrics queue/provider/cache; redaction PII.
12. Chuẩn hóa frontend error/loading/toast/Error Boundary và cancellation polling.
13. Dùng backoff hoặc SSE/WebSocket khi tải tăng.
14. Xóa skeleton/mock/artifact chỉ sau build/test.
15. Rà version dependency và CI; các version khai báo rất mới nên **cần kiểm tra thêm** tương thích môi trường deploy.

---

Phạm vi: source Java/JSX/JS, cấu hình và migration có trong repository tại thời điểm rà soát; không suy diễn dữ liệu production hay secret ngoài repository.

