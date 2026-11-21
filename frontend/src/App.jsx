
import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const emptyForm = {
    name: "",
    category: "Electronics",
    price: "",
    stock: "",
    description: "",
    image: ""
  };

  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      alert("Unable to connect to backend. Please check your server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category))
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || p.category === category;

    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.stock),
    0
  );

  const lowStock = products.filter(
    (p) => Number(p.stock) < 10
  ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };

    try {
      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Operation failed");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
      image: product.image || ""
    });

    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Delete failed");

      await loadProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">a</span>
          <div>
            <h2>Amazon<span>DB</span></h2>
            <small>PRODUCT MANAGEMENT SYSTEM</small>
          </div>
        </div>

        <div className="topbar-right">
          <span className="status-dot"></span>
          <span>Database Connected</span>
          <div className="avatar">M</div>
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <div>
            <p className="eyebrow">INVENTORY OVERVIEW</p>
            <h1>Product Dashboard</h1>
            <p className="subtitle">
              Manage your products, monitor inventory and track your catalogue.
            </p>
          </div>

          <button className="add-btn" onClick={openAddForm}>
            + Add New Product
          </button>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon orange">▣</div>
            <p>Total Products</p>
            <h2>{products.length}</h2>
            <small>Products in catalogue</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">▤</div>
            <p>Categories</p>
            <h2>{categories.length - 1}</h2>
            <small>Product categories</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">₹</div>
            <p>Inventory Value</p>
            <h2>₹{totalValue.toLocaleString("en-IN")}</h2>
            <small>Based on available stock</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">!</div>
            <p>Low Stock</p>
            <h2>{lowStock}</h2>
            <small>Products below 10 units</small>
          </div>
        </section>

        <section className="products-section">
          <div className="section-heading">
            <div>
              <h2>Product Catalogue</h2>
              <p>View and manage your inventory</p>
            </div>
            <span className="product-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="empty">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Add your first product to get started.</p>
              <button className="add-btn" onClick={openAddForm}>
                + Add Product
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="product-info">
                          {p.image ? (
                            <img src={p.image} alt={p.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="product-placeholder">📦</div>
                          )}
                          <div>
                            <strong>{p.name}</strong>
                            <small>{p.description || "No description"}</small>
                          </div>
                        </div>
                      </td>

                      <td>{p.category}</td>
                      <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={
                          Number(p.stock) < 10
                            ? "stock low"
                            : "stock available"
                        }>
                          {Number(p.stock) < 10 ? "Low Stock" : "Available"}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="edit-btn"
                            onClick={() => handleEdit(p)}>Edit</button>
                          <button className="delete-btn"
                            onClick={() => handleDelete(p._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-heading">
                <div>
                  <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
                  <p>Enter the product information below.</p>
                </div>
                <button className="close-btn"
                  onClick={() => setShowForm(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <label>Product Name *</label>
                <input required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Enter product name"
                />

                <label>Category *</label>
                <select required
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Kitchen</option>
                  <option>Books</option>
                  <option>Beauty</option>
                  <option>Sports</option>
                  <option>Other</option>
                </select>

                <div className="form-row">
                  <div>
                    <label>Price (₹) *</label>
                    <input type="number" min="0" step="0.01" required
                      value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label>Stock Quantity *</label>
                    <input type="number" min="0" required
                      value={form.stock}
                      onChange={(e) => setForm({...form, stock: e.target.value})}
                      placeholder="Enter stock"
                    />
                  </div>
                </div>

                <label>Description</label>
                <textarea rows="3"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Describe your product"
                />

                <label>Product Image URL</label>
                <input type="url"
                  value={form.image}
                  onChange={(e) => setForm({...form, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />

                <div className="form-actions">
                  <button type="button" className="cancel-btn"
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="add-btn">
                    {editingId ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer>
        Amazon Product Database Management System · Built with React, Node.js & MongoDB Atlas
      </footer>
    </div>
  );
}

export default App;
