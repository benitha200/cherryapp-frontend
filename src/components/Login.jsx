import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../constants/Constants";
import { UserLogin } from "./authAction";

// Consistent theme colors
const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover
  directDelivery: "#4FB3B3", // Lighter teal for direct delivery badge
  centralStation: "#008080", // Main teal for central station badge
};

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const location = useLocation();
  const { isPending, loginError, mutate } = UserLogin();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (loginError) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    mutate(credentials);
  };

  return (
    <div className="container-fluid" style={{ position: "relative" }}>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg">
            {/* Logo/Brand Section */}
            <div
              className="card-header text-center border-0 py-4"
              style={{
                background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              <h4 className="text-white mb-0 fw-bold">
                <i className="bi bi-shield-lock me-2"></i>
                Welcome Back
              </h4>
              <p className="text-white-50 small mb-0 mt-2">
                Please sign in to continue
              </p>
            </div>

            <div className="card-body p-4 p-lg-5">
              {/* Error Alert */}
              {showAlert && (
                <div
                  className="alert d-flex align-items-center mb-4"
                  role="alert"
                  style={{
                    backgroundColor: theme.accent + "20",
                    color: theme.accent,
                    position: "absolute",
                    top: 120,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{loginError?.message ?? "Something went wrong"}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username Field */}
                <div className="mb-4 " style={{ marginTop: "2rem" }}>
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: theme.primary }}
                  >
                    <i className="bi bi-person me-2"></i>Username
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm py-2"
                    disabled={isPending}
                    style={{
                      fontSize: "0.875rem",
                      backgroundColor: theme.neutral,
                      border: "none",
                    }}
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label
                    className="form-label fw-semibold small"
                    style={{ color: theme.primary }}
                  >
                    <i className="bi bi-key me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm py-2"
                    style={{
                      fontSize: "0.875rem",
                      backgroundColor: theme.neutral,
                      border: "none",
                    }}
                    placeholder="Enter your password"
                    disabled={isPending}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-md w-100 mb-3 text-uppercase fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={isPending}
                  style={{
                    backgroundColor: theme.primary,
                    color: "white",
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isPending ? (
                    <>
                      <span>Signing In</span>
                      <div
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Footer text */}
          <div className="text-center mt-4">
            <small style={{ color: theme.primary }}>
              © 2025 Rwacof Exports. All rights reserved.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
