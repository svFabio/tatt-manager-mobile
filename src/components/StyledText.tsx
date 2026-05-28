import React from "react";
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from "react-native";
import type { TextProps, TextInputProps } from "react-native";

// ── Font weight → font family mapping ──
const FONT_MAP: Record<string, string> = {
  "400": "Montserrat_400Regular",
  normal: "Montserrat_400Regular",
  "500": "Montserrat_500Medium",
  medium: "Montserrat_500Medium",
  "600": "Montserrat_600SemiBold",
  semibold: "Montserrat_600SemiBold",
  "700": "Montserrat_700Bold",
  bold: "Montserrat_700Bold",
};

const DEFAULT_FONT = "Montserrat_400Regular";

// List of font families that should be preserved (icons, monospace, etc.)
const PRESERVE_FONTS = new Set([
  "FontAwesome",
  "FontAwesome5_Regular",
  "FontAwesome5_Solid",
  "FontAwesome5_Brands",
  "Ionicons",
  "MaterialIcons",
  "MaterialCommunityIcons",
  "Feather",
  "AntDesign",
  "Entypo",
  "EvilIcons",
  "Foundation",
  "Octicons",
  "SimpleLineIcons",
  "Zocial",
  "SpaceMono",
  "monospace",
]);

function shouldPreserveFont(fontFamily: string | undefined): boolean {
  if (!fontFamily) return false;
  return PRESERVE_FONTS.has(fontFamily);
}

function resolveFontAndClass(style: any, className: string | undefined) {
  let flat = StyleSheet.flatten(style) || {};
  let weight = String(flat.fontWeight || "400");
  let cleanClassName = className || "";

  if (cleanClassName) {
    if (cleanClassName.includes("font-black")) { weight = "900"; cleanClassName = cleanClassName.replace(/\bfont-black\b/g, ""); }
    else if (cleanClassName.includes("font-extrabold")) { weight = "800"; cleanClassName = cleanClassName.replace(/\bfont-extrabold\b/g, ""); }
    else if (cleanClassName.includes("font-bold")) { weight = "700"; cleanClassName = cleanClassName.replace(/\bfont-bold\b/g, ""); }
    else if (cleanClassName.includes("font-semibold")) { weight = "600"; cleanClassName = cleanClassName.replace(/\bfont-semibold\b/g, ""); }
    else if (cleanClassName.includes("font-medium")) { weight = "500"; cleanClassName = cleanClassName.replace(/\bfont-medium\b/g, ""); }
    else if (cleanClassName.includes("font-normal")) { weight = "400"; cleanClassName = cleanClassName.replace(/\bfont-normal\b/g, ""); }
    else if (cleanClassName.includes("font-light")) { weight = "300"; cleanClassName = cleanClassName.replace(/\bfont-light\b/g, ""); }
    else if (cleanClassName.includes("font-extralight")) { weight = "200"; cleanClassName = cleanClassName.replace(/\bfont-extralight\b/g, ""); }
    else if (cleanClassName.includes("font-thin")) { weight = "100"; cleanClassName = cleanClassName.replace(/\bfont-thin\b/g, ""); }
    
    // Strip italic to prevent Android fallback bug
    if (cleanClassName.includes("italic")) { cleanClassName = cleanClassName.replace(/\bitalic\b/g, ""); }
  }

  return {
    fontFamily: FONT_MAP[weight] || DEFAULT_FONT,
    cleanClassName: cleanClassName.trim()
  };
}

// ── Styled Text ──
export const Text = React.forwardRef<RNText, TextProps & { className?: string }>((props, ref) => {
  const flat = StyleSheet.flatten(props.style) || {};

  // If an explicit fontFamily is set and it's a special font (icons, etc.), don't override
  if (shouldPreserveFont(flat.fontFamily)) {
    return <RNText {...props} ref={ref} />;
  }

  const { fontFamily, cleanClassName } = resolveFontAndClass(props.style, props.className);
  
  // Strip fontWeight and fontStyle to prevent Android from falling back to system font
  const { fontWeight, fontStyle, ...cleanStyle } = flat as any;

  return (
    <RNText
      {...props}
      className={cleanClassName}
      style={[cleanStyle, { fontFamily }]}
      ref={ref}
    />
  );
});
Text.displayName = "Text";

// ── Styled TextInput ──
export const TextInput = React.forwardRef<RNTextInput, TextInputProps & { className?: string }>(
  (props, ref) => {
    const flat = StyleSheet.flatten(props.style) || {};

    if (shouldPreserveFont(flat.fontFamily)) {
      return <RNTextInput {...props} ref={ref} />;
    }

    const { fontFamily, cleanClassName } = resolveFontAndClass(props.style, props.className);
    
    // Strip fontWeight and fontStyle to prevent Android from falling back to system font
    const { fontWeight, fontStyle, ...cleanStyle } = flat as any;

    return (
      <RNTextInput
        {...props}
        className={cleanClassName}
        style={[cleanStyle, { fontFamily }]}
        ref={ref}
      />
    );
  }
);
TextInput.displayName = "TextInput";
