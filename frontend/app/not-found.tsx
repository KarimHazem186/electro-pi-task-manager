import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          font: "15px/1.5 system-ui, -apple-system, sans-serif",
          background: "#fafafa",
          color: "#111",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
          <p style={{ color: "#4b5563", margin: "0.5rem 0 1.5rem" }}>
            The page you are looking for does not exist. / الصفحة التي تبحث عنها غير موجودة.
          </p>
          <Link
            href="/en"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              marginRight: "0.5rem",
            }}
          >
            Go home
          </Link>
          <Link
            href="/ar"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#111",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </body>
    </html>
  );
}
