// [lng, lat] coordinates for common destinations
const COORDS: Array<{ cities: string[]; countries: string[]; coords: [number, number] }> = [
  { cities: ["okinawa", "naha", "ishigaki", "miyako"], countries: ["japan"], coords: [127.6809, 26.2124] },
  { cities: ["tokyo", "shinjuku", "shibuya", "akihabara", "harajuku"], countries: [], coords: [139.6917, 35.6895] },
  { cities: ["kyoto", "osaka", "nara", "kobe"], countries: [], coords: [135.7681, 35.0116] },
  { cities: ["hiroshima"], countries: [], coords: [132.4596, 34.3853] },
  { cities: ["sapporo", "hokkaido"], countries: [], coords: [141.3544, 43.0618] },
  { cities: ["fukuoka"], countries: [], coords: [130.4017, 33.5904] },
  { cities: ["seoul", "incheon", "busan", "jeju"], countries: ["korea", "south korea"], coords: [126.9780, 37.5665] },
  { cities: ["busan"], countries: [], coords: [129.0756, 35.1796] },
  { cities: ["bangkok", "phuket", "chiang mai", "pattaya"], countries: ["thailand"], coords: [100.5018, 13.7563] },
  { cities: ["bali", "denpasar", "ubud"], countries: ["indonesia"], coords: [115.1889, -8.4095] },
  { cities: ["singapore"], countries: ["singapore"], coords: [103.8198, 1.3521] },
  { cities: ["hong kong"], countries: ["hong kong"], coords: [114.1694, 22.3193] },
  { cities: ["taipei", "taichung", "kaohsiung"], countries: ["taiwan"], coords: [121.5654, 25.0330] },
  { cities: ["sydney", "melbourne", "brisbane", "perth"], countries: ["australia"], coords: [151.2093, -33.8688] },
  { cities: ["paris"], countries: ["france"], coords: [2.3522, 48.8566] },
  { cities: ["london"], countries: ["uk", "united kingdom", "england"], coords: [-0.1276, 51.5074] },
  { cities: ["rome", "florence", "venice", "milan", "naples"], countries: ["italy"], coords: [12.4964, 41.9028] },
  { cities: ["barcelona", "madrid", "seville"], countries: ["spain"], coords: [2.1734, 41.3851] },
  { cities: ["amsterdam"], countries: ["netherlands"], coords: [4.9041, 52.3676] },
  { cities: ["berlin", "munich", "hamburg"], countries: ["germany"], coords: [13.4050, 52.5200] },
  { cities: ["lisbon", "porto"], countries: ["portugal"], coords: [-9.1393, 38.7223] },
  { cities: ["zurich", "geneva", "bern"], countries: ["switzerland"], coords: [8.5417, 47.3769] },
  { cities: ["prague"], countries: ["czech republic", "czechia"], coords: [14.4208, 50.0880] },
  { cities: ["vienna"], countries: ["austria"], coords: [16.3738, 48.2082] },
  { cities: ["dubai", "abu dhabi"], countries: ["uae", "united arab emirates"], coords: [55.2708, 25.2048] },
  { cities: ["new york", "nyc", "brooklyn", "manhattan"], countries: [], coords: [-74.0060, 40.7128] },
  { cities: ["los angeles", "la", "santa monica", "hollywood"], countries: [], coords: [-118.2437, 34.0522] },
  { cities: ["san francisco", "sf", "bay area"], countries: [], coords: [-122.4194, 37.7749] },
  { cities: ["chicago"], countries: [], coords: [-87.6298, 41.8781] },
  { cities: ["miami", "miami beach"], countries: [], coords: [-80.1918, 25.7617] },
  { cities: ["honolulu", "maui", "hawaii", "kauai", "big island"], countries: [], coords: [-157.8583, 21.3069] },
  { cities: ["cancun", "playa del carmen", "tulum"], countries: ["mexico"], coords: [-86.8515, 21.1619] },
  { cities: ["mexico city"], countries: ["mexico"], coords: [-99.1332, 19.4326] },
  { cities: ["toronto", "vancouver", "montreal"], countries: ["canada"], coords: [-79.3832, 43.6532] },
];

const DEFAULT: [number, number] = [0, 20]; // world center fallback

export function getDestinationCoords(
  city: string | null | undefined,
  country: string | null | undefined,
): [number, number] {
  const c = (city ?? "").toLowerCase().trim();
  const co = (country ?? "").toLowerCase().trim();

  for (const entry of COORDS) {
    // City match (substring)
    if (c && entry.cities.some((ec) => c.includes(ec) || ec.includes(c))) {
      return entry.coords;
    }
    // Country match
    if (co && entry.countries.some((ec) => co.includes(ec) || ec.includes(co))) {
      return entry.coords;
    }
  }

  return DEFAULT;
}
