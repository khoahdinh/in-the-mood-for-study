// main.js ← Khởi động Electron, tạo cửa sổ app - Như hàm main() trong C
// package.json ← "hồ sơ" của app, khai báo thư viện dùng
// package-lock.json ← là file npm tự tạo thêm — nó ghi lại chính xác version các thư viện đã cài

const { app, BrowserWindow } = require("electron");

// app = quản lý vòng đời của ứng dụng (khởi động, tắt, restart...)
// BrowserWindow = bản thiết kế để tạo ra cửa sổ (như class trong C++)
// Dùng const ở đây vì app và BrowserWindow mình chỉ cần lấy ra dùng, không bao giờ gán lại giá trị khác.
// require("electron"); tải module electron mà mình đã cài bằng npm install electron -- save-dev

app.setName("In The Mood For Study");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "In The Mood For Study",
  });
  //   tạo 1 cửa sổ thật từ bản thiết kế, kích thước 1200x800px

  win.loadFile("index.html");
  //   nhét file index.html vào cửa sổ đó, giống Chrome load trang web
}

app.whenReady().then(() => {
  createWindow();
  // () => { } gọi là arrow function — một hàm không tên, viết gọn để truyền thẳng vào chỗ khác.
});

app.on("window-all-closed", () => {
  app.quit();
});
