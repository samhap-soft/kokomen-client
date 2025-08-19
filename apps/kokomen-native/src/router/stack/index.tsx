// src/router/stack/MainStack.tsx
import { createStackNavigator } from "@react-navigation/stack";
import { MainStackParamList } from "../types";
import InterviewMainScreen from "@/screens/interviews/interviewMain";

const Stack = createStackNavigator<MainStackParamList>();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="InterviewMain" component={InterviewMainScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
