
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const company = {
  logo: "",
  name: "",
  BASE_URL: "https://erp.trishpay.in/api",
};

export const icons = {
  errowBack: <Ionicons name="arrow-back" size={24} color="black" />,
  person: <Ionicons name="person-sharp" size={24} color="black" />,
};

export const images = {
  classes: require("../../assets/img/classes.png"),
  attendance: require("../../assets/img/attendance.webp"),
  work: require("../../assets/img/work2.png"),
  assignment: require("../../assets/img/assessment.webp"),
  payFee: require("../../assets/img/fees.webp"),
  result: require("../../assets/img/result2.jpg"),
  leaves: require("../../assets/img/leaves.jpg"),
  exams: require("../../assets/img/exam.avif"),
  timeTable: require("../../assets/img/time-table.png"),
  qr: require("../../assets/img/qr.png")
};

