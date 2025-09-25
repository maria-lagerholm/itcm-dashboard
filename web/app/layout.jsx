// metadata: Sets the page title for the dashboard. If debugging, check that the browser tab shows "Item Dashboard".
export const metadata = { title: "Item Dashboard" };
import Nav from "./components/Nav";

// RootLayout: Main layout wrapper for the app.
// If debugging, verify that Nav renders at the top and children are displayed with correct padding.
// Also check that the <html lang="en"> and <body> tags are present in the rendered HTML.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {/* Main content area. If debugging, ensure children components appear here and padding is applied. */}
        <div style={{ padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}