import { icons } from "lucide-react-native";

const GeneralIcon = ({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) {
    return null;
  }
  return <LucideIcon color={color} size={size} />;
};

export default GeneralIcon;
