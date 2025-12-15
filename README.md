# p5 Mobile Studio

## 🚨 Khắc phục lỗi "The name contains invalid characters"

Lỗi này xuất hiện do quy tắc đặt tên của Vercel (Project Name hoặc Env Var).

### 1. Kiểm tra Project Name (Tên dự án)
Khi bạn bấm **Import** trên Vercel:
*   Vercel sẽ tự động điền tên là `p5-mobile-studio` (theo tên GitHub).
*   **HÃY SỬA LẠI THÀNH:** `p5mobilestudio` hoặc `p5_mobile_studio`.
*   *(Lý do: Một số tổ chức/team trên Vercel không cho phép dấu gạch ngang `-` trong tên dự án)*.

### 2. Kiểm tra Environment Variables (Biến môi trường)
Vào **Settings** > **Environment Variables**:
*   **Key:** `API_KEY` (Bắt buộc dùng gạch dưới `_`, KHÔNG dùng gạch ngang `-`).
*   **Value:** `AIza...`

## Cài đặt Local
1. Clone repo.
2. `npm install`
3. Tạo file `.env`: `API_KEY=your_key`
4. `npm run dev`
