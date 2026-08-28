import { useState, useEffect, useRef } from "react";import "./App.css";

const API_URL = "https://ghostlab.onrender.com";

function App() {
  // =========================
  // STATE
  // =========================

  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [message, setMessage] = useState("");

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");

    return savedCart ? JSON.parse(savedCart) : [];
  });



  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || ""
  );

  // =========================
  // ÜRÜNLER VE KATEGORİLER
  // =========================

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ürünler alınamadı.");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data.content);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    fetch(`${API_URL}/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kategoriler alınamadı.");
        }

        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Kategori hatası:", err);
      });
  }, []);

  // =========================
  // SEPETİ LOCALSTORAGE'A KAYDET
  // =========================

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // =========================
  // KATEGORİ FİLTRESİ
  // =========================

  const filteredProducts =
    selectedCategory === null
      ? []
      : products.filter(
          (product) => product.category?.id === selectedCategory
        );

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Email veya şifre hatalı.");
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);

      setUserRole(data.role);
      setIsLoggedIn(true);
      setShowLogin(false);

      setLoginEmail("");
      setLoginPassword("");

      setMessage("Giriş başarılı!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: "USER",
        }),
      });

      if (!response.ok) {
        throw new Error("Kayıt oluşturulamadı.");
      }

      setShowRegister(false);
      setShowLogin(true);

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");

      setMessage("Kayıt başarılı! Şimdi giriş yapabilirsin.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    setIsLoggedIn(false);
    setUserRole("");
    setShowAdmin(false);
    setMessage("Çıkış yapıldı.");
  };

  // =========================
  // ADMIN SİPARİŞLERİ
  // =========================

  const loadAdminOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
      setMessage("Admin paneli için giriş yapmalısın.");
      return;
    }

    setAdminLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Siparişler alınamadı.");
      }

      const data = await response.json();

      setAllOrders(data);
      setShowAdmin(true);
    } catch (err) {
      console.error("Admin siparişleri yüklenemedi:", err);
      setMessage(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // =========================
  // KULLANICI SİPARİŞLERİ
  // =========================

  const loadOrders = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setShowLogin(true);
      setMessage("Siparişlerini görmek için giriş yapmalısın.");
      return;
    }

    setOrdersLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/orders/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Siparişler alınamadı.");
      }

      const data = await response.json();

      setOrders(data);
      setShowOrders(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // =========================
  // SEPETE EKLE
  // =========================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setMessage(`${product.name} sepete eklendi.`);
  };

  // =========================
  // SEPETTEN SİL
  // =========================

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((product) => product.id !== productId)
    );
  };

  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        if (item.quantity >= item.stock) {
          setMessage("Stok miktarından fazla ekleyemezsin.");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.error("Müzik başlatılamadı:", error);
      }
    }
  };

  // =========================
  // SEPET TOPLAMI
  // =========================

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // =========================
  // SİPARİŞ DURUMU DEĞİŞTİR
  // =========================

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/orders/${orderId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Sipariş durumu değiştirilemedi.");
      }

      if (status === "CONFIRMED") {
        setMessage(`Sipariş #${orderId} onaylandı.`);
      } else {
        setMessage(`Sipariş #${orderId} iptal edildi.`);
      }

      // Güncel siparişleri tekrar getir
      loadAdminOrders();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // =========================
  // RETURN
  // =========================

  return (
    <div className="app">

        <audio
          ref={audioRef}
          src="/music/ghostlab.mp3"
          loop
          preload="auto"
        />

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="navbar">

          <button
            className={`music-toggle ${isMusicPlaying ? "playing" : ""}`}
            onClick={toggleMusic}
          >
            <span className="music-icon">
              ♫
            </span>

            <span>
              {isMusicPlaying ? "ON AIR" : "MUSIC OFF"}
            </span>

            {isMusicPlaying && (
              <span className="sound-wave">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </span>
            )}
          </button>

        <div className="logo">
          GHOSTLAB
        </div>

        <nav>
          <a href="/">Ana Sayfa</a>
          <a href="#products">Ürünler</a>
          <a href="#services">Hizmetler</a>
          <a href="#production">Prodüksiyon</a>
        </nav>

        <div className="actions">

          {!isLoggedIn ? (
            <>
              <button onClick={() => setShowLogin(true)}>
                Giriş Yap
              </button>

              <button onClick={() => setShowRegister(true)}>
                Kayıt Ol
              </button>
            </>
          ) : (
            <>
              <button onClick={loadOrders}>
                Siparişlerim
              </button>

              {userRole === "ADMIN" && (
                <button onClick={loadAdminOrders}>
                  Admin Paneli
                </button>
              )}

              <button onClick={handleLogout}>
                Çıkış Yap
              </button>
            </>
          )}

          <button
            className="cart"
            onClick={() => setShowCart(true)}
          >
            🛒 Sepet ({cart.reduce((total, item) => total + item.quantity, 0)})
          </button>

        </div>

      </header>

      {/* =========================
          ADMIN PANELİ
      ========================= */}

      {showAdmin && userRole === "ADMIN" && (
        <div className="modal-overlay">

          <div className="modal orders-modal">

            <button
              className="close"
              onClick={() => setShowAdmin(false)}
            >
              ×
            </button>

            <h2>Admin Paneli</h2>

            {adminLoading ? (
              <p>Siparişler yükleniyor...</p>
            ) : allOrders.length === 0 ? (
              <p>Henüz sipariş yok.</p>
            ) : (
              <div className="orders-list">

                {allOrders.map((order) => (

                  <div
                    className="order-card"
                    key={order.id}
                  >

                    <div className="order-header">

                      <strong>
                        Sipariş #{order.id}
                      </strong>

                      <span>
                        {order.status}
                      </span>

                    </div>

                    <p>
                      <strong>Müşteri:</strong>{" "}
                      {order.user?.name || "Bilinmiyor"}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {order.user?.email || "Bilinmiyor"}
                    </p>

                    <div className="order-items">

                      {order.items?.map((item) => (

                        <div
                          className="order-item"
                          key={item.id}
                        >

                          <span>
                            {item.product?.name}
                          </span>

                          <span>
                            {item.quantity} × {item.price} TL
                          </span>

                        </div>

                      ))}

                    </div>

                    <div className="order-total">

                      Toplam:{" "}
                      {Number(order.totalPrice).toLocaleString(
                        "tr-TR"
                      )}{" "}
                      TL

                    </div>

                    {order.status === "PENDING" && (

                      <div className="admin-actions">

                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              "CONFIRMED"
                            )
                          }
                        >
                          ✓ Onayla
                        </button>

                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              "CANCELLED"
                            )
                          }
                        >
                          ✕ İptal Et
                        </button>

                      </div>

                    )}

                  </div>

                ))}

              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          MAIN
      ========================= */}

      <main>

        {/* HERO */}

        <section className="hero">

          <div>

            <p className="subtitle">
              GHOSTLAB STORE
            </p>

            <h1>
              Müziğini.
              <br />
              <span>Tarzını.</span>
              <br />
              GhostLab'i keşfet.
            </h1>

            <p className="description">
              Ekipmanını seç, profesyonel hizmetlerden yararlan
              ve müzik projelerini GhostLab ile bir üst seviyeye taşı.
            </p>

            <div className="hero-categories">

              <button
                onClick={() =>
                  document
                    .getElementById("products")
                    .scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span>🛍️</span>
                <strong>Ürünler</strong>
                <small>Ekipman & Aksesuar</small>
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("services")
                    .scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span>🎧</span>
                <strong>Hizmetler</strong>
                <small>DJ & Medya</small>
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("production")
                    .scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span>🎚️</span>
                <strong>Prodüksiyon</strong>
                <small>Mix & Albüm</small>
              </button>

            </div>

          </div>

        </section>









        {/* PRODUCTS */}

        <section
          className="products"
          id="products"
        >

          <div className="section-title">

            <div>
              <p className="section-label">
                GHOSTLAB STORE
              </p>

              <h2>
                DJ Shop
              </h2>
            </div>

            {!loading && (
              <span>
                {filteredProducts.length} ürün
              </span>
            )}

          </div>

          {/* CATEGORIES */}

                  <section
                    className="categories"
                    id="categories"
                  >

                    <div className="section-title">

                      <h2>
                        Kategoriler
                      </h2>

                    </div>

                    <div className="shop-categories">




                      {/* DİĞER KATEGORİLER */}

                      {categories.map((category) => {

                        const categoryIcons = {
                          "Teknoloji & Depolama": "💾",
                          "Giyim & Aksesuar": "👕",
                          "DJ Ekipmanları": "🎧",
                        };

                        return (
                          <button
                            key={category.id}
                            className={`shop-category-card ${
                              selectedCategory === category.id ? "active" : ""
                            }`}
                            onClick={() => {
                              setSelectedCategory(category.id);

                              setTimeout(() => {
                                document
                                  .getElementById("shop-products")
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                  });
                              }, 100);
                            }}
                          >

                            <span className="shop-category-icon">
                              {categoryIcons[category.name] || "🎛️"}
                            </span>

                            <strong>
                              {category.name}
                            </strong>

                            <small>
                              Ürünleri Gör
                            </small>

                          </button>
                        );
                      })}

                    </div>

                  </section>


          {loading && (
            <p>
              Ürünler yükleniyor...
            </p>
          )}

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {!loading && !error && selectedCategory !== null && (

            <div
              className="product-grid"
              id="shop-products"
            >

              {filteredProducts.length === 0 ? (

                <p>
                  Bu kategoride ürün bulunamadı.
                </p>

              ) : (

               filteredProducts.map((product) => (
                 <div
                   className="product-card"
                   key={product.id}
                 >
                   <div className="product-image">
                     <img
                       src={
                         product.name.toLowerCase().includes("usb bellek çanta")
                           ? "/products/03_USB_Bellek_Cantasi.png"
                           : product.name.toLowerCase().includes("usb bellek")
                           ? "/products/01_USB_Bellek.png"
                           : product.name.toLowerCase().includes("harddisk")
                           ? "/products/02_Tasinabilir_Harddisk.png"
                           : product.name.toLowerCase().includes("tişört")
                           ? "/products/04_Baskili_Tisort.png"
                           : product.name.toLowerCase().includes("sırt çanta")
                           ? "/products/05_Sirt_Cantasi.png"
                           : product.name.toLowerCase().includes("kolye")
                           ? "/products/06_Kolye.png"
                           : product.name.toLowerCase().includes("saat")
                           ? "/products/07_Saat.png"
                           : product.name.toLowerCase().includes("bileklik")
                           ? "/products/08_Bileklik.png"
                           : product.name.toLowerCase().includes("kulaklık")
                           ? "/products/09_Kulaklik.png"
                           : product.name.toLowerCase().includes("controller")
                           ? "/products/10_Controller.png"
                           : "/products/default.jpg"
                       }
                       alt={product.name}
                     />
                   </div>

                   <div className="product-info">

                     <p className="category-name">
                       {product.category?.name}
                     </p>

                     <h3>
                       {product.name}
                     </h3>

                     <p className="price">
                       {Number(product.price).toLocaleString("tr-TR")} TL
                     </p>

                     <p className="stock">
                       {product.stock > 0
                         ? `✓ Stokta (${product.stock} adet)`
                         : "✕ Stokta yok"}
                     </p>

                     <button
                       disabled={product.stock === 0}
                       onClick={() => addToCart(product)}
                     >
                       {product.stock > 0
                         ? "Sepete Ekle"
                         : "Stokta Yok"}
                     </button>

                   </div>
                 </div>
               ))

              )}

            </div>

          )}

        </section>

        {/* =========================
                    PRODUCTION
                ========================= */}

                <section
                  className="production"
                  id="production"
                >

                  <div className="section-title">

                    <h2>
                      Prodüksiyon
                    </h2>

                    <span>
                      Müziğini profesyonel seviyeye taşı
                    </span>

                  </div>

                  <div className="production-grid">

                    {/* ALBÜM */}

                    <div className="production-card">

                      <div className="production-icon">
                        💿
                      </div>

                      <div className="production-info">

                        <p className="production-category">
                          PRODÜKSİYON
                        </p>

                        <h3>
                          Albüm
                        </h3>

                        <p>
                          Projen için profesyonel albüm
                          prodüksiyonu ve hazırlık süreci.
                        </p>

                        <div className="production-price">
                          3.000 TL
                        </div>

                        <button
                          onClick={() =>
                            setSelectedService("album")
                          }
                        >
                          Detayları Gör
                        </button>

                      </div>

                    </div>


                    {/* KİŞİYE ÖZEL MIX */}

                    <div className="production-card">

                      <div className="production-icon">
                        🎚️
                      </div>

                      <div className="production-info">

                        <p className="production-category">
                          MIX & MASTERING
                        </p>

                        <h3>
                          Kişiye Özel Mix
                        </h3>

                        <p>
                          Parçanı tarzına ve sesine uygun
                          profesyonel mix işlemi.
                        </p>

                        <div className="production-price">
                          1.000 TL
                          <span> / parça</span>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedService("mix")
                          }
                        >
                          Detayları Gör
                        </button>

                      </div>

                    </div>

                  </div>

                </section>

        {/* =========================
                    SERVICES
                ========================= */}

                <section
                  className="services"
                  id="services"
                >

                  <div className="section-title">

                    <h2>
                      Hizmetler
                    </h2>

                    <span>
                      GhostLab deneyimini profesyonelleştir
                    </span>

                  </div>

                  <div className="service-grid">

                    {/* DJ EĞİTİMİ */}

                    <div className="service-card">

                      <div className="service-icon">
                        🎧
                      </div>

                      <div className="service-info">

                        <p className="service-category">
                          EĞİTİM
                        </p>

                        <h3>
                          DJ Eğitimi Paketi
                        </h3>

                        <p>
                          Profesyonel DJ eğitimi ile mixing,
                          beat matching ve sahne performansını öğren.
                        </p>

                        <div className="service-price">
                          15.000 TL
                        </div>

                        <button
                          onClick={() =>
                            setSelectedService("dj-egitimi")
                          }
                        >
                          Detayları Gör
                        </button>

                      </div>

                    </div>


                    {/* VIDEO & PR */}

                    <div className="service-card">

                      <div className="service-icon">
                        🎥
                      </div>

                      <div className="service-info">

                        <p className="service-category">
                          MEDYA & PR
                        </p>

                        <h3>
                          Video Çekimi & PR
                        </h3>

                        <p>
                          Profesyonel video çekimi, içerik üretimi
                          ve PR desteği.
                        </p>

                        <div className="service-price">
                          5.000 TL
                          <span> / saat</span>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedService("video-pr")
                          }
                        >
                          Detayları Gör
                        </button>

                      </div>

                    </div>

                  </div>

                </section>

      </main>

      {/* =========================
          LOGIN MODAL
      ========================= */}

      {showLogin && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="close"
              onClick={() =>
                setShowLogin(false)
              }
            >
              ×
            </button>

            <h2>
              Giriş Yap
            </h2>

            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Şifre"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                required
              />

              <button type="submit">
                Giriş Yap
              </button>

            </form>

            <p>
              Hesabın yok mu?{" "}

              <button
                className="link-button"
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Kayıt Ol
              </button>

            </p>

          </div>

        </div>

      )}

      {/* =========================
          REGISTER MODAL
      ========================= */}

      {showRegister && (

        <div className="modal-overlay">

          <div className="modal">

            <button
              className="close"
              onClick={() =>
                setShowRegister(false)
              }
            >
              ×
            </button>

            <h2>
              Kayıt Ol
            </h2>

            <form onSubmit={handleRegister}>

              <input
                type="text"
                placeholder="Ad Soyad"
                value={registerName}
                onChange={(e) =>
                  setRegisterName(e.target.value)
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Şifre (en az 6 karakter)"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(e.target.value)
                }
                minLength="6"
                required
              />

              <button type="submit">
                Kayıt Ol
              </button>

            </form>

            <p>
              Zaten hesabın var mı?{" "}

              <button
                className="link-button"
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Giriş Yap
              </button>

            </p>

          </div>

        </div>

      )}

      {/* =========================
          CART MODAL
      ========================= */}

      {showCart && (

        <div className="modal-overlay">

          <div className="modal cart-modal">

            <button
              className="close"
              onClick={() =>
                setShowCart(false)
              }
            >
              ×
            </button>

            <h2>
              Sepetim
            </h2>

            {cart.length === 0 ? (

              <p>
                Sepetiniz boş.
              </p>

            ) : (

              <>

                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-item-info">
                      <strong>{item.name}</strong>

                      <p>
                        {item.price.toLocaleString("tr-TR")} TL
                      </p>

                      <div className="cart-quantity">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <strong>
                        {(item.price * item.quantity).toLocaleString("tr-TR")} TL
                      </strong>

                      <button
                        className="remove-cart-item"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}

                <hr />

                <h3>
                  Toplam:{" "}
                  {cartTotal.toLocaleString("tr-TR")} TL
                </h3>

                <button
                  onClick={async () => {

                    const token =
                      localStorage.getItem("token");

                    const userId =
                      localStorage.getItem("userId");

                    if (!token || !userId) {

                      setShowCart(false);
                      setShowLogin(true);

                      setMessage(
                        "Sipariş vermek için giriş yapmalısın."
                      );

                      return;
                    }

                    try {

                      const response =
                        await fetch(
                          `${API_URL}/orders?userId=${userId}`,
                          {
                            method: "POST",

                            headers: {
                              "Content-Type":
                                "application/json",

                              Authorization:
                                `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                              items: cart.map((item) => ({
                                productId: item.id,
                                quantity: item.quantity,
                              })),
                            }),
                          }
                        );

                      if (!response.ok) {

                        const errorText =
                          await response.text();

                        throw new Error(
                          errorText ||
                            "Sipariş oluşturulamadı."
                        );
                      }

                      const order =
                        await response.json();

                      setCart([]);
                      setShowCart(false);

                      setMessage(
                        `Sipariş #${order.id} başarıyla oluşturuldu!`
                      );

                    } catch (err) {

                      setMessage(err.message);

                    }

                  }}
                >
                  Siparişi Tamamla
                </button>

              </>

            )}

          </div>

        </div>

      )}

      {/* =========================
          SİPARİŞLERİM MODAL
      ========================= */}

      {showOrders && (
        <div className="modal-overlay">
          <div className="modal orders-modal">

            <button
              className="close"
              onClick={() => setShowOrders(false)}
            >
              ×
            </button>

            <h2>Siparişlerim</h2>

            {ordersLoading ? (
              <p>Siparişler yükleniyor...</p>
            ) : orders.length === 0 ? (
              <p>Henüz sipariş vermedin.</p>
            ) : (
              <div className="orders-list">

                {orders.map((order) => {

                  const statusInfo = {
                    PENDING: {
                      icon: "🟡",
                      text: "BEKLEMEDE",
                      className: "pending",
                    },
                    CONFIRMED: {
                      icon: "🟢",
                      text: "ONAYLANDI",
                      className: "confirmed",
                    },
                    CANCELLED: {
                      icon: "🔴",
                      text: "İPTAL EDİLDİ",
                      className: "cancelled",
                    },
                  };

                  const status =
                    statusInfo[order.status] || {
                      icon: "⚪",
                      text: order.status,
                      className: "unknown",
                    };

                  return (
                    <div
                      className="order-card"
                      key={order.id}
                    >

                      {/* SİPARİŞ BAŞLIĞI */}
                      <div className="order-header">

                        <strong>
                          Sipariş #{order.id}
                        </strong>

                        <span
                          className={`order-status ${status.className}`}
                        >
                          {status.icon} {status.text}
                        </span>

                      </div>

                      {/* ÜRÜNLER */}
                      <div className="order-items">

                        {order.items?.map((item) => {

                          const unitPrice = Number(item.price || 0);
                          const quantity = Number(item.quantity || 0);
                          const itemTotal = unitPrice * quantity;

                          return (
                            <div
                              className="order-item"
                              key={item.id}
                            >

                              <div className="order-item-info">

                                <strong>
                                  {item.product?.name}
                                </strong>

                                <span>
                                  {quantity} adet
                                </span>

                              </div>

                              <div className="order-item-price">

                                <span>
                                  {unitPrice.toLocaleString("tr-TR")} TL × {quantity}
                                </span>

                                <strong>
                                  {itemTotal.toLocaleString("tr-TR")} TL
                                </strong>

                              </div>

                            </div>
                          );
                        })}

                      </div>

                      {/* TOPLAM */}
                      <div className="order-total">

                        <span>Toplam</span>

                        <strong>
                          {Number(order.totalPrice).toLocaleString("tr-TR")} TL
                        </strong>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </div>
      )}

  {/* =========================
      SERVICE DETAIL MODAL
  ========================= */}

  {selectedService && (

    <div className="modal-overlay">

      <div className="modal service-detail-modal">

        <button
          className="close"
          onClick={() => setSelectedService(null)}
        >
          ×
        </button>

        {selectedService === "dj-egitimi" && (
          <>
            <div className="service-detail-icon">
              🎧
            </div>

            <p className="service-category">
              EĞİTİM
            </p>

            <h2>
              DJ Eğitimi Paketi
            </h2>

            <p>
              Profesyonel DJ eğitimi ile
              mixing, beat matching ve sahne
              performansının temellerini öğren.
            </p>

            <div className="detail-price">
              15.000 TL
            </div>

            <button
              className="detail-action"
              onClick={() => {
                setMessage(
                  "DJ Eğitimi talebin alındı!"
                );
                setSelectedService(null);
              }}
            >
              Hizmet Talebi Oluştur
            </button>
          </>
        )}

        {selectedService === "video-pr" && (
          <>
            <div className="service-detail-icon">
              🎥
            </div>

            <p className="service-category">
              MEDYA & PR
            </p>

            <h2>
              Video Çekimi & PR
            </h2>

            <p>
              Profesyonel video çekimi, içerik
              üretimi ve PR desteği.
            </p>

            <div className="detail-price">
              5.000 TL
              <span> / saat</span>
            </div>

            <button
              className="detail-action"
              onClick={() => {
                setMessage(
                  "Video & PR talebin alındı!"
                );
                setSelectedService(null);
              }}
            >
              Hizmet Talebi Oluştur
            </button>
          </>
        )}

        {selectedService === "album" && (
          <>
            <div className="service-detail-icon">
              💿
            </div>

            <p className="service-category">
              PRODÜKSİYON
            </p>

            <h2>
              Albüm
            </h2>

            <p>
              Projen için profesyonel albüm
              prodüksiyonu ve hazırlık süreci.
            </p>

            <div className="detail-price">
              3.000 TL
            </div>

            <button
              className="detail-action"
              onClick={() => {
                setMessage(
                  "Albüm prodüksiyon talebin alındı!"
                );
                setSelectedService(null);
              }}
            >
              Prodüksiyon Talebi Oluştur
            </button>
          </>
        )}

        {selectedService === "mix" && (
          <>
            <div className="service-detail-icon">
              🎚️
            </div>

            <p className="service-category">
              MIX & MASTERING
            </p>

            <h2>
              Kişiye Özel Mix
            </h2>

            <p>
              Parçanı tarzına ve sesine uygun
              profesyonel mix işlemi.
            </p>

            <div className="detail-price">
              1.000 TL
              <span> / parça</span>
            </div>

            <button
              className="detail-action"
              onClick={() => {
                setMessage(
                  "Mix talebin alındı!"
                );
                setSelectedService(null);
              }}
            >
              Mix Talebi Oluştur
            </button>
          </>
        )}

      </div>

    </div>

  )}

      {/* =========================
          MESSAGE
      ========================= */}

      {message && (

        <div className="message">
          {message}
        </div>

      )}

      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <strong>
          GHOSTLAB
        </strong>

        <span>
          © 2026 GhostLab
        </span>

      </footer>

    </div>
  );
}

export default App;