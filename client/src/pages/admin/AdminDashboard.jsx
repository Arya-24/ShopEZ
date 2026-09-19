import { Link } from "react-router-dom";

const sections = [
  { to: "/admin/products", title: "Products", description: "View, edit, and delete products" },
  { to: "/admin/products/new", title: "Add product", description: "Create a new product with variants" },
  { to: "/admin/orders", title: "Orders", description: "View all orders and update their status" },
  { to: "/admin/settings", title: "Settings", description: "Manage the homepage banner and categories" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-ink)" }}>
        Admin dashboard
      </h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="border border-[var(--color-line)] rounded-lg p-5 bg-white hover:border-[var(--color-clay)] transition-colors"
          >
            <h2 className="font-medium mb-1" style={{ color: "var(--color-ink)" }}>
              {section.title}
            </h2>
            <p className="text-sm text-neutral-500">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}