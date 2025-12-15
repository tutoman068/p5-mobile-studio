# p5 Mobile Studio

## 🚨 Khắc phục lỗi "The name contains invalid characters" trên Vercel

Lỗi này xuất hiện khi bạn đặt tên **Biến môi trường (Environment Variable)** sai quy tắc.

### ✅ Cài đặt ĐÚNG (Environment Variables)
Vào **Settings** > **Environment Variables** trên Vercel và đặt như sau:
*   **Key (Name):** `API_KEY`
    *   Chỉ dùng chữ hoa và dấu gạch dưới `_`.
    *   KHÔNG dùng dấu gạch ngang `-`.
*   **Value:** Dán khóa API của bạn vào (bắt đầu bằng `AIza...`).

### ❌ Cài đặt SAI (Sẽ gây lỗi)
*   `API-KEY` (Lỗi do có dấu gạch ngang `-`)
*   `GEMINI-KEY` (Lỗi do có dấu gạch ngang `-`)
*   `Gemini Key` (Lỗi do có khoảng trắng)

## Cài đặt Local
Tạo file `.env` ở thư mục gốc:
```
API_KEY=your_api_key_here
```
