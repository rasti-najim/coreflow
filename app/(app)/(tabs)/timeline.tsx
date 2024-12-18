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
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { DateTime } from "luxon";
import { PhotoSkeleton } from "@/components/photo-skeleton";

type TimelineItem = {
  id: string;
  date: string;
  type: ("picture" | "session" | "mood")[];
  duration?: string;
  note?: string;
  photoUrl?: string;
};

const groupByDate = (items: TimelineItem[]): Record<string, TimelineItem[]> => {
  return items.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, TimelineItem[]>);
};

export default function Page() {
  const { user } = useAuth();
  const safeArea = useSafeAreaInsets();
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const fetchBasicData = async () => {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const mappedData = data?.map((item) => ({
      id: item.id,
      date: DateTime.fromISO(item.added_on).toFormat("MM/dd"),
      type: [item.entry_type],
      note: item.mood_description,
      photoUrl: undefined,
    }));

    setTimelineData(mappedData || []);

    if (data?.some((item) => item.picture_url)) {
      setIsLoadingPhotos(true);
      loadPhotos(data);
    }
  };

  const loadPhotos = async (data: any[]) => {
    const photoPromises = data
      .filter((item) => item.picture_url)
      .map(async (item) => {
        try {
          const { data: imageData, error } = await supabase.storage
            .from("photo-progress")
            .download(`${user.id}/${item.picture_url}`);

          if (error) throw error;

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageData);
            reader.onload = () => {
              resolve({
                id: item.id,
                photoUrl: reader.result as string,
              });
            };
            reader.onerror = reject;
          });
        } catch (error) {
          console.error("Error downloading photo:", error);
          return null;
        }
      });

    const photoResults = await Promise.all(photoPromises);

    setTimelineData((prev) =>
      prev.map((item) => {
        const photoData = photoResults.find((p) => p?.id === item.id);
        return photoData ? { ...item, photoUrl: photoData.photoUrl } : item;
      })
    );
    setIsLoadingPhotos(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBasicData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBasicData();
  }, []);

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const handleViewProgress = (type: "photo" | "note") => {
    // Handle viewing progress
    console.log(`View ${type} progress`);
  };

  return (
    <View style={[styles.container, { paddingTop: safeArea.top + 40 }]}>
      <Text style={[styles.title]}>timeline</Text>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {Object.entries(groupByDate(timelineData)).map(([date, items]) => (
            <View key={date} style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.content}>
                <Text style={styles.date}>{date}</Text>
                {items.map((item, index) => (
                  <View key={item.id + index}>
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
                    {item.type.includes("picture") && (
                      <>
                        {!item.photoUrl ? (
                          <PhotoSkeleton
                            width="100%"
                            height={200}
                            borderRadius={8}
                          />
                        ) : (
                          <Image
                            source={{ uri: item.photoUrl }}
                            style={styles.photo}
                          />
                        )}
                      </>
                    )}
                    {item.note && (
                      <View style={styles.noteContainer}>
                        <Text style={styles.noteText}>
                          "{item.note}"
                          {/* {item.note.length > 100
                            ? item.note.substring(0, 100) + "..."
                            : item.note} */}
                        </Text>
                      </View>
                    )}
                    {(item.type.includes("picture") ||
                      item.type.includes("mood")) && (
                      <Pressable
                        style={styles.viewProgressButton}
                        onPress={() =>
                          handleViewProgress(item.type[0] as "photo" | "note")
                        }
                      >
                        <Text style={styles.viewProgressText}>
                          view {item.type} progress
                        </Text>
                      </Pressable>
                    )}
                  </View>
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
    gap: 8,
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
