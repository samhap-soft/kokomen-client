import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Main: undefined;
};

export type MainStackParamList = {
  InterviewMain: undefined;
  Interview: { interviewId: number; mode: "TEXT" | "VOICE" };
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  MyResult: { interviewId: number };
};

export type TabParamList = {
  Home: undefined;
  Dashboard: undefined;
};

export type MainStackParam<R extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, R>;

export type MainStackNavigationProp<
  T extends keyof MainStackParamList = keyof MainStackParamList,
> = NativeStackNavigationProp<MainStackParamList, T>;
