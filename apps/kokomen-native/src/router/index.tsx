import { TabParamList } from "./types";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MainStack from "@/router/stack";
import DashboardStack from "@/router/stack/dashboardStack";
import MyTabBar from "@/components/common/tabBar";

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
        component={() => <MainStack />}
        options={{}}
      />
      <BottomTab.Screen name="Dashboard" component={() => <DashboardStack />} />
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
