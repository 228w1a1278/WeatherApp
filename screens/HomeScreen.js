import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Image, ScrollView } from "react-native";
import { theme } from "../themes/ind";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";
import { storeData, getData } from "../utils/asyncStorage";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
  },
  searchSection: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    position: "relative",
    zIndex: 50,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 50,
  },
  searchInput: {
    paddingLeft: 24,
    height: 40,
    paddingBottom: 4,
    flex: 1,
    fontSize: 16,
    color: "white",
  },
  searchButton: {
    borderRadius: 50,
    padding: 12,
    margin: 4,
  },
  searchResults: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#d1d5db",
    top: 64,
    borderRadius: 24,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchResultBorder: {
    borderBottomWidth: 2,
    borderBottomColor: "#9ca3af",
  },
  searchResultText: {
    color: "black",
    fontSize: 18,
    marginLeft: 8,
  },
  forecastSection: {
    marginHorizontal: 16,
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  locationText: {
    color: "white",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  countryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d1d5db",
  },
  weatherImageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  weatherImage: {
    width: 150,
    height: 150,
  },
  temperatureSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  temperatureText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    fontSize: 48,
  },
  conditionText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    letterSpacing: 1,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    height: 24,
    width: 24,
    marginRight: 8,
  },
  statText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  dailyForecastSection: {
    marginBottom: 20,
  },
  dailyForecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  dailyForecastText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  scrollView: {
    paddingHorizontal: 15,
  },
  forecastCard: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    borderRadius: 24,
    paddingVertical: 12,
    marginRight: 16,
  },
  forecastIcon: {
    height: 44,
    width: 44,
    marginBottom: 4,
  },
  forecastDay: {
    color: "white",
    marginBottom: 4,
  },
  forecastTemp: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [Loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    console.log("location", loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      if (data) {
        setWeather(data);
      }
      setLoading(false);
      storeData("city", loc.name);
    });
  };

 const handleSearch = (value) => {
  if (value.length) {
    fetchLocations({ cityName: value }).then((data) => {
      if (data && data.length > 0) {
        setLocations(data);
      } else {
        setLocations([]);
        Alert.alert("City Not Found", "Please enter a valid city name.");
      }
    });
  }
};
;

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Mumbai";
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      if (data) {
        setWeather(data);
      }
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/weather-app-assets/images/bg.png")}
        style={styles.backgroundImage}
      />
      {Loading ? (
        <View style={styles.loadingContainer}>
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {/* search section */}
          <View style={styles.searchSection}>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                },
              ]}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={"lightgray"}
                  style={styles.searchInput}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={[
                  styles.searchButton,
                  { backgroundColor: theme.bgWhite(0.3) },
                ]}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.searchResults}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={[
                        styles.searchResultItem,
                        showBorder && styles.searchResultBorder,
                      ]}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text style={styles.searchResultText}>
                        {loc?.name},{loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          {/* forecast section */}
          <View style={styles.forecastSection}>
            {/* location */}
            <Text style={styles.locationText}>
              {location?.name}
              <Text style={styles.countryText}>
                {location?.country ? `, ${location.country}` : ""}
              </Text>
            </Text>
            {/* weather image */}
            <View style={styles.weatherImageContainer}>
              <Image
                source={
                  weatherImages[current?.condition?.text] ||
                  weatherImages["other"]
                }
                style={styles.weatherImage}
              />
            </View>
            {/* degree celcius */}
            <View style={styles.temperatureSection}>
              <Text style={styles.temperatureText}>
                {current?.temp_c}&#176;
              </Text>
              <Text style={styles.conditionText}>
                {current?.condition?.text}
              </Text>
            </View>
            {/* other stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image
                  source={require("../assets/weather-app-assets/icons/wind.png")}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>{current?.wind_kph}Km</Text>
              </View>

              <View style={styles.statItem}>
                <Image
                  source={require("../assets/weather-app-assets/icons/drop.png")}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>{current?.humidity}%</Text>
              </View>

              <View style={styles.statItem}>
                <Image
                  source={require("../assets/weather-app-assets/icons/sun.png")}
                  style={styles.statIcon}
                />
                <Text style={styles.statText}>
                  {weather?.forecast?.forecastday?.[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* forecast for next days */}
          <View style={styles.dailyForecastSection}>
            <View style={styles.dailyForecastHeader}>
              <CalendarDaysIcon size="22" color="white" />
              <Text style={styles.dailyForecastText}>Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={styles.scrollView}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];
                return (
                  <View
                    key={index}
                    style={[
                      styles.forecastCard,
                      { backgroundColor: theme.bgWhite(0.15) },
                    ]}
                  >
                    <Image
                      source={
                        weatherImages[item?.day?.condition?.text] ||
                        weatherImages["other"]
                      }
                      style={styles.forecastIcon}
                    />
                    <Text style={styles.forecastDay}>{dayName}</Text>
                    <Text style={styles.forecastTemp}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
