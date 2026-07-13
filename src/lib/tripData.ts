import { supabase } from "./supabase";

export type TimeSlot = "morning" | "afternoon" | "evening";
export type ActivityCategory = "transport" | "food" | "sightseeing" | "shopping" | "leisure" | "work";
export type TodoCategory = "flight" | "hotel" | "booking" | "packing" | "money" | "health" | "info" | "food";
export type TodoPriority = "high" | "mid" | "low";

export interface Member {
  id: string;
  name: string;
  isEveryone: boolean;
  sortOrder: number;
}

export interface Activity {
  id: number;
  time: string | null;
  slot: TimeSlot;
  title: string;
  place: string | null;
  duration: string | null;
  category: ActivityCategory;
  note: string | null;
  highlight: boolean;
  memberIds: string[];
}

export interface Day {
  id: number;
  cityId: number;
  dayNumber: number;
  date: string;
  label: string;
  heroPhotoUrl: string | null;
  activities: Activity[];
}

export interface City {
  id: number;
  code: string;
  label: string;
  labelEn: string;
  colorToken: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
  sortOrder: number;
  days: Day[];
}

export interface Todo {
  id: number;
  tripId: number;
  text: string;
  category: TodoCategory;
  done: boolean;
  priority: TodoPriority;
  sortOrder: number;
}

export interface Trip {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface TripData {
  trip: Trip;
  members: Member[];
  cities: City[];
  todos: Todo[];
}

const slotOrder: Record<TimeSlot, number> = { morning: 0, afternoon: 1, evening: 2 };

function sortActivities(a: Activity, b: Activity) {
  if (a.slot !== b.slot) return slotOrder[a.slot] - slotOrder[b.slot];
  if (a.time !== b.time) {
    if (a.time === null) return 1;
    if (b.time === null) return -1;
    return a.time < b.time ? -1 : 1;
  }
  return a.id - b.id;
}

export async function fetchTripData(code: string): Promise<TripData | null> {
  const { data: trip } = await supabase
    .from("trips")
    .select("id, code, name, start_date, end_date")
    .eq("code", code)
    .maybeSingle();

  if (!trip) return null;

  const [{ data: members }, { data: cities }, { data: todos }] = await Promise.all([
    supabase.from("members").select("id, name, is_everyone, sort_order").order("sort_order"),
    supabase
      .from("cities")
      .select(
        "id, code, label, label_en, color_token, start_date, end_date, member_ids, sort_order, " +
          "days(id, city_id, day_number, date, label, hero_photo_url, " +
          "activities(id, time, slot, title, place, duration, category, note, highlight, member_ids))"
      )
      .eq("trip_id", trip.id)
      .order("sort_order"),
    supabase
      .from("todos")
      .select("id, trip_id, text, category, done, priority, sort_order")
      .eq("trip_id", trip.id)
      .order("sort_order"),
  ]);

  return {
    trip: {
      id: trip.id,
      code: trip.code,
      name: trip.name,
      startDate: trip.start_date,
      endDate: trip.end_date,
    },
    members: (members ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      isEveryone: m.is_everyone,
      sortOrder: m.sort_order,
    })),
    cities: (cities ?? [])
      .map((c) => ({
        id: c.id,
        code: c.code,
        label: c.label,
        labelEn: c.label_en,
        colorToken: c.color_token,
        startDate: c.start_date,
        endDate: c.end_date,
        memberIds: c.member_ids ?? [],
        sortOrder: c.sort_order,
        days: (c.days ?? [])
          .map((d: any) => ({
            id: d.id,
            cityId: d.city_id,
            dayNumber: d.day_number,
            date: d.date,
            label: d.label,
            heroPhotoUrl: d.hero_photo_url,
            activities: (d.activities ?? [])
              .map((a: any) => ({
                id: a.id,
                time: a.time,
                slot: a.slot,
                title: a.title,
                place: a.place,
                duration: a.duration,
                category: a.category,
                note: a.note,
                highlight: a.highlight,
                memberIds: a.member_ids ?? [],
              }))
              .sort(sortActivities) as Activity[],
          }))
          .sort((a: Day, b: Day) => a.dayNumber - b.dayNumber) as Day[],
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    todos: (todos ?? []).map((t) => ({
      id: t.id,
      tripId: t.trip_id,
      text: t.text,
      category: t.category,
      done: t.done,
      priority: t.priority,
      sortOrder: t.sort_order,
    })),
  };
}

export async function toggleTodoDb(id: number, done: boolean) {
  return supabase.from("todos").update({ done }).eq("id", id);
}

export async function removeTodoDb(id: number) {
  return supabase.from("todos").delete().eq("id", id);
}

export async function addTodoDb(tripId: number, text: string, sortOrder: number) {
  return supabase
    .from("todos")
    .insert({ trip_id: tripId, text, category: "info", done: false, priority: "mid", sort_order: sortOrder })
    .select("id, trip_id, text, category, done, priority, sort_order")
    .single();
}
