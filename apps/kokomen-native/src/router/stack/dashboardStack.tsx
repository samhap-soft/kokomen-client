import { createStackNavigator } from "@react-navigation/stack";
import { DashboardStackParamList } from "../types";
import DashboardScreen from "@/screens/my/dashboard";

const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}
