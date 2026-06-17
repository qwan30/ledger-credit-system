# Initial Requirement Brief

This file preserves the original idea brief that seeded the canonical documentation set on 2026-03-15.

Status:

- source brief only
- not the canonical requirements document
- retained for traceability and later comparison

Original brief:

IDEA 3: CORE BANKING LEDGER & SMART CREDIT SCORING
(Hệ thống Lõi ngân hàng & Chấm điểm tín dụng thông minh)
Mục tiêu: Xây dựng hệ thống tài chính với độ chính xác tuyệt đối (Zero Error) và đánh giá rủi ro khách hàng tự động.
1. Bài toán (Business Pain Point)
•	Sai lệch tiền: Hệ thống cũ dùng UPDATE số dư dễ gây sai sót, khó truy vết dòng tiền.
•	Nợ xấu: Duyệt vay thủ công dựa trên cảm tính, dẫn đến rủi ro cao.
2. Tính năng Chính (Functional Requirements)
•	Double-Entry Ledger (Sổ cái kép): Mọi giao dịch chuyển tiền phải ghi 2 bút toán (Debit tài khoản A, Credit tài khoản B). Không bao giờ sửa/xóa dữ liệu cũ.
•	Transactional Transfer: Chuyển tiền nội bộ và liên ngân hàng. Đảm bảo tính ACID (Atomicity - Thành công thì cùng thành công, lỗi thì rollback toàn bộ).
•	Credit Scoring: Tự động chấm điểm uy tín khách hàng (Score 300-850) dựa trên: Lịch sử thanh toán, số dư trung bình, tần suất giao dịch.
•	End-of-Day Batch: Tự động chốt sổ, tính lãi suất qua đêm cho hàng triệu tài khoản vào 12h đêm.
3. Chiều sâu Kỹ thuật (Technical Highlights)
•	Data Integrity: Thiết kế Database chuẩn 3NF, sử dụng Foreign Key và Constraint chặt chẽ.
•	Batch Processing (Spring Batch): Xử lý hàng loạt giao dịch lớn (Bulk processing) hiệu quả, có cơ chế Retry khi lỗi mạng.
•	Security & Audit Log: Ghi log mọi thao tác nhạy cảm (Ai xem số dư, ai duyệt vay). Mã hóa dữ liệu nhạy cảm (Encryption).
•	Unit Testing: Coverage cực cao (>80%) cho các logic tính toán tiền tệ.
4. Tech Stack & Tools
•	Backend: Java 21, Spring Boot, Spring Batch, Spring Data JPA.
•	Database: PostgreSQL (Highly reliable for financial data).
•	Testing: JUnit 5, Mockito.
•	Rule Engine: Drools hoặc code logic thuần (Java) để chấm điểm tín dụng.
5. Số liệu đo lường (Metrics for CV)
•	Xử lý Job tính lãi cuối ngày cho 100.000 tài khoản trong dưới 5 phút.
•	Độ chính xác giao dịch 100% (kiểm chứng qua Unit Test và Integration Test).
