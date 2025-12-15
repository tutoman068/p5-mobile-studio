# p5 Mobile Studio

## 🚨 Troubleshooting Vercel Deployment

Nếu bạn vẫn gặp lỗi: *"The name contains invalid characters..."*

### Bước 1: Kiểm tra lại Biến môi trường (Environment Variables)
1.  Vào **Settings > Environment Variables**.
2.  Xóa biến `API_KEY` hiện tại (bấm icon thùng rác).
3.  Thêm lại từ đầu:
    *   **Key:** `API_KEY` (Gõ tay, KHÔNG copy paste để tránh dính khoảng trắng ẩn).
    *   **Value:** `AIza...` (Key của bạn).
4.  Bấm **Save**.

### Bước 2: Tạo lại Project (Giải pháp triệt để nhất)
Nếu dự án bị kẹt lỗi tên từ lần deploy đầu tiên:
1.  Vào Dashboard Vercel, xóa dự án hiện tại (`Delete Project`).
2.  Bấm **Add New > Project**.
3.  Chọn repo `p5-mobile-studio`.
4.  Ở mục **Project Name**, sửa ngay thành: `p5mobilestudio` (viết liền, không dấu).
5.  Thêm Environment Variable `API_KEY`.
6.  Bấm **Deploy**.

## Cài đặt Local
1. Clone repo.
2. `npm install`
3. Tạo file `.env`: `API_KEY=your_key`
4. `npm run dev`
