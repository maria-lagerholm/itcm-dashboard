export const metadata = { title: "Item Dashboard" };
import Nav from "./components/Nav";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <div style={{ padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
