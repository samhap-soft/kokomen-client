import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Main: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  InterviewMain: undefined;
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
