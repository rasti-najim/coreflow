import { useAuth } from "@/components/auth-context";
import supabase from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TimelineItem = {
  id: string;
  date: string;
  type: ("picture" | "session" | "mood")[];
  duration?: string;
  note?: string;
  photoUrl?: string;
};

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  // const timelineData: TimelineItem[] = [
  //   {
  //     date: "11/6",
  //     type: ["picture"],
  //     photoUrl: "https://picsum.photos/400/300",
  //   },
  //   { date: "11/7", type: ["session"], duration: "10m Session" },
  //   { date: "11/9", type: ["session"], duration: "10m Session" },
  //   { date: "11/11", type: ["session"], duration: "10m Session" },
  //   {
  //     date: "11/13",
  //     type: ["mood"],
  //     content: "mood has been great and starting to see abs! :)",
  //   },
  //   { date: "11/16", type: ["session"], duration: "15m Session" },
  //   {
  //     date: "11/18",
  //     type: ["picture"],
  //     photoUrl: "https://picsum.photos/400/300?random=2",
  //   },
  //   { date: "11/20", type: ["session"], duration: "15m Session" },
  //   { date: "11/22", type: ["session"], duration: "15m Session" },
  //   { date: "11/24", type: ["session"], duration: "15m Session" },
  //   { date: "11/26", type: ["session"], duration: "15m Session" },
  //   { date: "11/28", type: ["session"], duration: "15m Session" },
  //   { date: "11/30", type: ["session"], duration: "15m Session" },
  //   {
  //     date: "12/2",
  //     type: ["session", "picture"],
  //     duration: "15m Session",
  //     photoUrl: "https://picsum.photos/400/300?random=3",
  //   },
  //   {
  //     date: "12/4",
  //     type: ["session", "mood", "picture"],
  //     duration: "15m Session",
  //     content: "mood has been great and starting to see abs! :)",
  //     photoUrl: "https://picsum.photos/400/300?random=4",
  //   },
  //   {
  //     date: "12/6",
  //     type: ["session", "mood", "picture"],
  //     duration: "15m Session",
  //     content: "mood has been great and starting to see abs! :)",
  //     photoUrl: "https://picsum.photos/400/300?random=5",
  //   },
  //   {
  //     date: "12/8",
  //     type: ["session", "mood"],
  //     duration: "15m Session",
  //     content: "mood has been great and starting to see abs! :)",
  //   },
  // ];

  const handleViewProgress = (type: "photo" | "note") => {
    // Handle viewing progress
    console.log(`View ${type} progress`);
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      // 1. First get progress data
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      // 2. Map base data with unique IDs
      const mappedData = data?.map((item) => ({
        id: item.id, // Add unique ID from the progress entry
        date: new Date(item.created_at)
          .toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          })
          .replace("/", "/"),
        type: [item.entry_type],
        note: item.mood_description,
        photoUrl: undefined,
      }));

      setTimelineData(mappedData || []);

      // 3. Handle photos with private storage
      const photoPromises = data
        ?.filter((item) => item.picture_url)
        .map(async (item) => {
          try {
            const { data: imageData, error } = await supabase.storage
              .from("photo-progress")
              .download(`${user.id}/${item.picture_url}`);

            if (error) throw error;

            // Convert blob to base64
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(imageData);
              reader.onload = () => {
                resolve({
                  id: item.id, // Use ID instead of date for matching
                  photoUrl: reader.result as string,
                });
              };
              reader.onerror = reject;
            });
          } catch (error) {
            console.error("Error downloading photo:", error);
          }
        });

      // 4. Update state with photo URLs using ID matching
      if (photoPromises) {
        const photoResults = await Promise.all(photoPromises);

        setTimelineData((prev) =>
          prev.map((item) => {
            const photoData = photoResults.find((p) => p?.id === item.id);
            return photoData ? { ...item, photoUrl: photoData.photoUrl } : item;
          })
        );
      }
    };

    fetchTimeline();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 40 }]}>
      <Text style={[styles.title]}>timeline</Text>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {timelineData.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.content}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.description}>
                  {item.type
                    .map((type) =>
                      type === "picture"
                        ? "Photo"
                        : type === "session"
                        ? item.duration
                        : "Note"
                    )
                    .join(" & ")}
                </Text>
                {item.photoUrl && (
                  <Image source={{ uri: item.photoUrl }} style={styles.photo} />
                )}
                {item.note && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText}>"{item.note}"</Text>
                  </View>
                )}
                {item.type.includes("picture") ||
                  (item.type.includes("mood") && (
                    <Pressable
                      style={styles.viewProgressButton}
                      // onPress={() => handleViewProgress(item.type)}
                    >
                      <Text style={styles.viewProgressText}>
                        view {item.type} progress
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <LinearGradient
        colors={["rgba(255, 233, 213, 0)", "#FFE9D5"]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE9D5",
    paddingHorizontal: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A2B29",
    marginBottom: 40,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 60,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#4A2B29",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A2B29",
    marginRight: 15,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A2B29",
  },
  description: {
    fontSize: 16,
    color: "#4A2B29",
  },
  noteContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    backgroundColor: "#FFF1E4",
    borderWidth: 1,
    borderColor: "#E8B892",
    shadowColor: "#4A2B29",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noteText: {
    color: "#4A2B29",
    fontSize: 16,
    lineHeight: 22,
    fontStyle: "italic",
  },
  viewProgressButton: {
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    backgroundColor: "#4A2B29",
    alignSelf: "flex-start",
  },
  viewProgressText: {
    color: "#FFE9D5",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
});
