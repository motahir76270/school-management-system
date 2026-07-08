import { Colors } from "@/constants/theme";
import { LoginApiCall } from "@/hooks/apiCalls/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Device from "expo-device";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthValiation from "@/validations/auth";
import { FullScreenLoader } from "@/hooks/use-screensLoder";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginFormData = z.infer<typeof AuthValiation.loginSchema>;

export default function LoginScreen({ navigation }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "teacher">("student");
  const dispatch = useDispatch();

  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(AuthValiation.loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    clearErrors();

    try {
      let res;
      
      if (loginType === "teacher") {
        const payload = {
          login_type: loginType,
          email: data.email,
          password: data.password,
          device_name: Device?.deviceName || "mobile",
        };
        res = await LoginApiCall(payload);
      } else {
        const payload = {
          login_type: loginType,
          student_id: data.email,
          date_of_birth: data.password, // Assuming password field contains DOB for students
          device_name: Device?.deviceName || "mobile",
        };
        res = await LoginApiCall(payload);
      }
    
       
      if (res?.success === true) {
        await AsyncStorage.setItem("token", JSON.stringify(res?.token));
        await AsyncStorage.setItem("user", JSON.stringify(res));
        const parsedUser = JSON.parse(await AsyncStorage.getItem("user") as any);
        dispatch(setUser(parsedUser?.user));
        router.replace('/(tabs)');
      } else {
        Alert.alert("Login Failed", res?.message || "Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      setError("root", {
        message: error?.message || "Network error. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginType = (type: "student" | "teacher") => {
    setLoginType(type);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header with Gradient Effect */}
      <SafeAreaView style={[styles.headerSection, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="school-outline" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>EduConnect</Text>
        </View>
      </SafeAreaView>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.title, { color: colors.text }]}>
                Welcome Back! 👋
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Login to continue your learning journey
              </Text>
            </View>

            {/* Login Type Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundElement }]}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginType === "student" && { backgroundColor: colors.primary },
                ]}
                onPress={() => toggleLoginType("student")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.toggleText,
                    loginType === "student" && { color: "#fff" },
                    loginType !== "student" && { color: colors.textSecondary },
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginType === "teacher" && { backgroundColor: colors.primary },
                ]}
                onPress={() => toggleLoginType("teacher")}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.toggleText,
                    loginType === "teacher" && { color: "#fff" },
                    loginType !== "teacher" && { color: colors.textSecondary },
                  ]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Email Address
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: errors.email ? "#FF3B30" : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={errors.email ? "#FF3B30" : colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {/* Password Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                   Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: colors.backgroundElement,
                          borderColor: errors.password ? "#FF3B30" : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={"lock-closed-outline"}
                        size={20}
                        color={errors.password ? "#FF3B30" : colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry={loginType === "teacher" || loginType === "student"  ? !showPassword : false}
                        editable={!loading}
                      />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
      
                    </View>
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: colors.primary },
                      rememberMe && [
                        styles.checkboxChecked,
                        { backgroundColor: colors.primary },
                      ],
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={colors.background}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.rememberText, { color: colors.textSecondary }]}
                  >
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={loading}>
                  <Text style={[styles.forgotText, { color: colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Root Error Message */}
              {errors.root && (
                <View style={[styles.rootErrorContainer, { backgroundColor: colors.error }]}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <Text style={styles.rootErrorText}>{errors.root.message}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: colors.primary },
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ScrollView>
      <FullScreenLoader loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom:320
  },
  safeArea: {
    flex: 1,
  },
  headerSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeSection: {
    marginTop: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    height: 56,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "transparent",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  rootErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  rootErrorText: {
    color: "#FF3B30",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  loginButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  signupText: {
    fontSize: 15,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});