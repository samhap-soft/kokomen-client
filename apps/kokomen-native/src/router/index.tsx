import { TabParamList } from "./types";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MyTabBar from "@/components/common/tabBar";
import InterviewMainScreen from "@/screens/interviews/interviewMain";
import DashboardScreen from "@/screens/my/dashboard";

const BottomTab = createBottomTabNavigator<TabParamList>();

const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={InterviewMainScreen}
        options={{}}
      />
      <BottomTab.Screen name="Dashboard" component={DashboardScreen} />
    </BottomTab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
