"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Định nghĩa interface cho thông tin người dùng
export interface UserInfo {
  identification?: string;
  name?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  address?: string;
  email?: string;
  username?: string;
  role?: string;
}

// Định nghĩa interface cho context
interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<any>;
  loginWithGoogle: (idToken: string) => Promise<any>;
  logout: () => Promise<boolean>;
  refreshUserInfo: () => Promise<void>;
}

// Tạo context với giá trị mặc định
const AuthContextValue = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => false,
  refreshUserInfo: async () => {},
});

// Provider component
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin người dùng từ API
  const refreshUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || Cookies.get("authToken");
      if (!token) return;

      const role = localStorage.getItem("userRole") || Cookies.get("userRole");
      if (role === "ADMIN") {
        setLoading(false);
        return;
      }

      setLoading(true);

      const apiUrl = buildApiUrl(API_ENDPOINTS.AUTH.MY_INFO);
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.code !== 1000) {
        throw new Error(data.message || "Không thể lấy thông tin người dùng");
      }

      // Log dữ liệu để debug
      console.log("API my-info response:", data.result);
      const storedUsername = localStorage.getItem("username");

      // API trả về username, không cần phải lưu từ login nữa
      const updatedUserData = {
        ...data.result, // Bao gồm username từ API
        username: data.result.username || storedUsername,
      };

      setUser(updatedUserData);
      localStorage.setItem("userInfo", JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Không throw lỗi ở đây để không làm gián đoạn luồng đăng nhập
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra và lấy thông tin người dùng khi component được mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("authToken");

        if (!token) {
          setLoading(false);
          return;
        }

        // Lấy thông tin người dùng từ localStorage (nếu có)
        const cachedUser = localStorage.getItem("userInfo");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }

        // Vẫn gọi API để lấy thông tin mới nhất
        await refreshUserInfo();
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.code !== 1000 || !data.result?.token) {
        throw new Error(data.message || "Đăng nhập không thành công");
      }

      // Lưu token vào cả cookies và localStorage
      const token = data.result.token;
      Cookies.set("authToken", token, { expires: 1 });
      localStorage.setItem("token", token); // Thêm dòng này

      // Lưu role vào cookie và localStorage
      Cookies.set("userRole", data.result.role, { expires: 1 });
      localStorage.setItem("userRole", data.result.role);

      // Lưu thông tin cơ bản từ phản hồi đăng nhập
      const basicUserInfo = {
        username: username,
        role: data.result.role,
      };

      setUser(basicUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(basicUserInfo));

      // Lấy thông tin chi tiết của người dùng
      await refreshUserInfo();

      return data;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng nhập bằng Google
  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE_LOGIN);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (data.code === 1012) {
        // Đăng ký Google thành công, chờ admin duyệt
        return data;
      }

      if (data.code !== 1000 || !data.result?.token) {
        throw new Error(data.message || "Đăng nhập Google thất bại");
      }

      const token = data.result.token;
      Cookies.set("authToken", token, { expires: 1 });
      localStorage.setItem("token", token);

      Cookies.set("userRole", data.result.role, { expires: 1 });
      localStorage.setItem("userRole", data.result.role);

      const basicUserInfo = {
        username: data.result.username,
        role: data.result.role,
      };

      setUser(basicUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(basicUserInfo));

      await refreshUserInfo();

      return data;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    setLoading(true);

    try {
      const token = Cookies.get("authToken");

      if (token) {
        // Gọi API logout
        try {
          const apiUrl = buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT);
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (data.code !== 1000) {
            console.warn("Backend logout warning:", data.message);
          }
        } catch (apiError) {
          // Ngay cả khi API logout thất bại, chúng ta vẫn xóa token khỏi client
          console.warn("Error calling logout API:", apiError);
        }
      }

      // Xóa token từ cả cookies và localStorage
      Cookies.remove("authToken");
      Cookies.remove("userRole");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("username");

      // Cập nhật state
      setUser(null);

      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshUserInfo,
  };

  return (
    <AuthContextValue.Provider value={contextValue}>
      {children}
    </AuthContextValue.Provider>
  );
}

// Hook để sử dụng context
export function useAuth() {
  return useContext(AuthContextValue);
}
