import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

// Consistent theme colors
const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  white: "#ffffff",
  danger: "#dc3545", // Bootstrap danger red
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cwsInfo = JSON.parse(localStorage.getItem("cws") || "{}");

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Check if current path is a reports page for initial dropdown state
  useEffect(() => {
    if (
      location.pathname === "/cherry-purchase-report" ||
      location.pathname === "/bagging-off-report"
    ) {
      setOpenMenu("Reports");
    }
  }, [location.pathname]);

  // Check if current path is a reports page for initial dropdown state

  useEffect(() => {
    if (
      location.pathname === "/quality-all" ||
      location.pathname === "/quality-all/form" ||
      location.pathname === "quality-delivery" ||
      location.pathname === "delivery-track"
    ) {
      setOpenMenu("Quality");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Base menu items
  let menuItems = [{ path: "/", icon: "house-door", text: "Dashboard" }];
  //quality menu items

  const qualityItemsCws = [
    { path: "/quality-all", icon: "capsule", text: "Sample" },
  ];

  const qualityItemsAdmin = [
    { path: "/quality-all", icon: "capsule", text: "Sample" },
    { path: "/quality-delivery", icon: "box", text: "Delivery" },
  ];

  // Reports menu items
  const reportItems = [
    {
      path: "/cherry-purchase-report",
      icon: "file-text",
      text: "Purchase Report",
    },
    {
      path: "/bagging-off-report",
      icon: "file-earmark-text",
      text: "Out Turns Report",
    },
    {
      path: "quality-report",
      icon: "file-earmark-text",
      text: "Quality Report",
    },

    // {
    //   path: "general-report",
    //   icon: "file-earmark-text",
    //   text: "Genral Report",
    // },
  ];

  // Settings menu items for admin
  const settingsItems = [
    { path: "/cws", icon: "journal", text: "CWS" },
    { path: "/site-collections", icon: "collection", text: "Site Collections" },
    {
      path: "/wet-transfer-cws-mapping",
      icon: "collection",
      text: "Cws Mapping",
    },
    { path: "/pricing", icon: "cash", text: "Pricing" },
    { path: "/users", icon: "people", text: "Users" },
  ];

  // Add role-specific menu items
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    menuItems = [
      ...menuItems,
      { path: "/purchases-all", icon: "coin", text: "Add Purchase" },
      { path: "/purchase-by-station", icon: "cash", text: "Purchases" },
      { path: "/processing-all", icon: "hourglass-split", text: "Processing" },
      { path: "/stock", icon: "house", text: "Stock" },
      { path: "/wet-transfer-admin", icon: "truck", text: "Wet Transfer" },
      { path: "/transport", icon: "truck", text: "Transport" },
      // Report dropdown will be added separately
    ];
  } else if (
    user.role === "SUPERVISOR" ||
    user.role === "FINANCE" ||
    user.role === "MD"
  ) {
    menuItems = [
      ...menuItems,
      { path: "/purchase-by-station", icon: "cash", text: "Purchases" },
      { path: "/wet-transfer-admin", icon: "truck", text: "Wet Transfer" },
      { path: "/transport", icon: "truck", text: "Transport" },
      { path: "/stock", icon: "house", text: "Stock" },
    ];
  } else if (user.role === "OPERATIONS") {
    menuItems = [
      ...menuItems,
      { path: "/purchase-by-station", icon: "cash", text: "Purchases" },
      { path: "/wet-transfer-admin", icon: "truck", text: "Wet Transfer" },
      { path: "/processing-all", icon: "hourglass-split", text: "Processing" },
      { path: "/transport", icon: "truck", text: "Transport" },
      { path: "/stock", icon: "house", text: "Stock" },
    ];
  } else if (user.role === "QUALITY") {
    menuItems = [
      ...menuItems,
      {
        path: "quality-report",
        icon: "file-earmark-text",
        text: "Quality Report",
      },
    ];
  } else {
    menuItems = [
      ...menuItems,
      { path: "/purchases", icon: "cart", text: "Purchases" },
      { path: "/processing", icon: "bag-check", text: "Bagging Off" },
    ];

    // add both when cws is sender and reciver at the sametime

    if (cwsInfo?.is_wet_parchment_sender !== 0) {
      menuItems.push({
        path:
          cwsInfo?.is_wet_parchment_sender === 1
            ? "/wet-transfer"
            : cwsInfo?.is_wet_parchment_sender === 3
            ? "/wet-transfer-both"
            : "/wet-transfer-receiver",
        icon: "bag-check",
        text: "Wet Transfer",
      });
    }

    menuItems.push({ path: "/transfer", icon: "truck", text: "Transport" });
  }

  const renderNavLink = ({ path, icon, text }) => (
    <NavLink
      key={path}
      to={path}
      className={({ isActive }) => `
        d-flex align-items-center px-4 py-2 text-decoration-none text-white
        ${isActive ? "active-link" : ""}
      `}
      style={({ isActive }) => ({
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.1)" : "transparent",
        transition: "background-color 0.2s ease",
      })}
      onClick={() => isMobile && setIsOpen(false)}
    >
      <i className={`bi bi-${icon} me-3`}></i>
      {text}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="d-md-none position-fixed top-0 start-0 mt-3 ms-3 z-3 btn"
        style={{
          backgroundColor: theme.white,
          color: theme.primary,
          border: `1px solid ${theme.primary}`,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`bi ${isOpen ? "bi-x" : "bi-list"}`}></i>
      </button>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="position-fixed top-0 start-0 h-100 z-3 d-flex flex-column"
        style={{
          width: "250px",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          backgroundColor: theme.primary,
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-bottom"
          style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <h3 className="fs-4 fw-bold text-white mb-0">Cherry Purchase</h3>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow-1 py-3">
          {menuItems.map(renderNavLink)}

          {/* Quality Dropdown - Show for ADMIN, SUPER_ADMIN, SUPERVISOR, OPERATIONS, FINANCE, MD */}
          {(user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            user.role === "QUALITY") && (
            // user.role === "MD"
            <div>
              <button
                className="d-flex align-items-center px-4 py-2 w-100 border-0 text-white"
                style={{
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  openMenu === "Quality"
                    ? setOpenMenu("")
                    : setOpenMenu("Quality")
                }
              >
                <i className="bi bi-bookmark-check-fill me-3"></i>
                Quality
                <i
                  className={`bi bi-chevron-${
                    openMenu == "Quality" ? "down" : "right"
                  } ms-auto`}
                ></i>
              </button>
              {openMenu == "Quality" && (
                <div
                  style={{
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    marginLeft: "2rem",
                  }}
                  onClick={() => setQualityOpen(!qualityOpen)}
                >
                  {qualityItemsAdmin.map(renderNavLink)}
                </div>
              )}
            </div>
          )}

          {user.role === "CWS_MANAGER" && (
            <div>
              <button
                className="d-flex align-items-center px-4 py-2 w-100 border-0 text-white"
                style={{
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  openMenu === "Quality"
                    ? setOpenMenu("")
                    : setOpenMenu("Quality")
                }
              >
                <i className="bi bi-bookmark-check-fill me-3"></i>
                Quality
                <i
                  className={`bi bi-chevron-${
                    openMenu == "Quality" ? "down" : "right"
                  } ms-auto`}
                ></i>
              </button>
              {openMenu == "Quality" && (
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    marginLeft: "2rem",
                  }}
                >
                  {qualityItemsCws.map(renderNavLink)}
                </div>
              )}
            </div>
          )}

          {/* Reports Dropdown - Show for ADMIN, SUPER_ADMIN, SUPERVISOR, OPERATIONS, FINANCE, MD */}
          {(user.role === "ADMIN" ||
            user.role === "SUPER_ADMIN" ||
            user.role === "SUPERVISOR" ||
            user.role === "OPERATIONS" ||
            user.role === "FINANCE" ||
            user.role === "MD") && (
            <div>
              <button
                className="d-flex align-items-center px-4 py-2 w-100 border-0 text-white"
                style={{
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  openMenu !== "Reports"
                    ? setOpenMenu("Reports")
                    : setOpenMenu("")
                }
              >
                <i className="bi bi-pie-chart me-3"></i>
                Reports
                <i
                  className={`bi bi-chevron-${
                    openMenu === "Reports" ? "down" : "right"
                  } ms-auto`}
                ></i>
              </button>
              {openMenu === "Reports" && (
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    marginLeft: "2rem",
                  }}
                >
                  {reportItems.map(renderNavLink)}
                </div>
              )}
            </div>
          )}

          {/* Settings Section for Admin */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div>
              <button
                className="d-flex align-items-center px-4 py-2 w-100 border-0 text-white"
                style={{
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() =>
                  openMenu !== "Settings"
                    ? setOpenMenu("Settings")
                    : setOpenMenu("")
                }
              >
                <i className="bi bi-gear me-3"></i>
                Settings
                <i
                  className={`bi bi-chevron-${
                    openMenu == "Settings" ? "down" : "right"
                  } ms-auto`}
                ></i>
              </button>
              {openMenu == "Settings" && (
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    marginLeft: "2rem",
                  }}
                >
                  {settingsItems.map(renderNavLink)}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Logout Section */}
        <div
          className="p-4 border-top"
          style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <NavLink to="/my-account" className="nav-link mb-3">
            <i className="bi bi-gear me-2 text-white"></i>
            <span className="text-white">My Account</span>
          </NavLink>
          <div className="d-flex justify-content-between align-items-center">
            <span
              className="text-white d-flex align-items-center text-truncate"
              style={{ maxWidth: "70%" }}
            >
              <i className="bi bi-person-circle me-2"></i>
              <span className="text-truncate">{user.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className=" btn btn-danger btn-sm "
              style={{
                backgroundColor: theme.danger,
                border: "none",
                padding: "4px 12px",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
