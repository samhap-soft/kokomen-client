import { View } from "react-native";
import { TabActions, useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import GeneralIcon from "@/components/common/icons";
import { icons } from "lucide-react-native";

const TabBarIcons: Record<string, { icon: keyof typeof icons; label: string }> =
  {
    Home: {
      icon: "ClipboardList",
      label: "홈",
    },
    Dashboard: {
      icon: "ChartColumnBig",
      label: "대시보드",
    },
  };

export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: Partial<BottomTabBarProps>) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={{ flexDirection: "row", height: 70 }}>
      {state?.routes.map((route: any, index: any) => {
        const { options } = descriptors?.[route.key] || {};
        if (!options) return null;
        const label = TabBarIcons[route.name as keyof typeof TabBarIcons].label;

        const isFocused = state.index === index;

        const handlePressNavigate = () => {
          if (isFocused) {
            navigation?.reset({
              index: 0,
              routes: [{ name: route.name, params: route.params }],
            });
          } else {
            navigation?.navigate(route.name, route.params);
          }
        };

        return (
          <PlatformPressable
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={handlePressNavigate}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
            key={route.key}
          >
            <GeneralIcon
              name={TabBarIcons[route.name as keyof typeof TabBarIcons].icon}
              color={isFocused ? colors.primary : colors.text}
              size={24}
            />
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}
