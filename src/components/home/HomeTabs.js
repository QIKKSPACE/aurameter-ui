import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  Pressable,
} from "react-native";
import Swiper from "react-native-swiper";

import AppText from "../AppText";
import { styles } from "./styles";
import { useTheme } from "../../constants/context/ThemeContext";
import { useSelector } from "react-redux";
import { selectHomeBanners } from "../../store/bannerSlice";

const { width } = Dimensions.get("window");

const tabs = ["Campus", "Global", "Follow"];

const HomeTabs = ({ activeTab, onChange }) => {
  const { theme } = useTheme();

  const homeBanners = useSelector(selectHomeBanners);

  const openBanner = async banner => {
    const url = banner?.ctaLinks?.[0];

    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log(e);
    }
  };

  const bannerImages = homeBanners.flatMap(
    banner => banner?.home || []
  );

  return (
    <>
      {/* Tabs */}

      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
          >
            <AppText
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab
                      ? theme.text.primary
                      : theme.text.secondary,
                },
              ]}
            >
              {tab.toUpperCase()}
            </AppText>

            {activeTab === tab && (
              <View
                style={[
                  styles.activeTabIndicator,
                  {
                    backgroundColor: theme.text.accent,
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Banner */}

      {homeBanners.length > 0 && (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 12,
            height: 160,
            borderRadius: 20,
            overflow: "hidden",
            elevation: 6,
            marginBottom: 20,
          }}
        >
          {bannerImages.length === 1 ? (
            <Pressable
              onPress={() => openBanner(homeBanners[0])}
            >
              <Image
                source={{ uri: bannerImages[0] }}
                resizeMode="cover"
                style={{
                  width: "100%",
                  height: 160,
                }}
              />
            </Pressable>
          ) : (
            <Swiper
              autoplay
              autoplayTimeout={4}
              showsPagination
              loop
            >
              {homeBanners.map(banner =>
                (banner.home || []).map(image => (
                  <Pressable
                    key={image}
                    onPress={() => openBanner(banner)}
                  >
                    <Image
                      source={{ uri: image }}
                      resizeMode="cover"
                      style={{
                        width: width - 30,
                        height: 160,
                      }}
                    />
                  </Pressable>
                ))
              )}
            </Swiper>
          )}
        </View>
      )}
    </>
  );
};

export default HomeTabs;